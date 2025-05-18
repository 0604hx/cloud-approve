<template>
    <div class="p-4 h-full h-flex">
        <n-space>
            <n-input v-model:value="form.EQ_sid" style="width:120px" placeholder="用户ID" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-input v-model:value="form.EQ_mod" style="width:120px" placeholder="模块代码" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <Selector url="/system/company-list" style="width:240px" v-model:value="form.EQ_cid" />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />
    </div>
</template>

<script setup>
    import { Search, Plus } from 'lucide-vue-next'

    import P from "@Pagination"
    import Selector from "@CA/selector.vue"
    import Tag from "@C/common/tag.vue"

    let { beans , form, pagination, refresh } = P({url:`/system/log-list`, form:{SORT_id:1}})
    const mods = {
        process : "流程|process",
        flow    : "模板|flow",
        staff   : "员工|staff",
        company : "企业|company",
        file    : "附件|file",
        role    : "角色|role"
    }

    const columns= [
        { title:"ID", width:70, key:'id' },
        { title:"用户", key:'sname', width:160, render:r=>`${r.sname}/${r.sid}`},
        { title:"企业", key:'cname', width:220},
        { title:"模块", key:"mod", width:100, render:r=> r.mod?h(Tag, ()=>r.mod):null},
        { title:"描述", key:"summary", ellipsis:true},
        { title:"录入日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) }
    ]
</script>
