const { withDB } = require(".")
const logger = require("../common/logger")
const { sm4Encrypt } = require("../common/secret")
const config = require("../config")
const { Account } = require("../db")
const AccountService = require("../service/AccountService")

let [ name, pwd ] = process.argv.slice(2)
if(!name)   throw `用户名必须填写`

if(!pwd){
    pwd = '.CA123456'
    logger.debug(`使用默认密码：${pwd}`)
}

logger.debug(`即将创建用户，name=${name} pwd=${pwd}`)

withDB(async knex=>{
    return await AccountService.create(name, pwd)
})
