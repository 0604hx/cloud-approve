const { Isolate, Reference, ExternalCopy } = require('isolated-vm')
const vm = require('node:vm')
const logger = require("../common/logger")
const config = require("../config")
const { Func, Staff, Process, ProcessNode } = require("../db")
const StaffBean = require("../db/Staff")
const { LAUNCH, ID } = require('../fields')
const { ProcessLog } = require('../db/Process')
const { hasRelation } = require('./CacheService')

const checkAndLoad = async funcId=>{
    if(config.func.enable!= true)
        throw `动态函数FUNC功能未开启`
    let func = await Func.query().findById(funcId)
    if(!func || func.id != funcId)
        throw `动态函数#${funcId}不存在`

    return func
}

/**
 *
 * @param {import('objection').ModelClass} model
 * @param {*} whereOrId
 * @param {Pagination} pagination
 * @returns
 */
const query = async (model, whereOrId, pagination)=>{
    if(typeof(whereOrId) == 'number' || typeof(whereOrId) == 'string')
        return await model.query().findById(whereOrId)

    let q = model.query().where(whereOrId)
    if(pagination){
        if(Array.isArray(pagination.columns) && pagination.columns.length)
            q.columns(...pagination.columns)
        if(pagination.pageSize>0)
            q.page((pagination.page??1)-1, pagination.pageSize)
    }
    return await q
}

const queryStaff = async (w,p)=> await query(Staff, w, p)
const queryProcess = async (w, p)=> await query(Process, w, p)
const queryLog = async (w,p)=> await query(ProcessLog, w, p)
const queryNode = async (w, p)=> await query(ProcessNode, w, p)

const queryStaffIsolated =  async (w, p)=>new ExternalCopy(await queryStaff(w, p)).copyInto()
const queryProcessIsolated =  async (w, p)=>new ExternalCopy(await queryProcess(w, p)).copyInto()
const queryLogIsolated =  async (w, p)=>new ExternalCopy(await queryLog(w, p)).copyInto()
const queryNodeIsolated =  async (w, p)=>new ExternalCopy(await queryNode(w, p)).copyInto()

/**
 * 在隔离环境下执行代码
 * @param {StaffBean} staff
 * @param {String} code
 * @param {Object} params
 * @returns {*}
 */
const runCodeIsolated = async (staff, code, params={})=>{
    //创建隔离环境
    const isolate = new Isolate({memoryLimit: 64})
    const context = isolate.createContextSync()

    const jail = context.global
    jail.setSync('debug', (...ps)=>{logger.debug(...ps)})
    jail.setSync('info', (...ps)=>{logger.info(...ps)})
    jail.setSync('error', (...ps)=>{logger.error(...ps)})
    jail.setSync('queryStaff', new Reference(queryStaffIsolated))
    jail.setSync('queryProcess', new Reference(queryProcessIsolated))
    jail.setSync('queryNode', new Reference(queryNodeIsolated))
    jail.setSync('queryLog', new Reference(queryLogIsolated))

    //对于异步函数的调用，需要增加 applySyncPromise 的链式调用，故须先进行代码替换
    const script = `(async (staff, params)=>{
        ${code.replace(/query([A-Z]\w*)\(([^)]+)\)/g, (m,p1,p2)=>`query${p1}.applySyncPromise(null, [${p2}])`)}
    });`;

    const fn = await context.eval(script, { reference: true })
    return await fn.apply(
        undefined,
        [
            new ExternalCopy(staff).copyInto(),
            new ExternalCopy(params).copyInto()
        ],
        { result: { promise: true, copy:true } }
    )
}

/**
 * 在 node.js 自带的 VM 中执行代码
 * @param {StaffBean} staff
 * @param {String} code
 * @param {Object} params
 */
const runCodeWithVM = async (staff, code, params={})=>{
    const ctx = vm.createContext({
        console,        // 允许使用 console.log
        setTimeout,     // 允许使用 setTimeout
        Promise,        // 允许使用 Promise
        // 注入日志模块
        debug :(...ps)=>logger.debug(...ps),
        info:(...ps)=> logger.info(...ps),
        error:(...ps)=>logger.error(...ps),
        //全局参数
        staff,
        params,
        //异步数据库函数
        queryStaff,
        queryNode,
        queryProcess,
        queryLog
    })
    const script = new vm.Script(`
        (async ()=>{
            ${code}
        })();
    `)
    const result =  await script.runInContext(ctx, {timeout:20*1000})
    global.isDebug && logger.debug("VM执行结果", result)
    return result
}

/**
 * 执行动态函数
 * @param {StaffBean} staff
 * @param {Number} funcId
 */
exports.runFunc = async (staff, funcId, params={})=>{
    let func = await checkAndLoad(funcId)
    if(!(await hasRelation(staff.id, func.id, Func.tableName)))
        throw `用户${staff.fullName}未授权调用该动态函数`

    logger.info(`${staff.fullName}尝试以⌈${config.func.isolated?"":"非"}隔离模式⌋执行函数#${funcId}/${func.name}...`)

    await Func.query().where(ID, funcId).increment(LAUNCH, 1)
    if(config.func.isolated)
        return await runCodeIsolated(staff, func.code, params)
    else
        return await runCodeWithVM(staff, func.code, params)
}

exports.runCodeIsolated = runCodeIsolated
exports.runCodeWithVM   = runCodeWithVM
