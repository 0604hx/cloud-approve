const { assert, success } = require("../../common")
const logger = require("../../common/logger")
const { Func } = require("../../db")
const FuncBean = require("../../db/Func")
const { FuncService } = require("../../service")
const { loadStaffName } = require("../../service/CacheService")
const { withStaff, pageToResult } = require("../web-helper")

/**
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/system/func-list", async req=>{
        let { form, pagination } = req.body
        return pageToResult(await Func.pageSelect(form, pagination, loadStaffName))
    })

    app.post("/system/func-add", async req=> withStaff(req, async staff=>{
        /**@type {FuncBean} */
        let bean = req.body
        assert.hasText(bean.name, "函数名称不能为空")
        assert.hasText(bean.code, "函数代码不能为空")

        if(bean.id>0){
            let old = await Func.query().findById(bean.id)
            if(!old)    throw `动态函数#${bean.id}不存在`

            old.sid = staff.id
            old.name = bean.name
            old.summary = bean.summary
            old.code = bean.code
            await Func.updateById(old)
        }
        else{
            bean.launch = 0
            bean.sid = staff.id
            bean.addOn = Date.now()

            await Func.query().insert(bean)
        }
    }))

    app.post("/system/func-del", async req=>withStaff(req, async staff=>{
        let { id } = req.body
        await Func.query().deleteById(id)
        logger.info(`${staff.fullName}删除动态函数#${id}...`)
    }))

    app.post("/system/func-run", async req=>withStaff(req, async staff=>{
        let { id, params } = req.body

        return success(await FuncService.runFunc(staff, id, params))
    }))
}
