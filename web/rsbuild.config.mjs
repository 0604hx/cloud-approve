import { defineConfig } from "@rsbuild/core"
import { pluginVue } from "@rsbuild/plugin-vue"

import AutoImport from 'unplugin-auto-import/rspack'
import Components from 'unplugin-vue-components/rspack'
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"

import pkg from './package.json'

const isProduction = process.env.NODE_ENV === 'production'
const base = isProduction?"/www/":"/"

const buildVersion = ()=>{
    let now = new Date
    return `v${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}`
}
const version = isProduction? buildVersion() : 'DEV'

export default defineConfig({
    source:{
        alias:{
            "@"             : "./src",
            "@V"            : "./src/views",
            "@C"            : "./src/components",
            "@CF"           : "./src/components/functions",
            "@S"            : "./src/service",
            "@CW"           : "./src/components/widget",
            "@CA"           : "./src/components/app",
            '@Pagination'   : "./src/components/mixin/Pagination",
            "@VW"           : "./src/views/widget",
            "@CODE"         : "./src/components/code.mirror.vue"
        },
        define:{
            "_VERSION_"         : JSON.stringify(version),
            "_AUTHOR_"          : JSON.stringify(pkg.author),
            "APP_TITLE"         : JSON.stringify(pkg.cnName),
            "APP_CONTEXT"       : JSON.stringify(""),
            "BASE_URL"          : JSON.stringify(base),
        },
        entry:{
            index: './src/index.js',
            dingding: './src/pages/dingding/index.js'
        }
    },
    html:{
        title: ({ entryName })=>{
            const titles = { dingding:"钉钉自动登录" }
            return `${titles[entryName]||pkg.cnName} · ${version}`
        },
        favicon: "./public/logo.png"
    },
    server:{
        base,
        port: 10000,
        host: "localhost",
        proxy:{
            context:['/common', '/auth','/flow','/process','/system','/company', '/dashboard'],
            target:"http://localhost:10001"
        }
    },
    output:{
        cleanDistPath: true,
        distPath:{
            js:"js",
            css:"css"
        },
        legalComments: 'none'
    },
    plugins:[
        pluginVue(),
    ],
    tools:{
        rspack:{
            plugins: [
                AutoImport({ imports:['vue', 'vue-router'], dts: false }),
                //按需导入 naive-ui
                Components({ resolvers: [NaiveUiResolver()] })
            ]
        }
    }
})
