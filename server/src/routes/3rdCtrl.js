const logger = require("../common/logger")
const { Staff, Account } = require('../db')
const { opLog } = require('../service/SystemService')
const { Types } = require('../db/Account')
const { loginWithCode } = require("../service/DingdingService")
const { loadWith3TH } = require("../service/AccountService")
const AccountBean = require("../db/Account")
const StaffBean = require("../db/Staff")
const { createJwtToken } = require("../common/secret")
const config = require("../config")
const { datetime } = require("../common/date")
const { loadWithCidAndName } = require("../service/ConstantService")
const { success } = require("../common")
const { AuthBean } = require("../beans")

/**
 *
 * @param {AccountBean} acc
 * @param {StaffBean} staff
 */
const buildToken = (acc, staff, ip)=>{
    const playload = AuthBean.simple(staff.id, acc.id)
    opLog(staff, `从IP⌈${ip}⌋通过钉钉自动登录（CID=${staff.cid}）`)
    return createJwtToken(playload, config.secret.jwtKey, { expiresIn: config.secret.jwtExpire })
}

/**
 * 第三方登录
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/common/login-with-:type", async (req, res)=>{
        const { cid, code } = req.body
        if(!cid || !code)   throw `CID或者CODE参数不能为空`

        const { type } = req.params
        global.isDebug && logger.debug(`尝试通过第三方[${type}]登录CID=${cid}...`)

        if(type == Types.DINGDING){
            let { name, unionid } = await loginWithCode(cid, code)
            /**
             * 构建一个唯一ID
             */
            const accName = `D_${unionid}_${name}`

            let acc = await loadWith3TH(cid, accName, Types.DINGDING)
            if(!acc){
                /**@type {CompanyConfig} */
                let cfg = await loadWithCidAndName(cid)

                let addOn = Date.now()
                logger.info(`未找到关联⌈${name}⌋的Account，尝试自动匹配同名Staff...`)

                //还没有关联，尝试自动关联
                let staff = await Staff.query().where({ name, cid }).first()
                if(!staff && cfg.ddAutoCreate){
                    //创建员工信息
                    /**@type {StaffBean} */
                    let newStaff = { cid, name, summary:`钉钉同步于${datetime()}`, addOn }
                    staff = await Staff.query().insert(newStaff)
                    logger.info(`自动创建钉钉用户⌈${accName}⌋对应的员工信息ID=${staff.id}`)
                }

                /**@type {AccountBean} */
                let newAcc = { addOn, cid, name: accName, type }
                //如果设置了自动创建，默认是有效
                newAcc.active = cfg.ddAutoCreate == true
                newAcc.sid = staff?.id
                acc =  await Account.query().insert(newAcc)

                if(staff.id && newAcc.active == true)
                    return res.send(success(buildToken(acc, staff, req.ip)))

                //`您的钉钉账户为首次登录，请先联系管理员完成激活`
                throw 'E01'
            }
            else{
                //判断是否启用， `您的钉钉账户关联未激活，请联系企业管理员`
                if(acc.active != true)  throw 'E02'

                const staff = await Staff.query().findById(acc.sid)
                //`找不到当前钉钉账户关联的员工`
                if(!staff)              throw 'E03'

                res.send(success(buildToken(acc, staff, req.ip)))
            }
        }
    })
}
