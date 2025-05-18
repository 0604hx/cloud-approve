const config = require("../config");
const { BaseAddonModel, BaseModel } = require("./abstract");

class Role extends BaseAddonModel{
    static get tableName(){ return `${config.db.prefix}sys_role` }

    cid     = undefined
    name    = undefined
    summary = undefined

    static of(id, cid, name, summary){
        let r = new Role()
        r.id = id
        r.cid = cid
        r.name = name
        r.summary = summary
        r.addOn = Date.now()
        return r
    }
}

/**
 * ID 即为 Staff ID
 */
class RoleLink extends BaseModel{
    static get tableName(){ return `${config.db.prefix}sys_roleLink` }

    role    = undefined
}

/**
 * 数据关联
 */
class Relation extends BaseAddonModel {
    static get tableName(){ return `${config.db.prefix}sys_relation` }

    from    = undefined
    to      = undefined
    type    = undefined
}

class OpLog extends BaseAddonModel{
    static get tableName(){ return `${config.db.prefix}sys_log` }

    sid     = undefined
    cid     = undefined
    mod     = undefined
    summary = undefined
}

module.exports = { Role, RoleLink, Relation, OpLog }
