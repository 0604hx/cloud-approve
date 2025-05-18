<template>
    <div class="p-4 h-full h-flex">
        <n-space>
            <n-input v-model:value="form.LIKE_name" placeholder="名称" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-input v-model:value="form.LIKE_phone" placeholder="联系电话" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />

        <n-modal v-model:show="editing" :style="{width:'640px'}" preset="card" title="编辑用户" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="left" label-width="120">
                <n-space vertical>
                    <n-form-item label="员工姓名" required> <n-input v-model:value="bean.name"/> </n-form-item>
                    <n-form-item label="联系电话"> <n-input v-model:value="bean.phone"/> </n-form-item>
                    <n-form-item label="所属企业" v-if="!isCompany" required>
                        <Selector url="/system/company-list" v-model:value="bean.cid" />
                    </n-form-item>
                    <n-form-item label="备注"> <n-input type="textarea" :rows="3" v-model:value="bean.summary"  placeholder="备注信息"/> </n-form-item>
                </n-space>
            </n-form>

            <div class="text-right mt-3">
                <n-button type="primary" @click="editDo">确定并保存</n-button>
            </div>
        </n-modal>
    </div>
</template>

<script setup>
    import { NButton, NButtonGroup, NSpace } from 'naive-ui'
    import { Search, Plus } from 'lucide-vue-next'

    import Tag from "@C/common/tag.vue"
    import P from "@Pagination"
    import Selector from "@CA/selector.vue"
    import RolePane from "@V/widget/分配角色.vue"

    const route = useRoute()
    const isCompany = route.name.startsWith("company-")
    const prefix = isCompany?'company':'system'

    let { beans , form, pagination, refresh } = P({url:`/${prefix}/staff-list`, form:{}})
    let loading = ref(false)
    let editing = ref(false)
    let bean = ref({})

    const columns= (()=>{
        let cs = [
            { title:"ID", width:60, key:'id' },
            { title:"名称", width:120, key:'name'},
        ]
        if(!isCompany)
            cs.push({ title:"所属企业", key:"cname", width:220})
        return [
            ...cs,
            { title:"联系电话", width:160, key:"phone" },
            { title:"描述", key:"summary" },
            { title:"录入日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) },
            {
                width: isCompany? 150: 240,align:"center",
                title:()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
                render: (r,i)=>h(NSpace, {size:"small"}, ()=>{
                    let actions = [h(NButton, {secondary:true, onClick:()=>toEdit(r)}, ()=>"修改")]
                    if(!isCompany)   actions.push(h(NButton, {secondary:true, onClick:()=>toRole(r)}, ()=>"分配角色"))
                    actions.push(h(NButton, {class:"error", secondary:true, onClick:()=>toDel(r,i)}, ()=>"删除"))
                    return actions
                })
            }
        ]
    })()

    const toEdit = row=>{
        bean.value = row?? {id:undefined}
        editing.value = true
    }
    const editDo = ()=>{
        let { name, cid } = bean.value
        if(!name)               return M.warn(`名称不能为空`)
        if(!isCompany && !cid)  return M.warn(`所属企业不能为空`)

        RESULT(`/${prefix}/staff-add`, bean.value, d=>{
            M.notice.ok(`员工信息已保存`)
            editing.value = false
            refresh()
        })
    }
    const toDel = (row,i)=> M.confirm(`删除确认`, UI.html(`确认删除员工${UI.wrapHtml(row.name)}吗？`), ()=>{
        RESULT(`/${prefix}/staff-del`, {id:row.id}, ()=>{
            M.ok(`员工已删除`)
            beans.value.splice(i, 1)
        })
    })
    const toRole = row=>{
        const dialog = M.dialog({
            title: `分配「${row.name}」的角色`,
            showIcon:false,
            maskClosable:false,
            style:{ width:"640px"},
            content:()=> h(RolePane, { sid:row.id, onClose:()=> dialog.destroy() })
        })
    }
</script>
