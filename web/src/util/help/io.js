import Mustache from 'mustache'

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

export { saveToFile }

/**
 * 渲染模板，示例：{{ name }}打开门
 * @param {String} tpl
 * @param {Object} model
 * @returns {String}
 */
export const render = (tpl, model={})=> Mustache.render(tpl, model)
