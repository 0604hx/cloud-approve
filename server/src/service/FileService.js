const { FileItem } = require("../db");
const { PID, NAME, SIZE, SID, SUMMARY, SNAME, ADD_ON, EXT, ID } = require("../fields")

module.exports = {
    listByProcess : async pid=> await FileItem.query().where(PID, pid).columns(ID, NAME, SIZE, EXT, SID, SUMMARY, SNAME, ADD_ON)
}
