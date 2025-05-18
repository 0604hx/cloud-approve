const ACTION_DEAL = "deal"
const ACTION_DONE = "done"
const ACTION_BACK = "back"

const CWEBP = "cwebp"

/**
 * @typedef {Object} ActionBean
 * @property {String} label
 * @property {Array<String>} items
 *
 * @typedef {Object.<string, ActionBean>} Actions
 */

/**@type {Actions} */
const ACTIONS = {
    [ACTION_DEAL]   : {
        label: "交办",
        items: ["审核", "办理"]
    },
    [ACTION_DONE]   : {
        label: "办结",
        items:["办结（成功）","办结（失败）"]
    },
    [ACTION_BACK]   : {
        label: "退回",
        items: ["退回拟稿人","退回上一处理人"]
    }
}

const Roles = {
    ADMIN           : "ADMIN",
    COMPANY_ADMIN   : "COMPANY_ADMIN",
    DATA_MANAGER    : "DATA_MANAGER"
}
const RoleNames = {
    ADMIN           : "超级管理员",
    COMPANY_ADMIN   : "企业管理员",
    DATA_MANAGER    : "数据管理员"
}

const C = {
    COMMA           : ",",
    SPACE           : " ",
    ALL             : "*"
}

module.exports = {
    ID          : "id",
    VALUE       : "value",
    NAME        : "name",
    SUMMARY     : "summary",
    AID         : "aid",
    CID         : "cid",
    CNAME       : "cname",
    ACTIVE      : "active",
    ADD_ON      : "addOn",
    LAST_ON     : "lastOn",
    TYPE        : "type",
    ACTION      : "action",
    NEXT_ACTION : "nextAction",
    SID         : "sid",
    SNAME       : "sname",
    TITLE       : "title",
    STATUS      : "status",
    PID         : "pid",
    FID         : "fid",
    CUR_SID     : "curSId",
    EXPIRE      : "expire",
    OPTIONS     : "options",
    CHAINS      : "chains",
    SIZE        : "size",
    PATH        : "path",
    SORT        : "sort",
    ROLE        : "role",
    CODE        : "code",
    LAUNCH      : "launch",
    ORIGIN      : "origin",
    TARGET      : "target",
    EXT         : "ext",
    FORMAT      : "format",
    ABOUT       : "about",
    FNAME       : "fname",
    CONTENT     : "content",
    PHONE       : "phone",
    AUTH        : "auth",
    PERSONAL    : "personal",

    CONFIG_FILE : "config.json",
    C,
    ACTION_DEAL, ACTION_DONE, ACTION_BACK,
    ACTIONS,
    Roles, RoleNames,

    CWEBP
}
