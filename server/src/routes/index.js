const auth = require("./authCtrl")
const common = require("./commonCtrl")
const dashboard = require("./dashboardCtrl")
const flow = require("./flowCtrl")
const process = require("./processCtrl")
const company = require("./companyCtrl")
const system = require("./system")
const wwwCtrl = require("./wwwCtrl")
const thirdCtrl = require("./3rdCtrl")

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    wwwCtrl(app)
    common(app)
    auth(app)
    flow(app)
    process(app)
    company(app)
    dashboard(app)
    thirdCtrl(app)

    system(app)
}
