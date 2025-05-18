import { NButton, NSwitch, NTag, NInput, NSpace } from 'naive-ui'
import { Plus } from 'lucide-vue-next'

import StaffSelector from "@CA/selector.staff.vue"
import { checkPwd } from '@S/Auth'
import { Types } from '@S/Const'
import Tag from "@C/common/tag.vue"

/**
 * @param {Boolean} isCompany - 是否为企业管理
 */
export default (isCompany=true, { toEdit, toDel })=>{
    const prefix = isCompany?"company":"system"

    const columns = [
        { title:"ID", width:60, key:'id' },
        { title:"账户名", key:'name'},
        ...isCompany?[]:[{ title:"所属企业", key:"cid", width:100 }],
        {
            title:"来源类型", key:"type", width:120,
            render:r=>{
                let type = Types.find(t=>t.value==r.type)
                return !type?r.type: h(NTag,{type:type.type, bordered:false},{
                    default: ()=>type.label,
                    icon: ()=>  h(type.icon, {size:18})
                })
            }
        },
        {
            title:"是否生效", key:"active", width:100,
            render:row=>h(
                NSwitch,
                {
                    defaultValue: row.active==1,
                    "on-update:value": v=>modify(row, 'active', v, `账户设置为⌈${v?"生效":"不生效"}⌋`),
                }
            )
        },
        { title:"关联员工", key:'sid', width:160, render:r=> h(Tag, { type:r.sid?"primary":"default" },()=>r.sid?`${r.sname} (ID=${r.sid})`:"暂无") },
        { title:"录入日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) },
        {
            width: isCompany?200:270,align:"center",
            title: isCompany?"操作":()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render: (r,i)=>h(NSpace, {size:"small"}, ()=>{
                let acts = [
                    h(NButton, {secondary:true, onClick:()=>changePwd(r)}, ()=>"修改密码"),
                    h(NButton, {secondary:true, onClick:()=>toSelectStaff(r)}, ()=>"关联员工"),
                ]
                if(!isCompany){
                    acts.push( h(NButton, {class:"error", secondary:true, onClick:()=>toDel(r,i)}, ()=>"删除") )
                }
                return acts
            })
        }
    ]

    const changePwd = row=>{
        let pwd = ""
        M.dialog({
            maskClosable: false, showIcon: false, style:{width:'480px'},
            title: `修改 ⌈${row.name}⌋ 的登录密码`,
            content: ()=>h(NInput, {
                type:"password",
                placeholder:"请输入强密码",
                "on-update:value": v=> pwd = v
            }),
            positiveText:"确定修改",
            onPositiveClick: ()=>checkPwd(pwd).then(v=> modify(row, "pwd", v, `密码已更新`))
        })
    }

    const toSelectStaff = row=>{
        let sid = undefined
        M.dialog({
            maskClosable: false, showIcon: false, style:{width:'520px'},
            title: `修改 ⌈${row.name}⌋ 的关联员工`,
            content: ()=> h(
                StaffSelector,
                {
                    company: !isCompany,
                    onUpdateValue: (v, opt)=> {
                        sid = v
                        row.sname = opt.label
                    }
                }
            ),
            positiveText:"确定关联",
            onPositiveClick: ()=>{
                if(sid == row.sid)  return M.warn(`当前已关联⌈${row.sname}⌋`)
                if(!sid && !!row.sid){
                    M.confirm(`未选择关联的员工`, `本次操作后将清空该账户的关联，确定吗？`, ()=> modify(row, "sid", null, `关联员工已清空`))
                }
                else
                    modify(row, "sid", sid, `关联员工已变更`)
            }
        })
    }

    const modify = (row, key, value, tip="操作成功")=> RESULT(`/${prefix}/account-update`, {id: row.id, key, value}, d=> {
        M.ok(tip)
        if(key != 'pwd')
            row[key] = value
    })

    return { changePwd, toSelectStaff, columns }
}
