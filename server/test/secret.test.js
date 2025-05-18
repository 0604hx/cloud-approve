const { sm4Encrypt, sm4Decrypt, sm3 } = require("../src/common/secret")
const config = require("../src/config")

const text = "集成显卡"
const sm4Key = sm3(`${Date.now()}`).substring(8, 40)

console.debug("SM4密钥：", sm4Key)

let sm4Text = sm4Encrypt(text, sm4Key)
console.debug("SM4加密：", sm4Text)
console.debug("SM4解密：", sm4Decrypt(sm4Text, sm4Key))

console.debug(Buffer.from("admin222").toString('hex'))
