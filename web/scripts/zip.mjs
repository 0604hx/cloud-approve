/**
 * 将 ../dist 中的全部文件，压缩到 ../www.zip
 */
import { existsSync, statSync } from 'node:fs'
import chalk from "chalk"
import AdmZip from 'adm-zip'

const originDir = "dist"
const targetFile = "www.zip"

if(!existsSync(originDir) || !statSync(originDir).isDirectory()){
    console.error(`源目录 ${originDir} 不存在或不是一个有效目录`)
    process.exit()
}

console.info(`即将开始压缩前端文件...`)
const zip = new AdmZip()
zip.addLocalFolder(originDir)
zip.writeZip(targetFile)

const size = `（大小 ${(statSync(targetFile).size/1024).toFixed(2)} KB）`
console.info(`成功压缩 ${chalk.magenta(originDir)} 到 ${chalk.magenta(targetFile)}${chalk.gray(size)} :)`)
