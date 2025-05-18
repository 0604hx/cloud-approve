const { readFileSync, existsSync, statSync, watch } = require('node:fs')
const { debounce, merge } = require('lodash')
const logger = require('./common/logger')
const { CONFIG_FILE } = require('./fields')

const configFile = CONFIG_FILE

const config = {
    port: 10001,
    cors: !global.isPro ?? false,
    dataDir: "data",        //附近保存路径
    wwwDir: "www",          //静态资源目录
    wwwPrefix: "/www/",     //静态资源前缀，默认 /
    app:{
        textAutoApprove: "同意"
    },
    img: {
        toWebp: true,       //是否转换为 webp 格式
        exts: ["JPG","PNG","JPEG"],
        quality: 60,        //webp 质量（0到100）
    },
    db: {
        prefix: "",
        type: "sqlite3",
        host: "localhost",
        port: 3306,
        user: "root",
        password: "",
        database: "cloud-approve",
        uri:"",
        file:"approve.db"
    },
    secret: {
        autoInit: true,
        adminAccount: "admin",
        pwdRetryMax: 3,
        sm4Key: "6e8fdcf1f6823938af8a09b878fa77f3",
        jwtKey: "0a9c89fa6304f4764be94ae9cda1ecbd",
        jwtExpire: process.env.NODE_ENV === 'production'? "12h" : "365d",
        // 携带 JWT 的请求头名称，请填写小写
        header: "cua",
    },
    http: {
        // /common/** 资源的缓存时间，设置小于等于0则不推荐缓存头
        commonExpire: 3600
    },
    func: {
        enable: false,          //是否开启动态函数
        isolated: false,        //是否使用隔离环境
    },
    sys :{
        log: true,              //是否记录操作日志
        logMax: 360,            //日志存活天数
    }
}

// class AppConfig {
//     port    = 10001
//     cors    = !global.isPro ?? false,
//     db      = {
//         type: "sqlite3",
//         host: "localhost",
//         port: 3306,
//         user: "root",
//         password: "",
//         database: "cloud-approve",
//         uri:"",
//         file:"approve.db"
//     }
//     secret  = {
//         sm4Key: "6e8fdcf1f6823938af8a09b878fa77f3",
//         jwtKey: "0a9c89fa6304f4764be94ae9cda1ecbd",
//         // 携带 JWT 的请求头名称
//         header: "CUA",
//     }
// }

// const config = new AppConfig()

const loadConfig = ()=> {
    let fileCfg = JSON.parse(readFileSync(configFile, { encoding: 'utf-8' }))
    merge(config, fileCfg)
    return fileCfg
}

//仅当生产模式才监听配置文件的变动
if(global.isPro && existsSync(configFile) && statSync(configFile).isFile()){
    let fileCfg = loadConfig()
    //开启监听
    const onConfigChange = debounce(()=>{
        logger.info("监听到配置文件变化 :)", configFile)
        loadConfig()
    }, 1000)

    watch(configFile, onConfigChange)

    global.isDebug && logger.debug(`从${configFile}中读取配置文件`, fileCfg)
}

module.exports = config
