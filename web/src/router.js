/*
 * @Author: 集成显卡
 * @Date: 2024-09-06 17:04:24
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2025-01-21 15:59:19
 */

import { createRouter, createWebHashHistory } from 'vue-router'

const DEFAULT   = import.meta.env.PUBLIC_DEFAULT_ROUTE
const HOME      = "/home"
const LOGIN     = "login"
const IGNORES = [ LOGIN, "logout" ]


/**@type {Array<import('vue-router').RouteRecordRaw>} */
const routes = [
    { name:"login", path:"/login", component: ()=> import('@V/Login.vue'), meta:{title:"登录页", layout:"empty"} },
    { name:"home", path:HOME, component: ()=> import('@V/首页/Home.vue'), meta:{title:"首页"} },
    { name:"change-pwd", path:"/change-pwd", component:()=> import('@V/维护/修改密码.vue')},

    { name:"process-mine", path:"/process/mine",  component: ()=> import('@V/流程/Mine.vue'), meta:{title:"我的流程"}},
    { name:"process-todo", path:"/process/todo",  component: ()=> import('@V/流程/Mine.vue'), meta:{title:"待我处理"}},
    { name:"process-view", path:"/process/:id", component: ()=> import('@V/流程/View.vue'), meta:{title:"查看流程", layout:"empty"} },
    { name:"page-local", path:"/page-local-:id", component: ()=> import('@V/页面/Index.vue'), meta:{title:"本地预览动态页面", layout:"empty"} },
    { name:"page-view", path:"/page-view-:id", component: ()=> import('@V/页面/Index.vue'), meta:{title:"动态页面", layout:"empty"} },
    { name:"page", path:"/page-:id", component: ()=> import('@V/页面/Index.vue'), meta:{title:"动态页面"} },

    { name:"company-dashboard", path:"/company/dashboard", component: ()=> import('@V/企业/总览.vue'), meta:{title:"企业总览"} },
    { name:"company-account", path:"/company/account", component:()=> import('@V/维护/账户管理.vue')},
    { name:"company-staff", path:"/company/staff", component:()=> import('@V/维护/员工管理.vue')},
    { name:"company-constant", path:"/company/constant", component:()=> import('@V/维护/常量管理.vue')},

    { name:"help-about", path:"/help/about", component: ()=> import('@V/其他/About.vue') },

    //系统管理
    { name:"sys-account", path:"/system/account", component:()=> import('@V/系统/账户管理.vue')},
    { name:"sys-staff", path:"/system/staff", component:()=> import('@V/维护/员工管理.vue')},
    { name:"sys-role", path:"/system/role", component:()=> import('@V/系统/角色管理.vue')},
    { name:"sys-company", path:"/system/company", component:()=> import('@V/系统/企业管理.vue')},
    { name:"sys-process", path:"/system/process", component:()=> import('@V/系统/流程管理.vue')},
    { name:"sys-flow", path:"/system/flow", component:()=> import('@V/系统/模板管理/Index.vue')},
    { name:"sys-flow-form", path:"/system/flow-form-:id", component: ()=> import('@V/系统/模板管理/表单编辑.vue'), meta:{title:"流程数据维护", layout:"empty"} },
    { name:"sys-dbm", path:"/system/dbm", component: ()=> import('@V/系统/数据维护/Index.vue'), meta:{title:"数据维护（DBM）"} },
    { name:"sys-ops-www", path:"/system/ops-www", component: ()=> import('@V/系统/更新前端.vue'), meta:{title:"更新前端资源"} },
    { name:"sys-dashboard", path:"/system/dashboard", component: ()=> import('@V/系统/状态监控/Index.vue'), meta:{title:"状态监控"} },
    { name:"sys-func", path:"/system/func", component: ()=> import('@V/系统/动态函数/Index.vue'), meta:{title:"动态函数"} },
    { name:"sys-log", path:"/system/log", component: ()=> import('@V/系统/操作日志.vue'), meta:{title:"操作日志"} },
    { name:"sys-constant", path:"/system/constant", component:()=> import('@V/维护/常量管理.vue'), meta:{title:"系统码表"}},
    { name:"sys-cache", path:"/system/cache", component:()=> import('@V/系统/缓存管理.vue'), meta:{title:"系统缓存"}},
    { name:"sys-page", path:"/system/page", component:()=> import('@V/系统/定制页面/Index.vue'), meta:{title:"页面"}},
    { name:"sys-page-edit", path:"/system/page-edit-:id", component:()=> import('@V/系统/定制页面/自定义/Editor.vue'), meta:{title:"定制页面", layout:"empty"}},

    // 默认跳转
    { path: DEFAULT, redirect:HOME }
]

export const router = createRouter({
    history: createWebHashHistory(DEFAULT),
    routes,
    scrollBehavior: () => ({ left: 0, top: 0 }),
})

router.beforeEach((to, from, next)=>{
    if ( !IGNORES.includes(to.name) && !window.TOKEN) {
        H.log.info(`检测到未登录，跳转到登录页...`)
        return next({ name: LOGIN, query:{form: to.fullPath} })
    }
    else{
        next()
    }
})

export async function setupRouter(app) {
    app.use(router)
}
