const logger = require("../src/common/logger");
const { withDB } = require("../src/init");
const { ConstantService } = require("../src/service");

withDB(async ()=>{
    logger.debug(`当前常量表`, await ConstantService.all())

    const id = "TEST"
    await ConstantService.set(id, Date.now())
    logger.debug(`ID=${id} 的常量值为`, await ConstantService.get(id))
}, "ConstantService测试")
