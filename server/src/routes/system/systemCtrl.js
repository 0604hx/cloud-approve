const logger = require("../../common/logger")
const { needRole, saveToFile, pageToResult, withStaff } = require("../web-helper")
const { statSync } = require('node:fs')
const AdmZip = require('adm-zip')
const config = require("../../config")
const { success } = require("../../common")
const { emptyDir, osAndAppStats } = require("../../common/tool")
const { countOfData, loadCompanyName, loadStaffName, isCWEBPInstalled } = require("../../service/CacheService")
const { OpLog, Constant } = require("../../db")
const { CWEBP } = require("../../fields")
const { ConstantService } = require("../../service")
const ConstantBean = require('../../db/Constant')
const { stats, clear } = require("../../common/cache")

const wwwFile = "./www.zip"

/**
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/system/ops-dashboard", async ()=>{
        let os = await osAndAppStats()
        let data = await countOfData()
        let warnings = []
        if(config.img.toWebp){
            if(!(await isCWEBPInstalled()))
                warnings.push(`平台已启用 ⌈图片转${CWEBP}⌋ 选项，但是并未安装 ${CWEBP} 命令行工具，图片压缩功能将失效`)
        }
        return success({os, data, warnings})
    })

    app.post("/system/ops-www", async req=>{
        let user = needRole(req)

        let part = await req.file()
        await saveToFile(part.file, wwwFile)
        logger.info(`${user.fullName}上传前端资源文件 ${wwwFile}（大小${(statSync(wwwFile).size/1024).toFixed(2)}KB）`)

        emptyDir(config.wwwDir)

        const zip = new AdmZip(wwwFile)
        const lines = zip.getEntries().map(e=>({
            name: e.entryName,
            sizeOrigin: e.header.size,
            sizeZip: e.header.compressedSize,
            directory: e.isDirectory,
            time: e.header.time
        }))
        zip.extractAllTo(config.wwwDir, true)
        return success(lines)
    })

    app.post("/system/log-list", async req=>{
        const { form, pagination } = req.body
        return pageToResult(await OpLog.pageSelect(form, pagination, async row=> {
            await loadCompanyName(row)
            await loadStaffName(row)
        }))
    })

    //========================常量管理========================
    app.post("/system/constant-list",  req=> withStaff(req, async staff=>{
        const { form, pagination } = req.body

        return pageToResult(await Constant.pageSelect(form, pagination, loadCompanyName))
    }))

    app.post("/system/constant-add",  req=>withStaff(req, async staff=>{
        /**@type {ConstantBean} */
        let bean = req.body

        await ConstantService.createOrUpdate(bean, staff, false)
    }))

    app.post("/system/constant-del", req=> withStaff(req, async staff=>{
        let { id } = req.body
        await ConstantService.del(id, staff, false)
    }))
    //========================常量管理========================

    //========================缓存管理========================
    app.post("/system/cache", req=>success(stats()))
    app.post("/system/cache-del", req=>{
        let { id, prefix=false } = req.body
        let size = clear(id, prefix)
        logger.info(`${req.user.fullName}清除缓存 #${id}（前缀删除=${prefix}）${size}个`)
        return success(size)
    })
    //========================缓存管理========================
}
