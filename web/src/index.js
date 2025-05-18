/*
 * @Author: 集成显卡
 * @Date: 2024-09-06 17:11:08
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2025-03-28 16:28:15
 */
import { createApp } from "vue"
import mitt from 'mitt'
import axios from "axios"

import { setupRouter } from "./router"
import { setupStore } from './store'

import "./util"
import "@S/Init"

import Tag from "@C/common/tag.vue"

import "@/theme/global.css"
import App from "./App.vue"

// 直接导入精简版的 tailwindcss，简单直接😎
import "@/theme/tailwind-simple.css"

window.VERSION  = _VERSION_;
window.AUTHOR   = _AUTHOR_;
window.DEBUG    = import.meta.env.DEV;
window.CHANNEL  = "browser"            //渠道信息

/**
 * 加载 token 并赋值到 axios 的默认表头
 * 如果 token 有值，window.TOKEN = true
 */
const loadToken = ()=> {
    const token = localStorage.getItem(import.meta.env.PUBLIC_HEADER_TOKEN)||""
    axios.defaults.headers.common['CUA'] = token
    window.TOKEN = !!token
}

/**
 * 注册全局事件组件
 * E.on("name", handler)    //注册监听器
 * E.emit("name", ...ps)    //触发监听器
 *
 * @param {String} name
 */
const setupEvent = (name="E")=>{
    window[name] = new mitt()

    window[name].on(`login.done`, ()=>{
        loadToken()
        setupUser()
    })
}

const setupUser = async ()=>{
    const { data } = await FETCH_JSON("/auth/whoami",{}, true).catch(e=>console.debug(e))
    //赋值到 User 对象
    if(data && data.id){
        let account = { ...data, isAdmin: Array.isArray(data.roles) && data.roles.includes("ADMIN") }
        //锁定用户对象，不支持修改
        Object.keys(account).forEach(k => {
            Object.defineProperty(account, k, { value: account[k], writable: false, enumerable: true, configurable: true })
        })
        window.User = account
        window.DEBUG && H.log.debug(`设置用户`, account)
    }
    else{
        //清除 TOKEN
        localStorage.removeItem(import.meta.env.PUBLIC_HEADER_TOKEN)
        axios.defaults.headers.common['CUA'] = undefined
        delete window.TOKEN
    }
}

//FETCH_JSON("/auth/whoami",{}, true)
/**
 * 加载过程：
 *  1. 访问 /auth/whoami 尝试得到用户信息
 *  2. 如有，则赋值到 User 对象
 *  3. 进行路由跳转时，判断 User 对象，如无则转到登陆页面
 */
(async ()=>{
    loadToken()

    const app = createApp(App)

    setupStore(app)
    setupEvent()

    await setupUser()
    await setupRouter(app)

    app.config.globalProperties.filesize = v=> H.filesize(v)
    app.config.globalProperties.datetime = v=> H.date.datetime(v)

    app.mount("#root")
    app.component("Tag", Tag)

    console.debug(
        `%c欢迎使用 · ${APP_TITLE}(UI) · 版本=${_VERSION_}`,
        "background:#722ED1;color:white;padding:2px 6px; font-size:14px;font-family:微软雅黑"
    )
})()
