const { uuid } = require("../src/common/tool")

for (let i = 0; i < 100; i++) {
    console.debug(`[${`${i+1}`.padStart(5, "0")}] UUID`, uuid())
}
