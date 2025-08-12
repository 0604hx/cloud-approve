global.showSQL ??= false

const { Knex } = require("knex")
const config = require("../config")
const { setupDB, getKnex } = require("../db")
const logger = require("../common/logger")

/**
 * @callback InitWorker
 * @param {Knex} knex
 */

/**
 * @param {InitWorker} worker
 * @param {String} name
 */
exports.withDB = (worker, name)=>{
    setupDB(config)

    let jobName = name ? ` <${name}> `:""
    new Promise(async (ok, fail)=>{
        logger.debug(`作业${jobName}开始`)
        try{
            ok(await worker(getKnex()))
        }catch(e){
            logger.error(`作业${jobName}出错`, e)
            process.exit()
        }
    }).then(d=>{
        logger.debug(`作业${jobName}完成`, d)

        process.exit()
    })
}
