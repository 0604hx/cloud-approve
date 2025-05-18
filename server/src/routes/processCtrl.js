const { resolve, extname, join } = require('node:path')

const { Status } = require("../beans")
const { success, D } = require("../common")
const logger = require("../common/logger")
const { ProcessData, FileItem } = require("../db")
const { Process, ProcessNode, ProcessLog } = require("../db/Process")
const { PID, SUMMARY, CWEBP, Roles } = require("../fields")
const { ProcessService, ConstantService } = require("../service")
const { loadStaff, isCWEBPInstalled, loadFlow, loadStaffName } = require("../service/CacheService")
const { withStaff } = require("./web-helper")
const config = require('../config')
const { uuid, runOSCmd } = require('../common/tool')
const { pipeline } = require('node:stream/promises')
const { createWriteStream, existsSync, mkdirSync, statSync, createReadStream, unlinkSync } = require('node:fs')
const { opLog } = require('../service/SystemService')
const FileItemBean = require('../db/FileItem')

/**
 *
 * @param {*} staff
 * @param {Number} fid
 * @returns {FileItemBean}
 */
const loadAndCheckFileItem = async (staff, fid)=>{
    let file = await FileItem.query().findById(fid)
    if(!file)   throw `无效的资源`

    await ProcessService.checkViewAuth(staff, file.pid)
    return file
}

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/process-create", async req=> withStaff(req, async staff=>{
        /**@type {{process:Process, node:ProcessNode, data:Object}} */
        let { process, node, data } = req.body

        let time = Date.now()

        //开启事务
        const trx = await Process.startTransaction()
        process.sid = staff.id
        process.cid = staff.cid
        process.curSId = node.nextSId
        if(process.curSId == staff.id)
            process.curSName = staff.name
        else
            process.curSName = (await loadStaff(node.nextSId)).name
        process.status = Status.WORKING
        process.addOn = time
        process.lastOn= time

        //保存到数据库
        let newP = await Process.query(trx).insert(process)

        if(!node.nextSName)
            node.nextSName = process.curSName
        node.pid = newP.id
        node.sid = staff.id
        node.sname = staff.name
        node.addOn = time
        await ProcessNode.query(trx).insert(node)

        let d = new ProcessData()
        d.status = process.status
        d.pid = newP.id
        d.fid = process.fid
        d.sid = staff.id
        d.active = true
        d.value = data //typeof(data)=='string'?data:JSON.stringify(data)
        d.addOn = time
        await ProcessData.query(trx).insert(d)

        trx.commit()

        opLog(staff, `发起流程 ${process.title}，模板=${process.fid}/${process.fName}，下一步骤=${node.nextAction}`, Process.tableName)
        return success(newP.id)
    }))

    app.post("/process-:type", async req=> withStaff(req, async staff=>{
        let { type } = req.params
        let { form, pagination } = req.body
        let isTodo = false

        if(type=='mine')
            form['EQ_sid'] = staff.id
        else if(type=='todo'){
            isTodo = true
            form['EQ_curSId'] = staff.id
            form['EQ_status'] = Status.WORKING
        }
        else
            throw `无效的查询类型：${type}`

        if(global.isDebug) logger.debug(`获取 ${type} 流程清单[PAGE = ${pagination.page}]`, form)
        /**@type {{results:Array<Process>}} */
        let { results:data, total } = await Process.pageSelect(form, pagination, isTodo?loadStaffName:null)
        if(isTodo){
            //作快捷同意的预处理
            for (let i = 0; i < data.length; i++) {
                let flow = await loadFlow(data[i].fid)
                if(flow.hasChain() || flow.options.auto == true){
                    data[i]._auto = true
                }
            }
        }

        return { success:true, data, total }
    }))

    /**
     * 获取流程详细信息
     */
    app.post("/process-detail-:id",async req=> withStaff(
        req,
        async staff=>success(await ProcessService.getById(staff, req.params.id))
    ))

    app.post("/process-flow-data", async req=> withStaff(req, async staff=>{
        let { flowId, pid } = req.body
        let { flow, data } = await ProcessService.loadFlowData(staff, pid, flowId)
        return success(flow, data)
    }))

    app.post("/process-nodes", async req=> withStaff(
        req,
        async staff=> success(await ProcessService.loadNodes(staff, req.body.pid))
    ))

    app.post("/process-approve", async req=> withStaff(
        req,
        async staff => await ProcessService.approve(staff, req.body)
    ))

    /**
     * 快捷同意（自动进入下一步骤）
     */
    app.post("/process-auto-approve", async req=> withStaff(req, async staff=>{
        let { id } = req.body
        await ProcessService.autoApprove(staff, id)
    }))

    app.post("/process-done", async req=> withStaff(
        req,
        async staff=> await ProcessService.done(staff, req.body.id)
    ))

    app.post("/process-del", async req=> withStaff(
        req,
        async staff=> await ProcessService.del(staff, req.body.id)
    ))

    app.post("/process-files", async req=> withStaff(
        req,
        async staff=> success(await ProcessService.loadFiles(staff, req.body.pid))
    ))

    app.post("/process-file-upload", async req=> withStaff(req, async staff=>{
        let multipart = await req.file()
        let pid = multipart.fields[PID]?.value
        let p = await ProcessService.checkViewAuth(staff, pid, true)

        /*
        处理文件，保存到 ${dataDir}/{YEAR}/{MM}/{UUID}
         */
        let ext = extname(multipart.filename).split(".").pop()
        let path = join(config.dataDir, D.year(), D.date(Date(), "MMDD"))
        existsSync(path) || mkdirSync(path, {recursive:true})
        path = join(path, `${uuid()}.${ext}`)
        await pipeline(multipart.file, createWriteStream(path))

        const { toWebp, exts, quality } = config.img
        //转换为 webp 格式
        if(isCWEBPInstalled() && toWebp && ext && exts.includes(ext.toUpperCase())){
            try{
                //执行cwebp压缩
                let output = path+".webp"
                runOSCmd(CWEBP, [path, '-q', quality, '-o', output])
                unlinkSync(path)

                path = output
                logger.info(`图片压缩到 ${path}`)
            }catch(e){
                logger.error(`压缩图片出错`, e)
            }
        }

        let f = new FileItem()
        f.linkTo(pid, staff)
        f.name = multipart.filename
        f.size = statSync(path).size
        f.ext  = ext
        f.summary = multipart.fields[SUMMARY]?.value
        f.path = path
        f.cid = staff.cid
        f.addOn = Date.now()

        await FileItem.query().insert(f)
        opLog(staff, `上传文件 ${f.name} 到流程 #${p.id}/${p.title}`, FileItem.tableName)
        return success(f)
    }))

    app.post("/process-file-del", async req=> withStaff(req, async staff=>{
        let file = await loadAndCheckFileItem(staff, req.body.id)
        //删除数据
        await FileItem.query().deleteById(file.id)
        if(existsSync(file.path))
            unlinkSync(file.path)
        opLog(staff, `删除附件 #${file.id}/${file.name}`, FileItem.tableName)
    }))

    app.post("/process-file-download", async (req, res)=> withStaff(req, async staff=>{
        let file = await loadAndCheckFileItem(staff, req.body.id)

        if(!existsSync(file.path))  throw `资源不存在（请联系管理员）`

        opLog(staff, `下载文件 #${file.ID}/${file.name}`, FileItem.tableName)

        // 设置响应头，促使浏览器下载
        const encodedFilename = encodeURIComponent(file.name)
        res.header('Content-Disposition', `attachment; filename*=${encodedFilename}`);
        return createReadStream(file.path)
    }))

    app.post("/process-log-list", async req=>withStaff(
        req,
        async staff=> success(await ProcessService.loadLogs(staff, req.body.pid))
    ))

    app.post("/process-log-add", async req=>withStaff(req, async staff=>{
        /**@type {ProcessLog} */
        let bean = req.body

        let p = await ProcessService.checkViewAuth(staff, bean.pid, true)

        bean.sid = staff.id
        bean.sname = staff.name
        bean.addOn = Date.now()
        await ProcessLog.query().insert(bean)
        logger.info(`${staff.fullName}录入「${p.id}#${p.title}」日志：${bean.value}`)
    }))

    app.post("/process-constants", req=>withStaff(req, async staff=>{
        //对于管理员，可以获取全部的数据
        let cid = req.user.hasRole(Roles.ADMIN)?null:staff.cid
        return success(await ConstantService.byIdsWithinCompany(cid, req.body))
    }))
}
