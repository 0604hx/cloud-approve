const { scheduleJob } = require('node-schedule')

const logger = require("../common/logger")
const config = require("../config")
const { OpLog } = require("../db")
const { ADD_ON } = require("../fields")

const log = (...ps)=> logger.info(`[SCHEDULE]`, ...ps)

/**
 * 清除旧的操作日志
 */
const cleanOpLogSchedule = async ()=>{
    log(`开始清理过期（超${config.sys.logMax}天）日志...`)
    let time = Date.now() -  config.sys.logMax * 24 * 60 * 60 * 1000
    let result = await OpLog.query().where(ADD_ON, "<", time).delete()
    if(result>0)
        log(`清除过期（超${config.sys.logMax}天）${result}条`)
}

exports.startScheduleTasks = ()=>{
    //每日凌晨1点运行清理日志的任务
    scheduleJob("0 0 1 * * ?", cleanOpLogSchedule)
}
