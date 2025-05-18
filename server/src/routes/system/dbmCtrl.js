const NodeCache = require('node-cache')
const { AuthBean } = require("../../beans")
const { success, assert } = require("../../common")
const { createSm4Key, sm4Decrypt } = require("../../common/secret")
const logger = require('../../common/logger')
const { runSQL } = require('../../db/schema')
const { needRole } = require('../web-helper')

const cache = new NodeCache({stdTTL:1800, useClones:false, checkperiod: 0})

/**
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/system/dbm-secret", req=>{
        needRole(req)
        let key = createSm4Key()
        cache.set(req.user.id, key)
        return success(key)
    })

    app.post("/system/dbm-run", async req=>{
        needRole(req)

        let { text } = req.body
        /**@type {AuthBean} */
        let user = req.user
        //解密
        let key = cache.get(user.id)
        assert.hasText(key, `参数异常`)

        const sql = sm4Decrypt(text, key)
        logger.info(`${user.fullName} 尝试执行SQL`, sql)

        return success(await runSQL(sql))
    })
}
