import { formValueProvider } from "@grid-form/common"

/*
扩展默认的表单默认值计算器
支持 Promise （未作异常捕获，慎用）
*/
formValueProvider["${date}"]            = ()=> H.date.date()
formValueProvider["${yesterday}"]       = ()=> H.date.addDay(-1)
formValueProvider["${month}"]           = ()=> H.date.date(Date(), "YYYY-MM")
formValueProvider["${monthBegin}"]      = ()=> H.date.beginOf()
formValueProvider["${monthEnd}"]        = ()=> H.date.endOf()
formValueProvider["${lastMonthBegin}"]  = ()=> H.date.addDay(-1, H.date.beginOf(), 'month')
formValueProvider["${lastMonthEnd}"]    = ()=> H.date.addDay(-1, H.date.endOf(), 'month')
formValueProvider["${yearBegin}"]       = ()=> H.date.beginOf('year')
formValueProvider["${yearEnd}"]         = ()=> H.date.endOf('year')

formValueProvider["${User.id}"]         = ()=> window.User.id
formValueProvider["${User.name}"]       = ()=> window.User.name

/**
 * 去除谷歌的touch事件警告
 *
 * 代码来源如下
 * https://stackoverflow.com/questions/46094912/added-non-passive-event-listener-to-a-scroll-blocking-touchstart-event
 */
function nonPassiveEvent(){
    if (typeof EventTarget !== "undefined") {
        let func = EventTarget.prototype.addEventListener
        EventTarget.prototype.addEventListener = function (type, fn, capture) {
            this.func = func
            if (typeof capture !== "boolean") {
                capture = capture || {}
                capture.passive = false
            }
            this.func(type, fn, capture);
        }
    }
}
nonPassiveEvent()
