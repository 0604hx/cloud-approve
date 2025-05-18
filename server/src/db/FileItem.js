const config = require("../config")
const { LinkToProcessModel } = require("./abstract");

module.exports = class FileItem extends LinkToProcessModel{
    static get tableName(){
        return `${config.db.prefix}file`
    }

    cid     = undefined
    name    = undefined
    size    = undefined
    ext     = undefined
    path    = undefined
    summary = undefined
}
