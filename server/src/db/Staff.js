const config = require("../config")
const { BaseAddonModel } = require("./abstract");

module.exports = class Staff extends BaseAddonModel{
    static get tableName(){
        return `${config.db.prefix}staff`
    }

    cid     = undefined
    name    = undefined
    phone   = undefined
    summary = undefined

    get fullName(){
        return `${this.name}(${this.id})`
    }
}
