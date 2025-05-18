/*
 * @Author: 集成显卡
 * @Date: 2024-09-12 18:13:31
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2025-01-19 12:04:51
 *
 * UI 相关配置
 */
import { defineStore } from 'pinia'
import { generate, getRgbStr, getPresetColors } from '@arco-design/color'

/**
 * 判断是否为深色
 * @param {String} theme
 * @returns
 */
export const detectDark = (theme='auto')=>{
    if(theme == 'dark')     return true
    if(theme == 'light')    return false

    let hour = new Date().getHours()
    return hour >= 18 || hour<=8
}

export const defaultPrimaryColor = '#18a058'

export const naiveThemeOverrides = { common: {} }

export const presetColors = ()=>[defaultPrimaryColor, ...Object.entries(getPresetColors()).map(([, value]) => value.primary)]

export const uiStore = defineStore('ca.ui', {
    state: () => ({
        theme: 'auto',                          // light，dark，auto（自动）
        darkNav: true,                          // 暗色导航
        // isDark: detectDark(),
        primaryColor: defaultPrimaryColor,      // 默认颜色
        naiveThemeOverrides
    }),
    getters: {
        isDark: (state)=>{
            let dark = detectDark(state.theme)
            window.DARK = dark
            return dark
        }
    },
    actions: {
        setTheme(theme) {
            if(this.theme == theme) return

            this.theme = theme
            window.DARK = detectDark(theme)

            this.setPrimaryColor()
        },
        setPrimaryColor(color=this.primaryColor) {
            if(this.primaryColor == color)  return

            this.primaryColor = color

            const colors = generate(color, { list: true, dark: this.isDark })

            // // 代码参考 https://github.com/zclzone/vue-naive-admin/blob/2.x/src/store/modules/app.js
            document.body.style.setProperty('--primary-color', getRgbStr(colors[5]))
            this.naiveThemeOverrides.common = Object.assign(this.naiveThemeOverrides.common || {}, {
                primaryColor: colors[5],
                primaryColorHover: colors[4],
                primaryColorSuppl: colors[4],
                primaryColorPressed: colors[6]
            })
        },
        setDarkNav (value){
            this.darkNav = value
        }
    },
    persist: true
})
