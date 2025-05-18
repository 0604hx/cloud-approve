const logger = require("../common/logger");
const config = require("../config");
const { OpLog, RoleLink } = require("../db");
const StaffBean = require("../db/Staff");
const { C } = require("../fields");

module.exports = {
    /**
     *
     * @param {Number} id
     * @returns {Array<String>}
     */
    loadRolesById : async id=>{
        //加载角色
        const link = await RoleLink.query().findById(id)
        return link && link.role ? link.role.split(C.COMMA).map(v=>v.trim()):[]
    },

    /**
     *
     * @param {StaffBean} staff
     * @param {String} op
     * @param {String} mod
     * @param {Boolean}
     */
    opLog : (staff, op, mod=null, showLogger=true)=>{
        let log = new OpLog()
        log.sid = staff.id
        log.cid = staff.cid
        log.mod = mod
        log.summary = op
        log.addOn = Date.now()

        config.sys.log && OpLog.query().insert(log).then()

        showLogger && logger.info(`${staff.fullName}${op}`)
    }
}
