const { success, assert } = require("../../common")
const { Staff, Company, Account, Process, Role, RoleLink, Constant } = require("../../db")
const { ACTIVE, NAME, ID, CID, TYPE, Roles, SID } = require("../../fields")
const { pageToResult, withStaff } = require("../web-helper")
const StaffBean = require("../../db/Staff")
const CompanyBean = require("../../db/Company")
const AccountBean = require("../../db/Account")
const { Role:RoleBean, RoleLink:RoleLinkBean } = require("../../db/System")
const logger = require("../../common/logger")
const { Status } = require("../../beans")
const { base64ToString } = require("../../common/secret")
const AccountService = require("../../service/AccountService")
const { StaffService } = require("../../service")
const { loadAccountName, clearAccount, clearCompany, clearStaff, loadStaffName, clearAuth, loadCompanyName } = require("../../service/CacheService")
const { opLog } = require("../../service/SystemService")
const { loadWithCidAndName } = require("../../service/ConstantService")
const ConstantBean = require('../../db/Constant')

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/system/staff-by-company", async req=> success(await StaffService.listByCompany(req.body.cid)))

    app.post("/system/staff-list", async req=>{
        let { form, pagination } = req.body
        return pageToResult(await Staff.pageSelect(form, pagination, loadCompanyName))
    })

    app.post("/system/staff-add", async req=> withStaff(req, async staff=>{
        /**@type {StaffBean} */
        let bean = req.body
        await StaffService.createOrUpdate(bean, staff, false)
    }))

    app.post("/system/staff-del", async req=> withStaff(req, async staff=>{
        let { id } = req.body
        await StaffService.del(id, staff, false)
    }))

    /**
     * 返回公司列表
     */
    app.post("/system/company-list", async ()=> success(await Company.query()))

    app.post("/system/company-add", async req=>withStaff(req, async staff=>{
        /**@type {CompanyBean} */
        let bean = req.body
        assert.hasText(bean.name, "企业名称不能为空")
        assert.isTrue(bean.expire>=0, "企业有效期必须大于0")

        if(bean.id>0){
            let old = await Company.query().findById(bean.id)
            if(!old)    throw `企业#${bean.id}不存在`

            old.name = bean.name
            old.expire = bean.expire
            old.summary = bean.summary
            await Company.updateById(old)
            opLog(staff, `更新企业信息：${old.name}`, Company.tableName)
        }
        else{
            bean.addOn = Date.now()
            await Company.query().insert(bean)
            opLog(staff, `新增企业信息：${bean.name}`, Company.tableName)
        }
        clearCompany(bean.id)
    }))

    app.post("/system/company-del", async req=> withStaff(req, async staff=>{
        let { id } = req.body
        //如果关联的员工不为空，则拒绝
        let staffSize = await Staff.count({'cid': id})
        if(staffSize>0)
            throw `企业#${id}下还有${staffSize}个关联员工，暂不能删除`

        await Company.query().deleteById(id)
        clearCompany(id)
        opLog(staff, `删除企业#${id}`, Company.tableName)
    }))

    /**
     * 配置企业其他信息（如钉钉登录）
     */
    app.post("/system/company-config", req=> withStaff(req, async staff=>{
        let { cid, value } = req.body
        let name = 'config'
        let config = await loadWithCidAndName(cid, name)
        if(!value){
            //获取信息
            return  success(config)
        }

        if(!!config){
            await Constant.query().patch({ value }).where({ cid, name })
        }
        else{
            /**@type {ConstantBean} */
            let c = { cid, value, name, type: Constant.JSON }
            await Constant.query().insert(c)
            logger.info(`新建企业#${cid}的配置信息`)
        }
    }))

    app.post("/system/account-list", async req=>{
        /**@type {{active:Boolean, allField:Boolean, form:Object, pagination:Pagination}} */
        const { active, allField, form, pagination } = req.body

        if(pagination && pagination.page>=1){
            pagination.columns = [ID, NAME, TYPE, ACTIVE, SID]
            return pageToResult(await Account.pageSelect(form, pagination, loadStaffName))
        }
        else{
            let q = Account.query()
            if(allField!=true)
                q.columns(ID, NAME)
            else
                q.columns(ID, NAME, TYPE, ACTIVE)
            if(active === true)
                q.where(ACTIVE, true)

            return success(await q)
        }
    })

    app.post("/system/account-del", async req=> withStaff(req, async staff=>{
        let { id } = req.body
        if(id == 1)         throw `不能删除ID=1的账户信息`

        await Account.query().deleteById(id)
        clearAccount(id)
        opLog(staff, `删除账户#${id}`, Account.tableName)
    }))

    app.post("/system/account-update", async req=> withStaff(req, async staff=>{
        /**@type {{id:Number, key:String, value:[String, Boolean]}} */
        let { id, key, value } = req.body

        await AccountService.updateField(staff, id, key, value)
    }))

    app.post("/system/account-add", async req=>withStaff(req, async staff=>{
        /**@type {AccountBean} */
        let bean = req.body

        let newId = await AccountService.create(
            bean.name,
            base64ToString(base64ToString(bean.pwd)),
            bean.sid,
            bean.active,
            bean.type
        )
        opLog(staff, `新增账户#${newId}/${bean.name}（类型=${bean.type}）`, Account.tableName)
    }))

    app.post("/system/role-list", async req=>{
        const { form, pagination } = req.body
        return pageToResult(await Role.pageSelect(form, pagination))
    })

    //新增或者编辑角色
    app.post("/system/role-add", async req=>withStaff(req, async staff=>{
        /**@type {RoleBean} */
        let bean = req.body
        assert.hasText(bean.id, "角色ID不能为空")

        if(bean.id in Roles)    throw `预设角色⌈${bean.id}⌋无法修改`

        let old = await Role.query().findById(bean.id)
        if(old == null){
            bean.addOn = Date.now()
            await Role.query().insert(bean)
            opLog(staff, `新增角色#${bean.id}/${bean.name}（企业=${bean.cid}）`, Role.tableName)
        }
        else{
            old.name = bean.name
            old.cid = bean.cid
            old.summary = bean.summary
            await Role.updateById(old)
            opLog(staff, `更新角色#${old.id}/${old.name}（企业=${bean.cid}）`, Role.tableName)
        }
    }))

    app.post("/system/role-del", async req=> withStaff(req, async staff=>{
        let { id } = req.body
        if(id in Roles) throw `预设角色⌈${id}⌋不能删除`

        await Role.query().deleteById(id)
        opLog(staff, `删除角色#${id}`, Role.tableName)
    }))

    app.post("/system/role-link", async req=>{
        let { id } = req.body
        return success(await RoleLink.query().findById(id))
    })

    app.post("/system/role-link-update", async req=>{
        /**@type {RoleLinkBean} */
        let link = req.body
        if(await RoleLink.count(ID, link.id)<=0){
            //新建
            await RoleLink.query().insert(link)
        }
        else{
            await RoleLink.query().patch({role: link.role}).where(ID, link.id)
        }
        clearAuth(link.id)
    })
}
