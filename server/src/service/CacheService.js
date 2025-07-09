const { Account, Staff, Process, ProcessNode, Company, RoleLink, FileItem, Flow, Relation, Constant, Page } = require("../db")
const cache = require('../common/cache')
const { wrap } = require("../common")
const { AuthBean, Status } = require("../beans")
const StaffBean = require("../db/Staff")
const AccountBean = require("../db/Account")
const { Process:ProcessBean } = require("../db/Process")
const logger = require("../common/logger")
const { CNAME, C, CWEBP, FNAME, SNAME, CID, Roles } = require("../fields")
const CompanyBean = require("../db/Company")
const FlowBean = require("../db/Flow")
const PageBean = require("../db/Page")
const { runOSCmd } = require("../common/tool")
const { loadRolesById } = require("./SystemService")

/**
 *
 * @param {String} key - 缓存ID
 * @param {Function} creater - 构建函数
 * @param {Number} exire - 超时，单位秒，默认两小时
 */
const withCache = async (key, creater, expire=120*60)=>{
    if(cache.has(key)){
        // if(global.isDebug)  logger.debug(`[CACHE] 使用缓存 ${key}`)
        return cache.get(key)
    }
    const data = await creater()
    return cache.set(key, data, expire)
}

const loadAccount = async id=> withCache(`account.${id}`, ()=> Account.query().findById(id))
/**
 *
 * @param {Number} id
 * @returns {StaffBean}
 */
const loadStaff = async id=> withCache(`staff.${id}`, ()=> Staff.query().findById(id))

/**
 *
 * @param {Number} id
 * @returns {CompanyBean}
 */
const loadCompany = async id=>await withCache(`company.${id}`, ()=>Company.query().findById(id))

/**
 *
 * @param {Number} id
 * @returns {FlowBean}
 */
const loadFlow = async id=> await withCache(`flow.${id}`, ()=> Flow.query().findById(id), 20*60)

exports.withCache = withCache

/**
 *
 * @param {Number} id
 * @param {Number} expire - 超时，单位秒，默认为2小时
 * @param {String} ip - 归属的IP地址
 * @returns
 */
exports.loadAuthBean = async (id, expire=60*60, ip=undefined, aid)=>{
    let key = `auth.${id}`
    if(cache.has(key))
        return cache.get(key)

    const staff = await Staff.query().findById(id)
    if(!staff)  throw `用户${wrap(id)}不存在`

    const bean = new AuthBean(id, staff.name, await loadRolesById(id), ip)
    bean.aid = aid
    bean.cid = staff.cid
    let company = await loadCompany(staff.cid)
    if(company)
        bean.cname = company.name
    return cache.set(key, bean, expire)
}

exports.clearAuth   = id=> cache.clear(`auth.${id}`)
exports.clearStaff  = id=> cache.clear(`staff.${id}`)
exports.clearAccount= id=> cache.clear(`account.${id}`)
exports.clearCompany= id=> cache.clear(`company.${id}`)
exports.clearPage   = id=> {
    cache.clear(`page.${id}`)
    cache.clear(`page.view.${id}`, true)
    cache.clear(`pages.`, true)
}
exports.clearFlow   = id=> cache.clear(`flow.${id}`)

exports.loadFlow    = loadFlow
exports.loadCompany = loadCompany
exports.loadStaff   = loadStaff
exports.loadAccount = loadAccount

/**
* 检测是否具备查看某个流程的权限，判断依据（满足一个）：
* 1、用户是发起人、当前处理人
* 2、用户存在于历史节点中
*
* 默认缓存 30 分钟
 * @param {Number} sid
 * @param {Number} pid
 * @returns {Boolean}
 */
exports.canViewProcess = async (sid, pid)=> withCache(`PView.${sid}.${pid}`, async ()=>{
    let roles = await loadRolesById(sid)
    if(roles.includes(Roles.ADMIN))
        return true

    /**@type {ProcessBean} */
    const process = await Process.query().findById(pid)
    if(!process)
        return false
    if(process.sid == sid || process.curSId==sid)
        return true

    //判断历史节点
    let size = await ProcessNode.count({id:pid, sid})
    return size>0
}, 30*60*1000)

