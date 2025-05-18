<template>
    <div class="p-4 h-flex">
        <n-space>
            <n-input v-model:value="form.LIKE_title" placeholder="标题" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-select :options="Status" v-model:value="form.EQ_status" clearable placeholder="状态" style="width: 120px;"></n-select>
            <Selector url="/system/company-list" v-model:value="form.EQ_cid" />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table size="small" class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />
    </div>
</template>

<script setup>
    import { NButton, NPopconfirm } from 'naive-ui'
    import { Search, Plus, Trash } from 'lucide-vue-next'

    import { Status } from '@S/Const'

    import Selector from "@CA/selector.vue"
    import StatusPin from "@CA/status.vue"
    import Tag from "@C/common/tag.vue"
    import P from "@Pagination"

    let { beans , form, pagination, refresh } = P({url:`/system/process-list`, form:{SORT_id:1}})
    const columns= [
        { title:"序号", width:60, align:"center", render:(row,i)=> i+1 },
        { title:"标题", key:"title",ellipsis:true },
        { title:"企业", key:"cname", ellipsis:true, width:180 },
        { title:"状态", key:"status", width:80, render:r=>h(StatusPin, {code:r.status}) },
        { title:"模板", key:"fName", width:120, render:r=>h(Tag,()=>r.fName)},
        { title:"当前处理人", key:"curSName", width:100 },
        { title:"最后交办时间", key:"lastOn", width: 160, render: r=> r.lastOn?H.date.datetime(r.lastOn):"" },
        { title:"日期", key:"addOn", width: 160, render: row=> H.date.datetime(row.addOn) },
        {
            title:"操作", width:60,align:"center",
            render: (row,i)=>[
                // h(NButton, {size:"small", type:"error", secondary:true, onClick:()=>toDel(r,i)}, ()=>"删除")
                h(
                    NPopconfirm,
                    {
                        onPositiveClick:()=> toDel(row, i),
                        "positive-button-props": {type:"error"}
                    },
                    {
                        default: ()=>`确定删除流程⌈${row.title}⌋吗？`,
                        trigger: ()=>UI.iconBtn(Trash, null, {type:"error"})
                    }
                )
            ]
        }
    ]
    const toDel = (row, i)=>RESULT("/system/process-del", {id:row.id},d=> {
        M.ok(`流程${UI.wrap(row.title)}已删除`)
        beans.value.splice(i, 1)
    })
</script>
