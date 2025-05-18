/**
 * 测试流程表单数据
 */

const { ProcessData } = require("../src/db");
const { withDB } = require("../src/init");
const { ProcessService } = require("../src/service");

withDB(async ()=>{
    let q = ProcessData.query()
    q.where("fid", 1)
    q.whereJsonPath('value', '$.username', '=', '管理员')
    let list = await q

    console.debug(list)

    console.debug(await ProcessService.loadData(
        {
            "EQ_fid": 2,
            "$.username": "管理员"
        }
    ))
})
