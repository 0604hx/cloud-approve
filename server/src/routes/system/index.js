const dbmCtrl = require("./dbmCtrl")
const funcSycCtrl = require("./funcSycCtrl")
const processSysCtrl = require("./processSysCtrl")
const sysStaff = require("./staffSysCtrl")
const systemCtrl = require("./systemCtrl")

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    sysStaff(app)
    processSysCtrl(app)
    dbmCtrl(app)
    funcSycCtrl(app)
    systemCtrl(app)
}
