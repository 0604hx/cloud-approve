const { get, post } = require('axios')
const { loadWithCidAndName } = require("./ConstantService")
const logger = require('../common/logger')

/**
 * @typedef {Object} DDTokenResponse - 钉钉获取token效应值
 * @property {String} access_token - token值
 * @property {Number} expires_in - 有效期（单位秒）
 * @property {Number} errcode - 错误代码
 * @property {String} errmsg - 错误信息
 *
 * @typedef {Object} DDUser - 钉钉用户信息
 * @property {String} userid
 * @property {String} unionid - 唯一编号
 * @property {String} name - 用户名称
 *
 * @typedef {Object} DDUserResponse - 钉钉用户信息响应值
 * @property {DDUser} result
 * @property {String} request_id
 * @property {Number} errcode - 错误代码
 * @property {String} errmsg - 错误信息
 */

const DING_HOST = "https://oapi.dingtalk.com"

let localToken = {
    value: "",
    expire: 0
}

const isTokenExpired = ()=> !localToken.value || localToken.expire<=Date.now()
const log = (msg, level='info')=> logger[level](`[钉钉] ${msg}`)

exports.loginWithCode = async (cid, code)=>{
    if(isTokenExpired()){
        /**@type {CompanyConfig} */
        let cfg = await loadWithCidAndName(cid)
        if(!cfg || !(cfg.ddAppKey && cfg.ddAppSecret))
            throw `企业未配置钉钉登录`

        let url = `${DING_HOST}/gettoken?appkey=${cfg.ddAppKey}&appsecret=${cfg.ddAppSecret}`
        /**@type {{data:DDTokenResponse}} */
        let { data } = await get(url)

        if(data.errcode != 0){
            log(`获取企业 token 失败：${data.errcode}|${data.errmsg}`, 'error')
            throw data.errmsg
        }

        localToken.value = data.access_token
        localToken.expire = Date.now() + data.expires_in*1000

        log(`更新 TOKEN 为 ${localToken.value}（EXPIRED=${data.expires_in}）`)
    }

    let url = `${DING_HOST}/topapi/v2/user/getuserinfo?access_token=${localToken.value}`
    /**@type {{data:DDUserResponse}} */
    let { data } = await post(url, { code })
    if(data.errcode != 0){
        log(`[钉钉] 获取用户信息失败：${data.errcode}|${data.errmsg}`, 'error')
        throw data.errmsg
    }

    global.isDebug && log(`获取用户信息 ${data.result.userid}/${data.result.name}`, 'debug')
    return data.result
}
