const jwt = require('jsonwebtoken')

const KEY = "d1e0c48b7baccd62e65ad4736ae6ed11"

const token = jwt.sign(
    {name:"集成显卡"},
    KEY,
    {
        expiresIn: "10d",
        issuer: "CLOUD-APPROVE",
        subject: "ACCOUNT"
    }
)

console.debug("TOKEN：", token)

console.debug("校验", jwt.verify(token, KEY))
