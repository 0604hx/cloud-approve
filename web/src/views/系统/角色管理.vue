<template>
    <div class="p-4 h-flex">
        <n-space>
            <n-input v-model:value="form.LIKE_id" placeholder="编号" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-input v-model:value="form.LIKE_name" placeholder="名称" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />

        <n-modal v-model:show="editing" :style="{width:'520px'}" preset="card" title="编辑角色" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="left" label-width="90">
                <n-space vertical>
                    <n-form-item label="角色编号" required> <n-input v-model:value="bean.id"/> </n-form-item>
                    <n-form-item label="角色名称" required> <n-input v-model:value="bean.name"/> </n-form-item>
                    <n-form-item label="所属企业">
                        <Selector url="/system/company-list" v-model:value="bean.cid" />
                    </n-form-item>
                    <n-form-item label="描述信息"> <n-input type="textarea" :rows="3" v-model:value="bean.summary"  placeholder="备注信息"/> </n-form-item>
                </n-space>
            </n-form>

            <div class="text-right mt-3">
                <n-button type="primary" @click="editDo">确定并保存</n-button>
            </div>
        </n-modal>
    </div>
</template>
<script setup>
    import { NPopconfirm, NButton, NButtonGroup } from "naive-ui"
    import { Search, Plus, Trash, Edit } from 'lucide-vue-next'

    import Selector from "@CA/selector.vue"
    import P from "@Pagination"

    let { beans , form, pagination, refresh } = P({url:`/system/role-list`, form:{}})
    let bean = ref({})
    let editing = ref(false)

    const columns= [
        { title:"角色编号", width:180, key:'id' },
        { title:"角色名", key:'name'},
        { title:"归属企业", key:"cname", width:200 },
        { title:"描述信息", key:"summary", ellipsis:true },
        { title:"录入日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) },
        {
            width:80,align:"center",
            title:()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render: (row,i)=>h(NButtonGroup, {size:"small"}, ()=>[
                UI.iconBtn(Edit, ()=>toEdit(r), {secondary:true}),
                h(
                    NPopconfirm,
                    {
                        onPositiveClick:()=> toDel(row, i),
                        "positive-button-props": {type:"error"}
                    },
                    {
                        default: ()=>`确定删除角色⌈${row.name}⌋吗？`,
                        trigger: ()=>UI.iconBtn(Trash, null, {class:"error", secondary:true})
                    }
                )
            ])
        }
    ]

    const toEdit = row=>{
        bean.value = row?? {id:undefined}
        editing.value = true
    }
    const editDo = ()=>{
        let { id, name } = bean.value
        if(!name || !id)   return M.warn(`编号、名称必须填写`)

        RESULT("/system/role-add", bean.value, d=>{
            M.notice.ok(`角色信息已保存`)
            editing.value = false
            refresh()
        })
    }
    const toDel = (row, i)=>RESULT("/system/role-del", {id:row.id},d=> {
        M.ok(`角色${UI.wrap(row.name)}已删除`)
        beans.value.splice(i, 1)
    })
</script>
