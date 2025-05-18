const Status = {
    WORKING : 0,
    DONE    : 1,
    CANCEL  : 2
}

class AuthBean {
    id      = 0
    aid     = undefined
    name    = ""
    cid     = undefined //组织/公司ID
    cname   = undefined //组织/公司名称
    roles   = []        //角色列表
    ip      = undefined //IP地址

    constructor(id=0,name="", roles=[], ip=undefined){
        this.id     = id
        this.name   = name
        this.roles  = roles
        this.ip     = ip
    }

    /**
     *
     * @param {Number} id
     * @param {String} aid
     * @returns
     */
    static simple = (id, aid)=>({id, aid})

    get fullName(){
        return `${this.name}(${this.id})`
    }

    hasRole (...role){
        return role.some(r=>this.roles.includes(r))
    }
}

module.exports = {
    AuthBean,
    Status
}
