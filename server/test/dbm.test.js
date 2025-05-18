const { runSQL } = require("../src/db/schema");
const { withDB } = require("../src/init");

const sql = process.argv.splice(2)[0] || "SELECT * FROM account"

withDB(async ()=>{
    console.debug(`执行SQL`, sql)
    let result = await runSQL(sql)
    console.debug(result)
})
