const NodeCache = require("node-cache")
const logger = require("../common/logger")
const { sm4Encrypt, stringToBase64, sm4Decrypt } = require("../common/secret")
const { uuid } = require("../common/tool")
const config = require("../config")
const { Account, Staff, Role, RoleLink } = require("../db")
const AccountBean = require('../db/Account')
const StaffBean = require('../db/Staff')
const { presetRoles } = require("../db/schema/presets")
const { Roles, ACTIVE, SID, ID } = require("../fields")
const { clearAccount } = require("./CacheService")
const { opLog } = require("./SystemService")

//失败次数存放1小时
const pwdRetryCache = new NodeCache({stdTTL:3600, useClones:false, checkperiod: 0})

const buildPwd = (name, pwd)=>sm4Encrypt(`${name}${stringToBase64(pwd)}`, config.secret.sm4Key)

/**
* 新建用户，返回新插入的ID
* @param {String} name
* @param {String} pwd
* @param {Number} sid
* @param {Boolean} active
* @param {String} type - 类型
* @returns {Number}
*/
const create = async (name, pwd, sid, active=true, type=Account.Types.OTHER, trx)=>{
    if(!name)   throw `用户名不为空`

    let size = await Account.count("name", name)
    if(size > 0)    throw `用户<${name}>已存在，不能重复录入`

    let bean = new Account()
    bean.active = active
    bean.name = name
    bean.pwd = buildPwd(name, pwd)
    bean.sid = sid
    bean.type = type
    bean.addOn = Date.now()

    await Account.query(trx).insert(bean)
    logger.info(`新建用户 ${name} PWD=${bean.pwd}`)
    clearAccount(bean.id)
    return bean.id
}

/**
 *
 * @param {String} name
 * @param {String} localPwd - 本地存储密码
 * @param {String} outerPwd - 用户输入的密码
 * @returns {Boolean}
 */
const verifyPwd = (name, localPwd, outerPwd)=>{
    if(pwdRetryCache.has(name) && pwdRetryCache.get(name)>=config.secret.pwdRetryMax)
        throw `账号${name}校验次数过多，请稍后再试`

    let pwdRaw = sm4Decrypt(localPwd, config.secret.sm4Key)
    if(pwdRaw != `${name}${outerPwd}`){
        //进行次数限制
        if(pwdRetryCache.has(name))
            pwdRetryCache.set(name, pwdRetryCache.get(name)+1)
        else
            pwdRetryCache.set(name, 1)
        return false
    }

    return true
}

module.exports = {
    create,
    verifyPwd,

    /**
     * 检验登录
     * @param {String} name
     * @param {String} pwd - 经base64编码的密码串
     * @returns {AccountBean}
     */
    verification : async (name, pwd, text="登陆验证")=>{
        let bean = await Account.query().where({"name":name, active: true}).first()
        if(!bean){
            logger.error(`[${text}] 用户[${name}]不存在`)
            return null
        }

        if(!verifyPwd(bean.name, bean.pwd, pwd)){
            logger.error(`[${text}] 用户 ${name} 的凭证不正确`)
            return null
        }

        return bean
    },

    /**
     * 删除指定的用户
     * @param {Number} id
     */
    remove : async id=> {
        await Account.query().deleteById(id)
        logger.info(`删除用户#${id}`)
    },

    updatePwd : async (id, newPwd)=>{
        let account = await Account.query().findById(id)
        if(account){
            await Account.query().patch({'pwd': buildPwd(account.name, newPwd)}).where({id})
            logger.info(`更新${account.fullName}的登录密码...`)
        }
    },

    /**
     * 判断第三方关联下是否具备指定用户
     * @param {Number} cid
     * @param {String} name
     * @param {String} type
     * @returns {AccountBean}
     */
    loadWith3TH: async (cid, name, type=Account.Types.OTHER)=>{
        return await Account.query().where({ cid, name, type }).first()
    },

    /**
     * 修改账户指定字段
     * @param {StaffBean} staff
     * @param {Number} id
     * @param {String} key
     * @param {*} value
     */
    updateField: async (staff, id, key, value)=>{
        if(key=="pwd"){
            //ID=1的账户只能自己修改
            if(id == 1 && staff.aid != 1)   throw `您无权修改ID=1的账户信息`

            let originPwd = base64ToString(base64ToString(value))
            await this.updatePwd(id, originPwd)
        }
        else if(key == ACTIVE){
            await Account.query().patch({[ACTIVE]: value}).where(ID, id)
            opLog(staff, `更新账户#${id}的状态为 ${value}`, Account.tableName)
        }
        else if(key == SID){
            await Account.query().patch({[SID]: value}).where({ id })
            opLog(staff, `关联账户#${id}员工为 Staff#${value}`, Account.tableName)
        }
    },

    initForAdminAccount : async (name="admin", staffName="系统管理员")=>{
        let trx = await Account.startTransaction()

        let size = await Account.count()
        if(size > 0){
            logger.info(`账户表已经存在${size}条数据，跳过...`)
        }
        else{
            /**
             * 本计划在此处添加自动创建企业
             * 但考虑到不知道怎么命名，暂放弃😂
             */

            let staff = new Staff()
            staff.name = staffName
            staff.summary = "AUTO"
            staff.addOn = Date.now()

            await Staff.query(trx).insert(staff)
            logger.info(`初始化⌈${staff.name}⌋员工 :)`)

            let pwd = uuid()
            await create(name, pwd, staff.id, true, Account.Types.OTHER, trx)
            logger.info(`初始化⌈${name}⌋账户，明文密码：${pwd} （请妥善保存并几时修改密码）`)
        }


        //初始化角色
        if(await Role.count()<=0){
            let roles = presetRoles()
            for(let i=0;i<roles.length;i++){
                await Role.query(trx).insert(roles[i])
            }
            logger.info(`初始化角色：${roles.map(r=>`${r.id}/${r.name}`).join("、")}`)
        }
        //插入最新的信息
        if(await RoleLink.count()<=0){
            let link = new RoleLink()
            link.id = 1
            link.role = Roles.ADMIN
            await RoleLink.query(trx).insert(link)
            logger.info(`自动关联ID=1的员工到超级管理员...`)
        }
        trx.commit()
    }
}
