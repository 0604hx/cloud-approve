const cmdArgs = process.argv.splice(2)

//定义全局变量
global.isPro = process.env.NODE_ENV === 'production'
global.isDebug = global.isDebug ??= !global.isPro
global.showSQL = cmdArgs.includes("--sql")

const { writeFileSync } = require('node:fs')
const { setupApp } = require("./common/fastify")
const logger = require("./common/logger")
const config = require("./config")
const { setupDB } = require("./db")
const { createTableIfNotExist } = require("./db/schema")
const routes = require("./routes")
const { AccountService } = require("./service")
const { CONFIG_FILE } = require('./fields')
const { createSm4Key } = require('./common/secret')
const { cloneDeep } = require('lodash')
const { startScheduleTasks } = require('./service/ScheduleService')

if(cmdArgs.includes("--config")){
    //创建 config.json 文件
    let cfg = cloneDeep(config)
    cfg.secret.sm4Key = createSm4Key()
    cfg.secret.jwtKey = createSm4Key()

    writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 4), { encoding: 'utf-8' })
    logger.info(`写入配置内容到配置文件 ${CONFIG_FILE}，如需调整请自行修改 :)`)
    process.exit(0)
}
if(cmdArgs.includes("--key")){
    logger.info(`随机生成SM4密钥`, createSm4Key())
    process.exit(0)
}

setupDB(config)

const dealError = (e, msg="")=>{
    logger.error(msg, e)
    process.exit(-1)
}

if(cmdArgs.includes("--init")){
    // 初始化数据库
    (async ()=>{
        await createTableIfNotExist().catch(dealError)
        await AccountService.initForAdminAccount(config.secret.adminAccount).catch(dealError)
        process.exit(0)
    })()
}
else{
    const app = setupApp(config)
    routes(app)

    app.listen({ port: config.port }, (err) => {
        if (err) {
            logger.error(err)
            process.exit(1)
        }

        startScheduleTasks()

        if(global.showSQL)  logger.info(`SHOW-SQL = true`)

        const v = process.env.VERSION?` (build on ${process.env.VERSION})`:""
        logger.info(`APP STARTED ON PORT ${config.port}${v} ^.^`)
    })
}
