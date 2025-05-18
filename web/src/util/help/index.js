import * as date from './date'
import * as io from './io'
import * as store from './store'

export {
    date, io, store
}

/**
 * 检测对象指定的属性是否符合条件
 * 当发现异常，直接返回
 * @param {Object} obj
 * @param {Map<String, String|Object>} rules
 * @returns
 */
export const checkValue = (obj, rules={})=> new Promise((ok, fail)=>{
    let keys = Object.keys(rules)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const isStr = typeof(obj[key]) == 'string'
        if(!(key in obj) || obj[key] == null || (isStr && obj[key].trim()=="")){
            M.warn(`${rules[key]}不能为空`)
            return
        }
    }
    ok()
})

/**
 * 打开新页面（同源）
 * @param {*} target
 */
export const openUrl = (target, ps={})=>{
    ps = Object.assign(
        {
            title:"",
            width:1320,
            height:720,
            type:"_blank",
            x: 0,
            y: 0,
            center: false         //是否居中
        },
        ps
    )
    let options = undefined
    if(ps.type == '_blank'){
        // 一旦设置了宽度，则打开新窗口
        options = `width=${ps.width},height=${ps.height}`
        if(ps.center) {
            let top = (window.screen.availHeight - ps.height)/2
            let left = (window.screen.availWidth - ps.width)/2
            options+=`,top=${top},left=${left}`
        }
        else if(ps.x>0 || ps.y>0){
            options+=`,top${ps.y},left=${ps.x}`
        }
    }

    let newWin = window.open(target, ps.type, options)
    if(!!ps.title && !!newWin){
        newWin.onload = function(){
            newWin.document.title = ps.title
        }
    }
    return newWin
}

const COLORS = {"INFO":"#2080f0", "DEBUG":"#8c0776", "ERROR":"#d03050"}
/**
 *
 * @param {String} level
 * @param  {...any} ps
 * @returns
 */
const _log = (level, group, color, ...ps)=> console.debug(
    `%c${date.time()} ${level}${group?` %c${group}`:"%c"}`,
    `color:${COLORS[level]};font-weight:500;`,
    `background:${color};padding:0 2px 0px 2px;color:white`,
    ...ps
)

export class LogFactory {
    /**@type {String} */
    prefix
    /**@type {String} */
    color

    constructor(groupName, color){
        this.prefix = groupName
        this.color = color || "#8c0776"
    }

    info (...ps){
        _log("INFO", this.prefix, this.color, ...ps)
    }
    debug (...ps){
        _log("DEBUG", this.prefix, this.color, ...ps)
    }
    error (...ps){
        _log("ERROR", this.prefix, this.color, ...ps)
    }
}

const defaultLogger = new LogFactory()

export const log = {
    new     : (group, color)=> {
        if(!group)  throw `Log 分组名称不能为空`
        return new LogFactory(group, color)
    },
    info    : defaultLogger.info,
    debug   : defaultLogger.debug,
    error   : defaultLogger.error
}

export const setTitle = title=> window.document.title = title

/**
* 格式化文件大小
* @param {*} mem
*/
export const filesize = (mem, fixed=1, split=" ")=>{
    var G = 0
    var M = 0
    var KB = 0
    mem >= (1 << 30) && (G = (mem / (1 << 30)).toFixed(fixed))
    mem >= (1 << 20) && (mem < (1 << 30)) && (M = (mem / (1 << 20)).toFixed(fixed))
    mem >= (1 << 10) && (mem < (1 << 20)) && (KB = (mem / (1 << 10)).toFixed(fixed))
    return G > 0
        ? G + split + 'GB'
        : M > 0
            ? M + split + 'MB'
            : KB > 0
                ? KB + split + 'KB'
                : mem + split + 'B'
}

/**
 * 判断参数是否为一个有内容的字符串
 * @param {*} v
 * @returns
 */
export const hasText = v=>{
    if(v == null)   return false
    if(typeof(v)==='string') return /[^\s]/.test(v)
    return false
}

/**
 * 将指定数据写入到系统粘贴板
 * @param {*} obj   如果为非字符串，事先进行 JSON 转换
 * @returns
 */
export const copyTo = (obj, pretty=false)=> {
    let text = typeof(obj)=='string'? obj: JSON.stringify(obj, null, pretty?4:0)
    // 仅在 localhost 或者 https 环境下才能使用该 API
    if(navigator.clipboard)
        navigator.clipboard.writeText(text)
    else {
        const textarea = document.createElement('textarea')
        textarea.addEventListener('focusin', (event) => event.stopPropagation())
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.cssText =  'position:fixed; pointer-events:none; z-index:-9999; opacity:0;'

        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }
}

/**
 * 尝试将文本/对象转换为对象
 * @param {String|Object} text
 * @param {Object} defaultVal
 */
export const toObj = (text, defaultVal={})=>{
    if(!text)   return defaultVal
    return typeof(text) == 'string' ? JSON.parse(text):text
}
