const { resolve, join } = require('node:path')
const config = require('../src/config')

console.debug(config.dataDir, resolve(config.dataDir), join(config.dataDir))
const p = resolve(config.dataDir, "2025", "img.jpg")
console.debug(p)
