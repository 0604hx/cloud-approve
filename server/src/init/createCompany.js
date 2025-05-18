const Enquirer = require("enquirer")
const { withDB } = require(".")
const CompanyBean = require("../db/Company")
const { Company } = require("../db")
const logger = require("../common/logger")
const { NAME, SUMMARY, EXPIRE } = require("../fields")

withDB(async ()=>{
    /**
     * @type {CompanyBean}
     */
    const com = await Enquirer.prompt([
        {type:'text', name:NAME, message:'企业名称'},
        {type:'text', name:SUMMARY, message:'描述信息'},
        {type:'numeral', name:EXPIRE, message:'有效期（单位年）', initial: 0}
    ])
    if(com.expire>0)
        com.expire = Date.now() + com.expire*365*24*60*60*1000
    com.addOn = Date.now()
    await Company.query().insert(com)
    logger.info(`企业信息已保存 :)`)
})
