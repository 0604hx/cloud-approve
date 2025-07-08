import Mustache from 'mustache'

const fixToCsv = v=>{
    if(Array.isArray(v))
        return `"${v.join(RN).replace(/"/g, "`")}"`
    if(typeof(v)==='string')
        return `"${v.replace(/"/g, "`")}"`
    return v
}

/**
 * 保存内容到文件
 * @param {*} blob
 * @param {*} fileName
 */
function saveToFile(blob, fileName = "下载文件.txt") {
    if (!(!!blob && blob.toString() == '[object Blob]')) {
        blob = new Blob([blob])
    }
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)    // 创建下载的链接
    link.download = fileName                        // 下载后文件名
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()                                    // 点击下载
    window.URL.revokeObjectURL(link.href)           // 释放掉blob对象
    document.body.removeChild(link)                 // 下载完成移除元素
}

/**
 * 保存到 CSV 默认编码为 UTF-8
 * @param {*} obj
 * @param {*} fileName
 */
function saveToCSV(obj, fileName = "下载文件", newLine="\n") {
    let csvText = ""
    //参数为数组的情况
    if(Array.isArray(obj)){
        csvText = Array.isArray(obj[0])? obj.map(v=>v.map(fixToCsv).join(",")).join(newLine): obj.join(newLine)
    }
    else if(typeof(obj) === 'object'){
        let { headers, rows } = obj
        if(!headers && !Array.isArray(headers)) throw Error(`[CSV导出] Object 类型的参数必须传递 headers 属性`)
        //写入标题栏
        csvText += headers.map(h=> typeof(h)==='object'?h.text:h).join(",") + newLine

        let headerIds = headers.map(h=> typeof(h)==='object'? h.key:h)
        rows.forEach((row,rIndex)=>{
            csvText += headerIds.map(id=>fixToCsv(row[id])).join(",") + newLine
        })
    }
    else if(typeof(obj) === 'string')
        csvText = obj

    saveToFile(new Blob([csvText], { type: "application/csv;charset=utf-8" }), `${fileName}.csv`)
}

export { saveToFile, saveToCSV }

/**
 * 渲染模板，示例：{{ name }}打开门
 * @param {String} tpl
 * @param {Object} model
 * @returns {String}
 */
export const render = (tpl, model={})=> Mustache.render(tpl, model)
