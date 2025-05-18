const logger = require("../src/common/logger");
const { stringToBase64 } = require("../src/common/secret");
const { withDB } = require("../src/init");
const { AccountService } = require("../src/service");

const name = "test"
const pwd = "test.!123"

withDB(async ()=>{
    let id = await AccountService.create(name, pwd)
    logger.debug(`尝试新建用户 ${name}, PWD=${pwd}，ID=${id}`)

    logger.debug(`检验登录（错误密码）：`, await AccountService.verification(name, pwd))
    logger.debug(`检验登录：`, await AccountService.verification(name, stringToBase64(pwd)))

    await AccountService.remove(id)
}, "AccountService 测试")
