const { withDB } = require("../src/init");
const { loginWithCode } = require("../src/service/DingdingService");

withDB(async ()=>{
    let user = await loginWithCode(1, "abc")
    console.debug(user)
})
