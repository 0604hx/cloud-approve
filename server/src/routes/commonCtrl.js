const { success } = require("../common")
const { ACTIONS } = require("../fields")

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/common/actions", async req=>success(ACTIONS))
}
