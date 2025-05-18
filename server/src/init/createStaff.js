const { withDB } = require(".")
const enquirer = require('enquirer')
const logger = require("../common/logger")
const { Account, Staff } = require("../db")
const { ID, NAME, CID, SUMMARY } = require("../fields")
const { wrap } = require("../common")

let [ aid ] = process.argv.slice(2)

withDB(async knex=>{
    if(!aid){
        const r = await enquirer.prompt({type:'text', name:'id', message:'ACCOUNT编号或名称'})
        aid = r.id
    }

    const account = await Account.query().where(ID, aid).orWhere(NAME, aid).first()
    if(!account)    throw `ACCOUNT${wrap(aid)}不存在`
    logger.debug(`即将为${wrap(account.name)}创建员工信息...`)

    const staff = await enquirer.prompt([
        {type:'text', name:NAME, message:'员工名称'},
        {type:'text', name:CID, message:`关联的企业ID`, initial: 0},
        {type:'text', name:"phone", message:'手机号'},
        {type:'text', name:SUMMARY, message:'描述信息'}
    ])
    staff.addOn = Date.now()

    await Staff.query().insert(staff)
    logger.info(`员工信息已保存！`)
})
