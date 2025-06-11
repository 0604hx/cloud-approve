const svgCaptcha = require('svg-captcha')
const { UAParser } = require('ua-parser-js')
const NodeCache = require('node-cache')
const logger = require("../common/logger")
const { success, assert, error, wrap } = require('../common')
const { AccountService } = require('../service')
const { createJwtToken, base64ToString } = require('../common/secret')
const { AuthBean } = require('../beans')
const config = require('../config')
const { Staff, Account } = require('../db')
const { withStaff } = require('./web-helper')
const { opLog } = require('../service/SystemService')

const codeCache = new NodeCache({stdTTL:180, useClones:false, checkperiod: 0})

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.get("/common/captcha",  (req,res)=>{
        let { uuid } = req.query
        let captcha = svgCaptcha.createMathExpr({
            width:120,
            height:36,
            noise:2,
            fontSize:36,
            color: true
        })
        logger.debug(`生成验证码`, captcha.text)
        codeCache.set(uuid, captcha.text)
        res.type("svg").send(captcha.data)
    })

    app.post("/auth/whoami", (req, res)=>{
        logger.debug("USER", JSON.stringify(req.user))
        res.send(success(req.user))
    })

    app.post("/common/login-with-p", async (req, res)=>{
        let { name, pwd, code, uuid } = req.body
        assert.hasText(name, "账号不能为空")
        assert.hasText(pwd, "密码不能为空")
        assert.hasText(code, "验证码不能为空")

        logger.info(`用户${wrap(name)}尝试登录，验证码 ${code}`)
        if(codeCache.take(uuid) != code){
            logger.info(`${wrap(name)}登录的验证码有误：${code}`)
            return res.send(error("验证码有误"))
        }

        const account = await AccountService.verification(name, pwd)
        if(!!account && account.id){
            const staff = await Staff.query().findById(account.sid)
            if(!staff) {
                let msg = `账户${wrap(`${account.id}/${account.name}`)}未关联员工信息，请联系管理员`
                logger.info(msg)
                return res.send(error(msg))
            }

            const playload = AuthBean.simple(staff.id, account.id)
            const client = UAParser(req.headers['user-agent'])
            opLog(staff, `从IP⌈${req.ip}⌋登录(${client.browser.name} ${client.browser.major} ${client.device.type||""} ${client.os.name})`)
            //生成 TOKEN 并返回
            res.send(success(
                createJwtToken(playload, config.secret.jwtKey, { expiresIn: config.secret.jwtExpire })
            ))
        } else{
            res.send(error())
        }
    })

    app.post("/auth/change-p", async req=> withStaff(req, async staff=>{
        //检验旧密码
        let { oldPwd, pwd } = req.body
        let { aid } = req.user

        const acc = await Account.query().findById(aid)
        if(!acc || acc.id != aid || acc.active!=true || !AccountService.verifyPwd(acc.name, acc.pwd, oldPwd))
            throw `账号异常`

        //更新密码
        let originPwd = base64ToString(base64ToString(pwd))
        await AccountService.updatePwd(staff.id, originPwd)

        opLog(staff, `修改账户#${aid}的登录密码`, Staff.tableName)
    }))

    app.post("/auto/logout", (req, res)=>{})
}
