/*
 * 钉钉登录入口
 * @Author: 集成显卡
 * @Date: 2025-04-29 22:51:27
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2025-05-08 17:16:49
 */

import { createApp, h, render } from "vue"
import { setupStore } from '@/store'

import "@/util"
import "@/theme/global.css"
// 直接导入精简版的 tailwindcss，简单直接😎
import "@/theme/tailwind-simple.css"

import App from './App.vue'
import { NMessageProvider } from "naive-ui"

const appWrapper = {
    render(){
        return h(NMessageProvider, { duration: 6000 }, ()=> h(App))
    }
}

const app = createApp(appWrapper)

setupStore(app)

app.mount("#root")

console.debug(
    `%c欢迎使用 · ${APP_TITLE}(钉钉登录入口) · 版本=${_VERSION_}`,
    "background:#722ED1;color:white;padding:2px 6px; font-size:14px;font-family:微软雅黑"
)
