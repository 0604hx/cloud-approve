import { readFileSync } from 'node:fs'
import { defineConfig, logger, RsbuildPluginAPI } from '@rsbuild/core'
import { Compiler, sources } from 'webpack'

const pkg = JSON.parse(readFileSync("./package.json"))

logger.override({
    warn: msg=>logger.info(msg.split("\n")[0],`${msg.length}字的警告信息被隐藏...`)
})

const distFilename = `${pkg.name}.js`//`cloud-approve-${pkg.name}.js`
const VERSION = ()=>{
    let now = new Date
    return `v${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
}

export default defineConfig({
    source:{
        entry:{ index: './src/app.js' },
        define:{
            "VERSION": JSON.stringify(VERSION())
        }
    },
    output:{
        copy:[
            { from: "./node_modules/svg-captcha/fonts/Comismsh.ttf", to:"lib/Comismsh.ttf" },
            { from: "./node_modules/better-sqlite3/build/Release/better_sqlite3.node", to:"lib"},
            { from: "./node_modules/isolated-vm/out/isolated_vm.node", to:"lib"}
        ],
        legalComments:"none",
        target:"node",
        // charset: 'ascii',
        /**
         * 使用 Objection.js 和 Knex 时，Knex 会尝试加载其他数据库的依赖（如 pg、mysql 等）
         * 即使你只使用了 sqlite3。这些数据库驱动默认在 Knex 的代码中被 require，
         * 但未实际安装，导致在使用打包工具（如 rsbuild）时报错
         */
        externals:[
            'sharp',
            './out/isolated_vm',
            'pg', 'pg-query-stream','oracledb', 'tedious', 'sqlite3', 'mysql'
        ],
        filename:{
            js: distFilename
        }
    },
    plugins:[
        {
            name:"replace-require-path",
            /**
             *
             * @param {RsbuildPluginAPI} api
             */
            setup (api){
                api.onAfterCreateCompiler(({compiler})=>{
                    compiler.hooks.compilation.tap('ModifyCodePlugin', compilation=>{
                        compilation.hooks.processAssets.tap(
                            {
                                name: 'ModifyCodePlugin',
                                stage: Compiler.PROCESS_ASSETS_STAGE_ADDITIONS, // 在资源处理阶段修改代码
                            },
                            assets=>{
                                // 遍历所有资源文件
                                for (const [filename, source] of Object.entries(assets)) {
                                    if (filename == distFilename) {
                                        // 修改 JavaScript 文件内容
                                        const newContent = source
                                            .source()
                                            .toString()
                                            .replace('./out/isolated_vm', './lib/isolated_vm')
                                            .replace('../fonts/Comismsh.ttf', './lib/Comismsh.ttf');
                                        compilation.updateAsset(filename, new sources.RawSource(newContent));
                                    }
                                }
                            }
                        )
                    })
                })
            }
        }
    ]
})