/**
* @param {StaffBean} staff
* @param {Number} pid
* @returns {Boolean}
*/
exports.canStaffViewProcess = async (staff, pid)=> this.canViewProcess(staff.id, pid)

/**
 * 统计个人总览信息
 * @param {Number} sid
 * @returns {Object}
 */
exports.mineOverview = async sid=> withCache(`overview.${sid}`, async ()=>{
    return {
        total:      await Process.count({sid}),
        working:    await Process.count({sid, status: Status.WORKING}),
        todo:       await Process.count({curSId: sid, status: Status.WORKING})
    }
})
/**
 * 清空个人总览信息
 * @param {Number} id
 * @returns
 */
exports.clearMineOverview = id=> cache.clear(`overview.${id}`)

/**
 * 读取 cid 的企业，赋值到 cname
 * @param {Object} row
 */
exports.loadCompanyName = async row=>{
    /**@type {CompanyBean} */
    let company = await loadCompany(row.cid)
    row[CNAME] = company?.name
}

/**
 * 读取 aid 属性，复制到 aname
 * @param {Object} row
 */
exports.loadAccountName = async row=>{
    if(!row.aid)    return

    /**@type {AccountBean} */
    let acc = await loadAccount(row.aid)
    row['aname'] = acc?.name
}

exports.loadStaffName = async row=>{
    if(!row.sid)    return

    let bean = await loadStaff(row.sid)
    row[SNAME] = bean.name
}

exports.loadFlowName = async row=>{
    if(!row.fid)    return
    row[FNAME] = (await loadFlow(row.fid)).name
}

/**
 * 获取数据统计
 * @param {Number} cid
 * @returns
 */
exports.countOfData = async (cid=0)=> withCache(`dashboard.data.${cid}`, async ()=>{
    if(cid == null || cid==0){
        return {
            [Account.tableName] : await Account.count(),
            [Staff.tableName]   : await Staff.count(),
            [Company.tableName] : await Company.count(),
            [Process.tableName] : await Process.count(),
            [FileItem.tableName]: await FileItem.count(),
            [Flow.tableName]    : await Flow.count(),
            [Constant.tableName]: await Constant.count(),
            [Page.tableName]    : await Page.count(),
            scope: "全域"
        }
    }
    else{
        let company = await Company.query().findById(cid)
        if(!company)    throw `企业#${cid}不存在`

        return {
            scope               : company.name,
            [Staff.tableName]   : await Staff.count({ cid }),
            [Process.tableName] : await Process.count({ cid }),
            [FileItem.tableName]: await FileItem.count({ cid }),
            [Flow.tableName]    : await Flow.count({ cid }),
            [Constant.tableName]: await Constant.count({ cid })
        }
    }
})

/**
 * 是否有关联
 * @param {Number} origin
 * @param {Number} target
 * @param {String} type
 * @returns {Boolean}
 */
exports.hasRelation = async (origin, target, type)=> withCache(
    `relation.${type}.${origin}.${target}`,
    async ()=>{
        let r = await Relation.query().where({type, origin, target}).first()
        return r!=null
    },
    10*60
)

exports.isCWEBPInstalled = ()=> withCache(
    CWEBP, ()=>{
        try{
            runOSCmd(CWEBP, ['-version'])
            return true
        }catch(e){
            logger.error(`检测${CWEBP}版本失败：${e.message}`)
            return false
        }
    },
    10*60
)

/**
 *
 * @param {Number} id
 * @returns {PageBean}
 */
exports.loadPage = async id=>withCache(`page.${id}`, async ()=>{
    let page = await Page.query().findById(id)
    if(page && page.fid){
        //读取 cid
        let flow = await Flow.query().findById(page.fid)
        if(flow)
            page[CID] = flow.cid
    }
    return page
})

/**
 * 判断用户是否对某个页面具备相应的权限，默认缓存10分钟
 * @param {PageBean} page - 页面对象
 * @param {StaffBean} staff - 用户
 */
exports.canViewPage = async (page, staff)=> withCache(
    `page.view.${page.id}.${staff.id}`,
    async ()=>{
        let roles = await loadRolesById(staff.id)
        if(
            roles.includes(Roles.ADMIN)
            ||
            roles.includes(Roles.COMPANY_ADMIN)
            ||
            page.hasAuth(staff.id)
        ){
            return true
        }

        return false
    },
    60*10
)
