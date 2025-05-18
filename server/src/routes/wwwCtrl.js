const config = require("../config")

/**
 *
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} res
 */
const indexHtml = (req, res)=>{
    res.redirect(`${config.wwwPrefix}index.html`, 302)
}

/**
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.get("/", indexHtml)
    app.get("/index.html", indexHtml)
    app.get("/index.php", indexHtml)
}
