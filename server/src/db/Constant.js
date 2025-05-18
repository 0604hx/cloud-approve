const config = require("../config")
const { BaseModel } = require("./abstract")

module.exports = class Constant extends BaseModel {
    static TEXT     = "text"
    static NUMBER   = "number"
    static BOOL     = "bool"
    static LIST     = "list"
    static JSON     = "json"

    static get tableName(){
        return `${config.db.prefix}constant`
    }

    cid     = undefined
    name    = undefined
    /**数据格式 */
    type    = undefined
    value   = undefined
}
