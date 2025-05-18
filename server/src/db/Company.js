const config = require("../config")
const { BaseAddonModel } = require("./abstract");

module.exports = class Company extends BaseAddonModel{
    static get tableName(){
        return `${config.db.prefix}company`
    }

    name    = undefined
    summary = undefined
    expire  = undefined
}
