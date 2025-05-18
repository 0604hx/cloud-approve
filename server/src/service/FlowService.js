const logger = require("../common/logger")
const { Flow, ProcessNode } = require("../db")
const FlowBean = require("../db/Flow")
const { NAME, SUMMARY, CID, OPTIONS, ID, CHAINS } = require("../fields")

module.exports = {
    /**
     *
     * @param {FlowBean} flow
     */
    create : async flow=>{
        if(!flow.name)  throw `流程模版的名称不能为空`

        if(flow.id){
            let old = await Flow.query().findById(flow.id)
            let update = {}
            if(old.name != flow.name)       update[NAME] = flow.name
            if(old.summary!=flow.summary)   update[SUMMARY] = flow.summary
            if(old.cid != flow.cid)         update[CID] = flow.cid
            if(old.options != flow.options) update[OPTIONS] = flow.options
            update[CHAINS]  = flow.chains

            await Flow.query().patch(update).where(ID, flow.id)
            return `更新流程模板#${flow.id}「${old.name}」`
        }
        else{
            flow.options??={}
            flow.addOn = Date.now()
            await Flow.query().insert(flow)
            return `创建流程模版「${flow.name}」`
        }
    },

    del : async id=>{
        await Flow.query().deleteById(id)
        logger.info(`删除流程模版#${id}`)
    },

    copy : async id=>{
        let flow = await Flow.query().findById(id)
        if(flow){
            flow.id = undefined
            flow.name += `（副本）`
            flow.addOn = Date.now()
            await Flow.query().insert(flow)

            logger.info(`复制模板${flow.id}/${flow.name}...`)
        }
    },

    byCompany : async (cid)=>Flow.query().column(ID, NAME, CHAINS, OPTIONS, SUMMARY).where(CID, cid),

    /**
     * 计算自动流程的下一个环节
     * @param {FlowBean} flow
     * @param {Number} pid
     * @returns {Number|Object}
     */
    getNextAutoAction : async (flow, pid, needNodeData=false)=>{
        let opt = flow.options
        if(opt.auto == true && pid && Array.isArray(opt.actions) && opt.actions.length){
            //获取最近一次审批流程的 nextAction
            let lastNode = await ProcessNode.query().where({ pid }).orderBy(ID, 'desc').first()
            if(lastNode){
                let index = opt.actions.findIndex(a=>a.action == lastNode.nextAction)
                if(index>=0){
                    index ++
                    return needNodeData?{ index, node: lastNode }:index
                }
            }
        }

        return -1
    }
}
