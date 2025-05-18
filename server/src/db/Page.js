const config = require("../config");
const { CONTENT, C, ID, FID, NAME, FORMAT, SUMMARY, ADD_ON, AUTH, PERSONAL } = require("../fields");
const { BaseAddonModel } = require("./abstract");

module.exports = class Page extends BaseAddonModel{
    static get tableName(){ return `${config.db.prefix}page`}
    static get jsonAttributes(){ return [CONTENT]}

    static FORMAT_NORMAL    = "normal"
    static FORMAT_SFC       = "sfc"
    static SIMPLE_COLUMNS   = [ID, FID, AUTH, PERSONAL, NAME, FORMAT, SUMMARY, ADD_ON]

    /**@type {String} */
    name    = undefined
    /**@type {Number} 关联的模板ID */
    fid     = undefined
    /**@type {Boolean} 私人页面（只加载隶属于个人的流程数据）*/
    personal= undefined
    /**@type {String} 授权信息 */
    auth    = undefined
    /**@type {String} 格式*/
    format  = undefined
    /**@type {String} 说明信息（支持HTML） */
    about   = undefined
    /**@type {Object} 定制页面（详见 web\src\service\Page.js 中 PageContent） */
    content = undefined
    summary = undefined

    /**
     *
     * @param {Number} sid
     * @returns {Boolean}
     */
    hasAuth (sid){
        if(this.auth == null)   return false
        if(this.auth == C.ALL)    return true
        return this.auth.split(C.COMMA).map(v=>v.trim).includes(`S${sid}`)
    }
}
