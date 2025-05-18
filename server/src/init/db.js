const logger = require("../common/logger")
const { withDB } = require(".")
const { createTableIfNotExist } = require("../db/schema")

const createTables = ()=>withDB(async knex=>{
    await createTableIfNotExist(knex)
    process.exit()
})

const dropTable = name=> withDB(async knex=>{
    await knex.schema.dropTableIfExists(name)
    return `删除表 ${name}（仅限已存在的表）`
})

const showTables = ()=> withDB(async knex=>{
    const tables = await knex.raw(`SELECT name,sql FROM sqlite_master WHERE type='table' AND name!='sqlite_sequence'`);
    logger.debug(`共有${tables.length}个表...`)
    tables.forEach(v=>{
        console.group(v.name)
        console.debug(v.sql)
        console.groupEnd()
    })
})

const start = async ()=>{
    const args = process.argv.splice(2)
    if(args.length == 0){
        return console.debug(`请通过 init、del、show 等指令进行数据库相关操作...`)
    }

    const action = args[0].toLowerCase()
    if(action=='init')
        createTables()
    if(action=='del' || action=='delete'){
        let name = args[1]
        if(!name){
            logger.error(`请输入表格名称，示例 del user`)
        }
        dropTable(name)
    }
    else if(action == 'show'){
        showTables()
    }
}

start()
