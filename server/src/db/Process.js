const config = require("../config");
const { VALUE, STATUS, ID, PID } = require("../fields");
const { BaseAddonModel, LinkToProcessModel } = require("./abstract");
const Staff = require("./Staff");

class Process extends BaseAddonModel{
    static get tableName(){
        return `${config.db.prefix}process`
    }

    /**员工ID */
    sid     = undefined
    /**公司ID */
    cid     = undefined
    /**标题 */
    title   = undefined
    /**描述信息 */
    summary = undefined
    /**当前状态 */
    status  = undefined

    /**流程模板ID */
    fid     = undefined
    /**流程名称 */
    fName   = undefined
    /**当前处理人员ID */
    curSId  = undefined
    /**当前处理人员名称 */
    curSName= undefined
    /**最后交办时间 */
    lastOn  = undefined

    /**
     * @param {Staff} staff
     */
    constructor(staff){
        super()
        if(staff){
            this.sid = staff.id
            this.cid = staff.cid
            this.addOn = Date.now()
        }
    }
}

/**
 * 流程节点
 */
class ProcessNode extends LinkToProcessModel {
    static get tableName(){
        return `${config.db.prefix}processNode`
    }

    /**下一处理人ID */
    nextSId = undefined
    /**下一处理人名称 */
    nextSName = undefined
    /**处理（操作）类型 */
    type    = undefined
    /**当前步骤（通常来自上一节点） */
    action  = undefined
    /**下一步骤 */
    nextAction = undefined
    /**留言 */
    summary = undefined

    /**
     *
     * @param {Process} process
     * @param {Staff} staff
     */
    constructor(process, staff){
        super()
        if(staff){
            this.sid = staff.id
            this.sname = staff.name
        }
        if(process){
            this.pid = process.id
            this.addOn = Date.now()
        }
    }
}

/**
 * 流程数据
 */
class ProcessData extends BaseAddonModel {
    static get tableName(){
        return `${config.db.prefix}processData`
    }

    static get jsonAttributes(){
        return [VALUE]
    }

    /**@type {Number} 用户ID */
    sid     = undefined
    /**@type {Number} 关联流程ID */
    pid     = undefined
    /**@type {Number} 流程模板ID */
    fid     = undefined
    /**@type {Boolean} */
    active  = undefined
    /**@type {Object} 内容（通常是 JSON 格式） */
    value   = undefined
    /**@type {Number} */
    status  = undefined
}

/**
 * 流程的留言/数据
 */
class ProcessLog extends LinkToProcessModel {
    static get tableName(){
        return `${config.db.prefix}processLog`
    }
    value   = undefined
}

module.exports = { Process, ProcessNode, ProcessData, ProcessLog }
