<template>
    <div class="p-4 h-flex">
        <n-alert type="warning" :bordered="false" :show-icon="true">
            注意：动态函数执行有一定的<Tag size="small" type="error">风险</Tag>，请慎重！该功能的运行需要服务端开启相应的开关项🤝
        </n-alert>
        <n-space class="mt-4">
            <n-input v-model:value="form.LIKE_name" placeholder="函数名称" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />

        <n-modal v-model:show="editing" display-directive="show" :style="{width:'85%'}" preset="card" title="编辑函数" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="left" label-width="90">
                <n-space vertical>
                    <n-form-item label="函数名称" required> <n-input v-model:value="bean.name"/> </n-form-item>
                    <n-form-item label="脚本代码" required>
                        <n-space vertical class="w-full">
                            <n-alert type="info" :bordered="false" :show-icon="true">
                                <div>1、脚本代码在后端会组合成<Tag size="small">异步函数</Tag>的形式被执行，支持<Tag size="small">await</Tag>关键词</div>
                                <div>2、函数内可以通过<Tag size="small">staff</Tag>获取登录用户信息，通过<Tag size="small">params</Tag>获取参数</div>
                                <div>3、脚本代码必须有一个显式的<Tag size="small">return</Tag>作为返回语句</div>
                            </n-alert>
                            <CodeEditor height="360px" placeholder="请输入JavaScript代码，示例 return Date.now()" v-model:value="bean.code" />
                        </n-space>
                    </n-form-item>
                    <n-form-item label="备注信息"> <n-input type="textarea" :rows="3" v-model:value="bean.summary"  placeholder="备注信息"/> </n-form-item>
                </n-space>
            </n-form>

            <div class="text-right mt-3">
                <n-button type="primary" @click="editDo">确定并保存</n-button>
            </div>
        </n-modal>
    </div>
</template>

<script setup>
    import { NButton, NSpace } from 'naive-ui'
    import { Search, Plus } from 'lucide-vue-next'

    import CodeEditor from "@CODE"
    import P from "@Pagination"

    let { beans , form, pagination, refresh } = P({url:`/system/func-list`, form:{}})
    let editing = ref(false)
    let bean = ref({})
    let action = ref()

    const columns = [
        { title:"#", width:60, render:(r,i)=> i+1 },
        { title:"名称", width:140, key:"name" },
        { title:"创建者", width: 180, key:"sname" },
        { title:"执行次数", width:90, key:"launch" },
        { title:"描述", key:"summary", ellipsis:true },
        {
            title:"操作", width:150, align:"center",
            title:()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render: (r,i)=>h(NSpace, {size:"small"}, ()=>[
                h(NButton, {secondary:true, onClick:()=>toEdit(r)}, ()=>"修改"),
                h(NButton, {class:"error", secondary:true, onClick:()=>toDel(r,i)}, ()=>"删除")
            ])
        }
    ]

    const toEdit = row=>{
        bean.value = row?? {id:undefined, name:"新建动态函数", cid:undefined}
        editing.value = true
    }
    const editDo = ()=>{
        let { name, code } = bean.value
        if(!(name && code))   return M.warn(`函数的名称、代码必须填写`)

        RESULT("/system/func-add", bean.value, d=>{
            M.notice.ok(`动态函数已保存`)
            editing.value = false
            refresh()
        })
    }
    const toDel = (row,i)=> M.confirm(`删除确认`, UI.html(`确认删除动态函数${UI.wrapHtml(row.name)}吗？`), ()=>{
        RESULT("/system/flow-del", {id:row.id}, ()=>{
            M.ok(`模板已删除`)
            beans.value.splice(i, 1)
        })
    })
</script>
