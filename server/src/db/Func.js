const config = require("../config")
const { BaseAddonModel } = require("./abstract");

module.exports = class Func extends BaseAddonModel {
    static get tableName(){
        return `${config.db.prefix}func`
    }

    /**@type {Number} */
    sid     = undefined
    /**@type {String} */
    name    = undefined
    /**@type {String} */
    code    = undefined
    /**@type {String} */
    summary = undefined
    /**@type {Number} */
    launch  = undefined
}
