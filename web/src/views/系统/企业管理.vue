<template>
    <div class="p-4 h-full h-flex">
        <n-space>
            <n-input v-model:value="form.LIKE_name" placeholder="名称" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />

        <n-modal v-model:show="editing" :style="{width:'520px'}" preset="card" title="编辑企业" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="left" label-width="80">
                <n-space vertical>
                    <n-form-item label="企业名称" required> <n-input v-model:value="bean.name"/> </n-form-item>
                    <n-form-item label="授权期限"> <n-date-picker v-model:value="bean.expire" class="w-full" /> </n-form-item>
                    <n-form-item label="描述信息"> <n-input type="textarea" :rows="3" v-model:value="bean.summary"  placeholder="备注信息"/> </n-form-item>
                </n-space>
            </n-form>

            <div class="text-right mt-3">
                <n-button type="primary" @click="editDo">确定并保存</n-button>
            </div>
        </n-modal>

        <n-modal v-model:show="configing" :style="{width:'600px'}" preset="card" title="企业配置信息" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="top" label-width="80">
                <n-card title="钉钉自动登录" size="small">
                    <n-space vertical>
                        <n-form-item label="企业ID"> <n-input v-model:value="config.ddCorpId" placeholder="可以留空"/> </n-form-item>
                        <n-form-item label="应用AppKey"> <n-input v-model:value="config.ddAppKey" placeholder="在钉钉开发者后台获取"/> </n-form-item>
                        <n-form-item label="应用AppSecret"> <n-input v-model:value="config.ddAppSecret" placeholder="在钉钉开发者后台获取"/> </n-form-item>
                        <n-form-item label="自动创建员工信息">
                            <n-switch v-model:value="config.ddAutoCreate" />
                            <span class="h ml-2">勾选后，当新用户从钉钉登录系统自动创建并关联同名员工信息</span>
                        </n-form-item>
                    </n-space>
                </n-card>
            </n-form>

            <div class="text-right mt-3">
                <n-button type="primary" @click="configDo">保存配置信息</n-button>
            </div>
        </n-modal>
    </div>
</template>

<script setup>
    import { NButton, NSpace } from 'naive-ui'
    import { Search, Plus } from 'lucide-vue-next'

    import P from "@Pagination"

    let { beans , form, pagination, refresh } = P({url:`/system/company-list`, form:{}, pageSize:200})
    let loading = ref(false)
    let editing = ref(false)
    let bean = ref({})

    let configing = ref(false)
    let config = ref({})
    let cid = 0

    const columns= [
        { title:"ID", width:60, key:'id' },
        { title:"企业名称", width:240, key:'name'},
        { title:"授权期限", width:120, key:"expire", render:r=> r.expire==0?'无限期':H.date.date(r.expire) },
        { title:"描述信息", key:"summary", ellipsis:true },
        { title:"录入日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) },
        {
            width:210,align:"center",
            title:()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render: (r,i)=>h(NSpace, {size:"small"}, ()=>[
                h(NButton, {secondary:true, onClick:()=>toEdit(r)}, ()=>"修改"),
                h(NButton, {secondary:true, onClick:()=>toConfig(r)}, ()=>"配置"),
                h(NButton, {class:"error", secondary:true, onClick:()=>toDel(r,i)}, ()=>"删除")
            ])
        }
    ]

    const toEdit = row=>{
        bean.value = row?? {id:undefined}
        editing.value = true
    }
    const editDo = ()=>{
        let { name } = bean.value
        if(!name)   return M.warn(`企业名称必须填写`)

        RESULT("/system/company-add", bean.value, d=>{
            M.notice.ok(`企业信息已保存`)
            editing.value = false
            refresh()
        })
    }

    const toConfig = row=>{
        cid = row.id
        RESULT("/system/company-config", { cid }, d=>{
            config.value = d.data??{ ddAutoCreate: true }
            configing.value = true
        })
    }
    const configDo = ()=>{
        let value = JSON.stringify(config.value)
        RESULT(
            "/system/company-config",
            { cid, value },
            ()=>{
                M.ok(`配置信息已保存`)
                configing.value = false
            },
            { loading }
        )
    }

    const toDel = (row,i)=> M.confirm(`删除确认`, UI.html(`确认删除企业${UI.wrapHtml(row.name)}吗？`), ()=>{
        RESULT("/system/company-del", {id:row.id}, ()=>{
            M.ok(`企业已删除`)
            beans.value.splice(i, 1)
        })
    })
</script>
