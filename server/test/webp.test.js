const { runOSCmd } = require("../src/common/tool");

const v = runOSCmd('cwebp', ['-version'])
console.debug(v)
process.exit(0)
