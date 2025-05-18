const { success, assert } = require("../../common")
const logger = require("../../common/logger")
const { Flow, Process, Page } = require("../../db")
const { OPTIONS, VALUE, NAME, SUMMARY, ID, CID, ADD_ON, FID, FNAME, FORMAT } = require("../../fields")
const { FlowService, ProcessService } = require("../../service")
const { loadCompanyName, loadFlowName, clearPage, clearFlow } = require("../../service/CacheService")
const { opLog } = require("../../service/SystemService")
const { pageToResult, withStaff } = require("../web-helper")
const PageBean = require('../../db/Page')
const { pickBy, isNil, omit } = require("lodash")

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/system/flow-:id", async req=>success(await Flow.query().findById(req.params.id)))

    app.post("/system/flow-list", async req=>{
        let { form, pagination } = req.body
        if(pagination && pagination.page>=1){
            pagination.columns = [ID, CID, NAME, OPTIONS, SUMMARY, ADD_ON]
            return pageToResult(await Flow.pageSelect(form, pagination, loadCompanyName))
        }
        else{
            return success(await Flow.query().columns(ID, CID, NAME).limit(200))
        }
    })

    app.post("/system/flow-add", async req=>withStaff(req, async staff=>{
        opLog(staff, await FlowService.create(req.body), Flow.tableName)
    }))

    app.post("/system/flow-copy", async req=> await FlowService.copy(req.body.id))

    app.post("/system/flow-del", async req=> await FlowService.del(req.body.id))

    app.post("/system/flow-update", async req=>{
        let { id, key, value } = req.body
        if(![OPTIONS, VALUE, NAME, SUMMARY].includes(key))
            throw `仅限修改名称、内容、办理流程`

        logger.info(`${req.user.fullName}更新模板#${id}：${key}`)
        global.isDebug && logger.debug(value)
        await Flow.query().patch({[key]: value}).where(ID, id)

        clearFlow(id)
    })

    app.post("/system/page-list", async req=>{
        let { form, pagination } = req.body
        pagination.columns = Page.SIMPLE_COLUMNS
        return pageToResult(await Page.pageSelect(form, pagination, loadFlowName))
    })

    app.post("/system/page-add", req=>withStaff(req, async staff=>{
        /**@type {PageBean} */
        let p = req.body

        if(p.id>0){
            let old = await Page.query().findById(p.id)
            if(!old)    throw `页面#${p.id}不存在`

            await Page.updateById(pickBy(p, v=> !isNil(v)), FNAME)
            opLog(staff, `更新页面#${old.id}/${old.name}（关联模板=${old.fid}）`)
        }
        else{
            assert.hasText(p.name, "名称不能为空")
            assert.isTrue(p.fid>0, "必须关联一个模板")

            p.addOn = Date.now()
            await Page.query().insert(p)
            opLog(staff, `新增页面#${p.id}/${p.name}（关联模板=${p.fid}）`)
        }
        clearPage(p.id)
    }))

    app.post("/system/page-detail-:id", async req=> success(await Page.query().findById(req.params.id)))

    app.post("/system/page-del", req=>withStaff(req, async staff=>{
        let { id } = req.body
        await Flow.query().deleteById(id)
        opLog(staff, `删除页面#${id}`)
    }))


    app.post("/system/process-list", async req=>{
        let { form, pagination } = req.body
        return pageToResult(await Process.pageSelect(form, pagination, loadCompanyName))
    })

    app.post("/system/process-del", async req=> withStaff(req, async staff=>{
        await ProcessService.del(staff, req.body.id, true)
        logger.info(`${staff.fullName}删除流程#${req.body.id}`)
    }))
}
