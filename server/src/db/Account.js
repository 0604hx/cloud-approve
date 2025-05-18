const config = require("../config")
const { BaseAddonModel } = require("./abstract")

module.exports = class Account extends BaseAddonModel {
    static Types = {
        MOBILE  : "mobile",
        DINGDING: "dingding",
        WECHAT  : "wechat",
        OTHER   : "other"
    }

    static get tableName(){
        return `${config.db.prefix}account`
    }

    cid     = undefined     //关联的企业ID
    name    = undefined
    pwd     = undefined
    type    = undefined
    sid     = undefined     //关联的员工ID
    active  = undefined

    constructor(name, pwd){
        super()
        if(name || pwd){
            this.type = Account.Types.OTHER
            this.active = true
        }
    }

    get fullName(){
        return `${this.name}(${this.id})`
    }
}
