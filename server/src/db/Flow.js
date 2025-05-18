const config = require("../config");
const { OPTIONS, CHAINS } = require("../fields");
const { BaseAddonModel } = require("./abstract");

module.exports = class Flow extends BaseAddonModel{
    static get tableName(){
        return `${config.db.prefix}flow`
    }

    static get jsonAttributes(){
        return [OPTIONS, CHAINS]
    }

    cid     = undefined
    name    = undefined
    value   = undefined

    /**
     * 审批链条（适用于极简流程）
     * add on 2025-03-25
     * @type {Array<Number>}
     */
    chains  = undefined

    /**
     * 参数
     * actions  预设办理流程
     * titleTpl 标题模板
     * auto     流程自动化
     * @type {FlowOptions}
     */
    options = undefined
    summary = undefined

    /**
     * @returns {Boolean}
     */
    hasChain(){
        return Array.isArray(this.chains) && this.chains.length
    }
}
