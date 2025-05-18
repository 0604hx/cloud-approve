global.isDebug = true

const { Process } = require("../src/db");
const { withDB } = require("../src/init");

withDB(async ()=>{
    let page = await Process.pageSelect({"LIKE_title":"请款", "EQ_fid":1})
    console.debug(page.total)
    console.debug(page.results)
})
