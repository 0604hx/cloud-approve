const { pipeline } = require('node:stream/promises')

const { AuthBean } = require("../beans")
const StaffBean = require("../db/Staff")
const { Roles } = require("../fields")
const { loadStaff } = require("../service/CacheService")
const { dirname } = require('node:path')
const { mkdirSync, existsSync, createWriteStream } = require('node:fs')

/**
 * @callback StaffWorker
 * @param {StaffBean} staff
 */

/**
 * @param {import("fastify").FastifyRequest} req
 * @param {StaffWorker} worker
 */
exports.withStaff = async (req, worker)=>{
    /**@type {StaffBean} */
    const staff = await loadStaff(req.user.id)
    if(!staff || !staff.id)
        throw `员工信息错误#${req.user.id}`

    return await worker(staff)
}

/**
 * 如果不存在用户ID，则报错
 * @param {import("fastify").FastifyRequest} req
 * @param {String} msg - 提示信息
 */
exports.needSid = (req, msg="NOT_LOGIN")=>{
    if(!(req.user && req.user.id))
        throw msg
    return req.user.id
}

/**
 * 转换为标准的 Result 对象
 * @param {PageResult} re
 * @returns {Object}
 */
exports.pageToResult = re=>({success: true, data: re.results, total: re.total})

/**
 *
 * @param {import("fastify").FastifyRequest} req
 * @param {String} role - 权限
 * @returns {AuthBean}
 */
exports.needRole = (req, role=Roles.ADMIN)=>{
    /**@type {AuthBean} */
    let user = req.user

    if(!user.hasRole(role))
        throw `此功能需要${role}权限`
    return user
}

/**
 *
 * @param {Readable} origin
 * @param {String} target
 */
exports.saveToFile = async (origin, target)=>{
    let dir = dirname(target)
    existsSync(dir) || mkdirSync(dir, {recursive:true})
    await pipeline(origin, createWriteStream(target))
}
