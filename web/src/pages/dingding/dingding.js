/**
 * 注意，此处用的是旧版 api
 * https://open.dingtalk.com/document/orgapp/jsapi-overview
 *
 * 感觉钉钉团队没有在维护呀，新版api都没介绍怎么引入😔
 */

import { runtime } from 'dingtalk-jsapi'

export const requestAuth = async (corpId)=> {
    let { code } = await runtime.permission.requestAuthCode({corpId})
    return code
}
