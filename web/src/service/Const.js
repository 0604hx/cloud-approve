import { Smartphone, MessageCircle, Info, Bird } from 'lucide-vue-next'

const Status = [
    { value:0, label:"审批中" },
    { value:1, label:"已审批" },
    { value:2, label:"已取消" }
]

const Types = [
    { value:"phone", label:"手机", icon:Smartphone, type:"warning" },
    { value:"wechat", label:"微信", icon: MessageCircle, type:"success" },
    { value:"dingding", label:"钉钉", icon: Bird, type:"info" },
    { value:"other", label:"其他", icon: Info, type:"default" }
]

export { Status, Types }
export const StatusList = Status.map(s=>s.label)
