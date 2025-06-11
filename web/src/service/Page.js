import { h } from 'vue'
import { NSpace, NButton, NTag } from 'naive-ui'
import { Search, Plus } from 'lucide-vue-next'

import { openProcess } from '@CF'
import { Trash, UserCircle, Home, List, Chrome, Earth, Pencil, BadgeJapaneseYen, NotepadText, Star, ThumbsUp, Bell, Settings, QrCode } from 'lucide-vue-next'

const resizable     = true
const ellipsis      = { tooltip: true }
const CENTER        = "center"

export const C_GLOBAL      = "global"
export const C_ROW         = "row"

/**
 * @typedef {Object} FormBean
 * @property {String} id - 绑定的model
 * @property {String} label - 标签
 * @property {String} type - 表单类型
 * @property {String} width - 宽度
 * @property {String} content - 内容
 *
 * @typedef {Object} ColumnBean
 * @property {String} key
 * @property {String} label
 * @property {Boolean} center
 * @property {Number} width
 * @property {String} render
 *
 * @typedef {Object} ButtonBean
 * @property {String} label
 * @property {String} category - 分类，通常是 global（全局）、row（数据行）
 * @property {String} icon - 图标，仅支持 fa 样式
 * @property {String} type - 类型，info、primary、warning、error、success
 * @property {String} handler - 处理函数
 *
 * @typedef {Object} PageContent
 * @property {String} size - 表格、按钮的尺寸（默认小）
 * @property {Boolean} border - 表格外边框
 * @property {Boolean} borderCell - 单元格边框
 * @property {String} btnStyle - 按钮样式
 * @property {String} showOpenBtn - 是否在数据行显示”查看流程“按钮
 * @property {Boolean} autoLoad - 是否初始化完成后自动加载数据
 * @property {Array<FormBean>} forms - 检索表单
 * @property {Array<ColumnBean>} columns - 表格列
 * @property {Array<ButtonBean>} buttons - 按钮
 * @property {String} funcs - 额外函数
 */

function buildFuncBody(body, usePromise=true){
    return usePromise?
        `return new Promise((resolve, reject)=>{
            ${body}
        })`
        :
        body
}

function _triggerWithoutPromise(body, paramsNames, params){
    try{
        if(typeof(body) === 'function')
            return body(...params)
        return new Function(...paramsNames, buildFuncBody(body, false))(...params)
    }
    catch(e){
        console.error(e)
        M.showError(`执行函数回调出错：${UI.wrapHtml(e.message)}`)
    }
}

const api = {
    /**
     * 更新流程数据
     * @param {Number} id
     * @param {Object} value
     * @param {Object} ps
     * @param {String} ps.message
     */
    update: (id, value, { message })=>{
        RESULT("/flow/page-data-update", {id, value}, d=>{
            M.ok(message || `数据更新成功`)
        })
    }
}

/**
 *
 * @param {ButtonBean} btn
 * @param {Object} row
 * @param {Number} rowIndex
 */
const onBtnClick = (btn, row, rowIndex)=>{
    _triggerWithoutPromise(btn.handler, ['row', 'rowIndex', 'api'], [row, rowIndex, api])
}

const toBtn = (style, other)=>{
    other[style] = true
    return other
}

/**
 * 页面渲染模式
 */
export const formatTypes = { normal: "普通", sfc:"SFC单页面" }

export const formItemTypes = { text: "文本", number:"数值", bool:"布尔", date:"日期", constant:"码表", hide:"隐藏" }

/**
 * 常用的图标
 */
export const icons = {
    Search: Search,
    Plus: Plus,
    Trash: Trash,
    User: UserCircle,
    Home: Home,
    List: List,
    Chrome: Chrome,
    Earth: Earth,
    Pencil: Pencil,
    Yuan : BadgeJapaneseYen,
    Text : NotepadText,
    Star: Star,
    ThumbsUp: ThumbsUp,
    Bell: Bell,
    Setting: Settings,
    QrCode: QrCode
}


/**
 * @param {PageContent} p
 */
export const buildColumns = p=>{
    let cs = []
    if(!p.columns || !Array.isArray(p.columns))  return cs

    p.columns.forEach(c=>{
        let col = { title: c.label, key: c.key, resizable, ellipsis }
        if(c.width >= 0)        col.width = c.width
        if(c.center == true)    col.align = CENTER

        if(c.key == "#date#"){
            col.width ??= 180
            col.render = r=> H.date.datetime(r.addOn)
        }
        else if(c.key == '#index#'){
            col.width ??= 60
            col.render = (r,i)=> `${i+1}`
        }
        else if(c.key == '#status#'){
            col.width ??= 100
            col.render = r=> {
                let done = r.status == 1
                return h(NTag, { type:done?'success':'warning', bordered:false }, ()=>done?"已审批":"未审批")
            }
        }
        else{
            col.render = !!c.render ? r=> new Function('row', 'h', 'return '+c.render)(r.value, h) : r=> r.value[c.key]
        }
        cs.push(col)
    })

    let ctrlCol = { title:"操作", resizable }
    let ctrlWidth = p.buttons.reduce((c,v)=>c+v.label.length*30+(v.icon?40:0), 80)
    ctrlCol.render = (row, rowIndex)=>{
        // 默认的按钮
        let btns = []
        if(p.showOpenBtn)
            btns.push(h(NButton, toBtn(p.btnStyle, {size: p.size, onClick:()=>openProcess(row.pid)}), ()=>"查看流程"))

        if(Array.isArray(p.buttons)){
            //增加额外的按钮
            btns.push(...p.buttons.map(btn=>{
                let slots = { default: ()=> btn.label }
                if(btn.icon)
                    slots['icon'] = ()=>h(icons[btn.icon])
                return h(NButton, toBtn(p.btnStyle, { type: btn.type||"default", size: p.size, onClick: ()=>onBtnClick(btn, row, rowIndex) }), slots)
            }))
        }
        return h(NSpace, {size:"small", justify: CENTER }, ()=>btns)
    }
    ctrlCol.align = CENTER
    ctrlCol.width = ctrlWidth

    cs.push(ctrlCol)
    return cs
}
