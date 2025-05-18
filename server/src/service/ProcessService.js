const { wrap, assert } = require("../common")
const logger = require("../common/logger")
const { ProcessData, ProcessNode, Process, Flow, File } = require("../db")
const Staff = require("../db/Staff")
const { canViewProcess, loadStaff, loadFlow, loadStaffName, clearMineOverview } = require("./CacheService")
const { ProcessNode:ProcessNodeBean, Process:ProcessBean, ProcessLog } = require("../db/Process")
const StaffBean = require("../db/Staff")
const { ID, ACTION_DEAL, ACTION_DONE, ACTION_BACK, ACTIONS, VALUE, STATUS } = require("../fields")
const { Status } = require("../beans")
const FileService = require("./FileService")
const { opLog } = require("./SystemService")
const { pageToResult } = require("../routes/web-helper")
const { isNil } = require("lodash")
const { getNextAutoAction } = require("./FlowService")
const config = require("../config")

/**
 * 检查是否具备查看指定流程的权限，若无则直接报错
 * @param {Staff} staff
 * @param {Number} id
 * @param {Boolean} loadData - 是否加载流程对象
 * @returns {ProcessBean}
 */
const checkViewAuth = async (staff, id, loadData=false)=>{
    let auth = await canViewProcess(staff.id, id)
    if(!auth)   throw `用户「${staff.id}/${staff.name}」无权限查看流程#${id}`

    if(loadData === true){
        let p = await Process.query().findById(id)
        if(!p)  throw `流程#${id}不存在`
        return p
    }
}

