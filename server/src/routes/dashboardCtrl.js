const { Status } = require("../beans")
const { success } = require("../common")
const { Process } = require("../db")
const { Roles } = require("../fields")
const { mineOverview, countOfData } = require("../service/CacheService")
const { needSid, withStaff, needRole } = require("./web-helper")

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/dashboard/mine", async req=>success(await mineOverview(needSid(req))))

    app.post("/dashboard/company", async req=>{
        needRole(req, Roles.COMPANY_ADMIN)

        return withStaff(req, async staff=>{
            let data = await countOfData(staff.cid)
            return success({ data })
        })
    })
}
