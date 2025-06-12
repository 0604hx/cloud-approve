const NodeCache = require('node-cache')
const { success } = require("../common")
const logger = require("../common/logger")
const { FlowService, ProcessService } = require("../service")
const { loadPage, canViewPage, withCache, loadFlow } = require("../service/CacheService")
const { withStaff } = require("./web-helper")
const StaffBean = require('../db/Staff')
const PageBean = require('../db/Page')
const { Roles, ID } = require("../fields")
const { Page, ProcessNode } = require('../db')

/**
 * @callback PageWorker
 * @param {PageBean} page - 页面对象
 * @param {StaffBean} staff
 */

/**
 *
 * @param {import("fastify").FastifyRequest} req
 * @param {PageWorker} worker
 */
const loadPageAndDeal = async (req, worker)=>{
    let id = req.body.pid || req.body.id || req.params.id
    let page = await loadPage(id)
    if(!page)   throw `页面#${id}不存在`

    return await withStaff(req, async staff=>{
        if(await canViewPage(page, staff)===true){
            return worker==null? page : await worker(page, staff)
        }
        throw `未授权访问该页面`
    })
}

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/flow/mine", async req=> withStaff(req, async staff=>{
        return success(await FlowService.byCompany(staff.cid))
    }))

    /**
     * 获取模板的配置项，注意需要授权
     */
    app.post("/flow/options", async req=> withStaff(req, async staff=>{
        let { id, pid } = req.body

        let flow = await loadFlow(id)
        if(!flow || flow.cid != staff.cid)
            return success({})
        let ps = {}

        let autoIndex = await FlowService.getNextAutoAction(flow, pid)
        if(autoIndex>=0)
            ps.autoIndex = autoIndex

        return success(Object.assign(ps, flow.options))
    }))

    /**
     * 返回授权给我的全部页面
     */
    app.post("/flow/page-list", async req=>withStaff(req, async staff=>{
        return success(await withCache(
            `pages.${staff.id}`,
            async ()=>{
                let pages = await Page.query().columns(Page.SIMPLE_COLUMNS)
                return pages.filter(async p=> await canViewPage(p, staff))
            },
            30*60
        ))
    }))

    app.post("/flow/page-detail", async req=> success(await loadPageAndDeal(req)))

    /**
     * 查询流程数据（限定某个模板）
     */
    app.post("/flow/page-data-:id", req=>loadPageAndDeal(req, async (page, staff)=>{
        let { form, pagination } = req.body

        form['EQ_fid'] = page.fid
        if(page.personal)
            form['EQ_sid'] = staff.id

        return await ProcessService.loadData(form, pagination)
    }))

    app.post("/flow/page-data-update", req=> loadPageAndDeal(req, async (page, staff)=>{
        let { id, value } = req.body
        global.isDebug && logger.debug(`${staff.fullName}尝试更新数据#${id}`, value)

        await ProcessService.updateUpdate(id, value)
    }))
}
