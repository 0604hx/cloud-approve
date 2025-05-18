const { success } = require("../common")
const { Staff, Constant, Account } = require("../db")
const StaffBean = require("../db/Staff")
const ConstantBean = require("../db/Constant")
const { StaffService, ConstantService } = require("../service")
const { opLog } = require("../service/SystemService")
const { withStaff, pageToResult } = require("./web-helper")
const { updateField } = require("../service/AccountService")
const { loadStaffName } = require("../service/CacheService")

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{

    /**
     * 获取当前公司的账户列表
     */
    app.post("/company/account-list", async req=> withStaff(req, async ()=>{
        const { form, pagination } = req.body

        return pageToResult(await Account.pageSelect(form, pagination, loadStaffName))
    }))

    /**
     * 更新企业内账户信息，如密码、active、关联员工
     */
    app.post("/company/account-update", async req=> withStaff(req, async staff=>{
        const { id, key, value } = req.body

        await updateField(staff, id, key, value)
    }))

    /**
     * 获取当前公司的员工列表
     */
    app.post("/company/staff-list", async req=> withStaff(req, async staff=>{
        const { form, pagination } = req.body

        if(pagination && pagination.page>=1){
            form["EQ_cid"] = staff.cid
            return pageToResult(await Staff.pageSelect(form, pagination))
        }
        else{
            return success(await StaffService.listByCompany(staff.cid))
        }
    }))

    app.post("/company/staff-add", async req=> withStaff(req, async staff=>{
        /**@type {StaffBean} */
        let bean = req.body
        bean.cid = staff.cid
        await StaffService.createOrUpdate(bean, staff, true)
    }))

    app.post("/company/staff-del", async req=> withStaff(req, async staff=>{
        let { id } = req.body
        await StaffService.del(id, staff)
    }))

    app.post("/company/constant-list",  req=> withStaff(req, async staff=>{
        const { form, pagination } = req.body

        form["EQ_cid"] = staff.cid
        return pageToResult(await Constant.pageSelect(form, pagination))
    }))

    app.post("/company/constant-add",  req=>withStaff(req, async staff=>{
        /**@type {ConstantBean} */
        let bean = req.body

        bean.cid = staff.cid
        await ConstantService.createOrUpdate(bean, staff)
    }))

    app.post("/company/constant-del", req=> withStaff(req, async staff=>{
        let { id } = req.body
        await ConstantService.del(id, staff)
    }))
}
