import UI from "./ui-tool"
import "./http"
import * as H from "./help"

window.UI   = UI
window.H    = H

/**
 * 将 Proxy 对象转换为普通 Object
 *
 * 方式一：return {...(ref.value||ref)}
 *      该方法无法处理嵌套对象，故选用 JSON 反序列化方式
 *
 * 方式二： 使用 vue3 自带的 toRaw(unref(bean)) 方式
 * @param {*} ref
 * @returns
 */
let _ = ref=> {
    // return toRaw(unref(ref))
    return JSON.parse(JSON.stringify(ref.value||ref))
}

window._    = _
window._raw = ref=> toRaw(unref(ref))