module.exports = {
    checkViewAuth,

    /**
     *
     * @param {Staff} staff
     * @param {Number} id
     */
    getById : async (staff, id)=>{
        return await checkViewAuth(staff, id, true)

        // return Process.query()
                // .where({id})
                // .andWhere(b=>
                //     b.where({sid: staff.id}).orWhere({"curSId": staff.id})
                // )
                // .first()
    },

    /**
     * 读取指定模版数据
     * @param {Staff} staff
     * @param {Number} pid - 如果有效，则加载对应的数据
     * @param {Number} flowId - 模板ID
     */
    loadFlowData : async (staff, pid, flowId)=>{
        let fid = flowId
        let pData
        if(pid){
            await checkViewAuth(staff, pid)

            pData = await ProcessData.query().findOne({ pid, active:true })
            if(!pData)
                logger.info(`找不到对应的流程数据 #${pid} ...`)
            else
                fid = pData?.fid
        }
        let flow = fid? await Flow.query().findById(fid):{}
        return {
            flow: flow.value,
            data: pData?.value
        }
    },

    /**
     * 获取流程的历史记录
     * @param {Staff} staff
     * @param {Number} pid
     */
    loadNodes : async (staff, pid)=>{
        await checkViewAuth(staff, pid)

        return ProcessNode.query().where({pid}).orderBy(ID, 'DESC')
    },

    loadLogs : async (staff, pid)=>{
        await checkViewAuth(staff, pid)
        return await ProcessLog.query().where({pid})
    },

    /**
     * 提交审批
     * @param {Staff} staff
     * @param {ProcessNodeBean} node
     */
    approve : async (staff, node)=>{
        if(!(node.type in ACTIONS))     throw `无效的操作类型`
        if(node.type != ACTION_DEAL){
            //检查步骤，对于非交办类型，只能填写预设的处理步骤
            if(!ACTIONS[node.type].items.includes(node.nextAction))
                throw `步骤⌈${node.nextAction}⌋不符合预设值`
        }

        let p = await checkViewAuth(staff, node.pid, true)
        if(p.curSId != staff.id)
            throw `${staff.fullName}未授权办理/审批流程`

        /**
         * 获取最新的历史记录
         * @type {ProcessNodeBean}
         */
        let lastNode = await ProcessNode.query().where({pid: p.id}).orderBy(ID, "DESC").first()
        assert.isDBObj(lastNode, `找不到流程的历史节点，请联系管理员进行数据修复`)

        //填充节点数据
        node.sid = staff.id
        node.sname = staff.name
        node.addOn = Date.now()

        /**@type {ProcessBean} 流程更新*/
        let  updateP = {lastOn: node.addOn}
        const trx = await Process.startTransaction()

        //交办
        if(node.type == ACTION_DEAL){
            node.action = lastNode.nextAction
            updateP.curSId = node.nextSId
            updateP.curSName = node.nextSName
        }
        //办结
        else if(node.type == ACTION_DONE){
            if(p.status != Status.WORKING)
                throw `仅能办结进行中的流程`

            node.action = node.nextAction
            node.nextAction = undefined

            updateP.status = Status.DONE
        }
        //退回
        else if(node.type == ACTION_BACK){
            node.action = node.nextAction

            let isBackToOrigin = (node.action||"").includes("拟稿")
            node.nextAction = isBackToOrigin?"修改（提交）":lastNode.action

            if(isBackToOrigin){
                /**@type {StaffBean} */
                let origin = await loadStaff(p.sid)
                if(!origin || !origin.id)
                    throw `拟稿人#${p.sid}不存在`

                updateP.curSId = p.sid
                updateP.curSName = origin.name
            }
            else{
                updateP.curSId = lastNode.sid
                updateP.curSName = lastNode.sname
            }
        }
        if(updateP.curSId && !updateP.curSName)
            updateP.curSName = (await loadStaff(updateP.curSId)).name

        await ProcessNode.query(trx).insert(node)

        if(Object.keys(updateP).length){
            await Process.query(trx).patch(updateP).where(ID, p.id)
        }
        if(STATUS in updateP){
            await ProcessData.query(trx).patch({ status: updateP.status }).where({ pid: p.id})
        }

        trx.commit()
        clearMineOverview(staff.id)

        opLog(staff, `${ACTIONS[node.type].label}流程#${p.id}/${p.title}`, Process.tableName)
    },

    /**
     * 快捷同意流程，自动进入下一步骤
     * @param {Staff} staff - 用户
     * @param {Number} id - 流程ID
     */
    autoApprove: async (staff, id)=>{
        let p = await checkViewAuth(staff, id, true)
        if(p.curSId != staff.id)
            throw `${staff.fullName}未授权办理/审批该流程`

        /**@type {ProcessBean} 流程更新*/
        let  updateP = { }
        let node = new ProcessNode()
        node.type = ACTION_DEAL

        let flow = await loadFlow(p.fid)

        if(flow.hasChain()){
            let index = flow.chains.indexOf(staff.id)
            if(index==-1)
                throw `当前用户不在审批链中`
            if(index == flow.chains.length-1){
                //审批链最后一个环节，自动办结
                updateP.status = Status.DONE
                node.action = ACTIONS[ACTION_DONE].label
                logger.info(`流程#${p.id}/${p.title}已经走完审批链，自动办结...`)
            }
            else{
                node.action = config.app.textAutoApprove
                node.nextSId = flow.chains[index+1]
            }
        }
        else{
            /**@type {{index:Number, node:ProcessNodeBean}} */
            let { index, node: lastNode } = await getNextAutoAction(flow, id, true)
            if(index<0)
                throw `自动计算下一步骤失败`

            let nextAct = flow.options.actions[index]
            logger.debug(`下一自动步骤`, nextAct)

            node.action = lastNode.nextAction
            node.nextAction = nextAct.action
            node.nextSId = parseInt(nextAct.sid)
        }

        if(node.nextSId && !node.nextSName)
            node.nextSName = (await loadStaff(node.nextSId)).name
        node.pid = id
        node.sid = staff.id
        node.sname = staff.name
        node.addOn = Date.now()

        updateP.lastOn = node.addOn
        if(updateP.status != Status.DONE){
            updateP.curSId = node.nextSId
            updateP.curSName = node.nextSName
        }

        await ProcessNode.query().insert(node)
        await Process.query().patch(updateP).where({ id })
        if(STATUS in updateP){
            await ProcessData.query().patch({ status: updateP.status }).where({ pid: id})
        }
        clearMineOverview(staff.id)
        // console.debug(node, updateP)

        opLog(staff, `快捷处理流程#${p.id}/${p.title}`, Process.tableName)
    },

    /**
     * 办结流程
     * @param {Staff} staff
     * @param {Number} id
     */
    done : async (staff, id)=>{
        let p = await checkViewAuth(staff, id, true)
        if(p.status != Status.WORKING)
            throw `仅能办结进行中的流程`

        const trx = await Process.startTransaction()
        //保存历史记录
        let node = new ProcessNode(p, staff)
        await ProcessNode.query(trx).insert(node)

        await Process.query(trx)
            .patch({status: Status.DONE, lastOn: Date.now()})
            .where(ID, p.id)
        trx.commit()

        opLog(staff, `办结流程#${p.id}/${p.title}`, Process.tableName)
    },

    /**
     *
     * @param {Staff} staff
     * @param {Number} pid
     * @param {Boolean} force - 强制删除
     */
    del : async (staff, pid, force=false)=>{
        let p = await checkViewAuth(staff, pid, true)
        logger.info(`${staff.fullName}申请删除流程 #${p.id}/${p.title}`)

        if(force != true){
            //仅能删除自己的非办结流程
            if(staff.id != p.sid || p.status == Status.DONE)
                throw `仅能删除自己发起的非办结流程`
        }

        const trx = await Process.startTransaction()
        await Process.query(trx).deleteById(p.id)
        await ProcessData.query(trx).where({ pid }).delete()
        await ProcessNode.query(trx).where({ pid }).delete()
        trx.commit()
        opLog(staff, `删除流程#${pid}/${p.title}`, Process.tableName)
    },

    loadFiles : async (staff, pid)=>{
        await checkViewAuth(staff, pid)

        return await FileService.listByProcess(pid)
    },

    /**
     *
     * @param {Object} form
     * @param {Pagination} pagination
     */
    loadData : async (form, pagination={page:1, pageSize:20})=>{
        let q = ProcessData.buildQuery(form, pagination)
        //增加 JSON 属性的查询
        Object.keys(form||{}).filter(k=>k.startsWith("$.") && !isNil(form[k])).forEach(k=>{
            q.whereJsonPath(VALUE, k, '=', form[k])
        })

        let result = await q.page((pagination.page??1)-1, pagination.pageSize)
        return pageToResult(result)
    }
}
