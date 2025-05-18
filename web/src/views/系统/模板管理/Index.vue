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

        <n-modal v-model:show="editing" display-directive="show" :style="{width:'720px'}" preset="card" title="编辑模板" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="left" label-width="100">
                <n-alert type="info" :bordered="false" :show-icon="true">
                    模板必须关联企业，如未录入企业信息，请前往<Tag size="small">企业维护</Tag>处操作！
                </n-alert>

                <n-card title="基本信息" size="small" class="mt-2">
                    <n-space vertical>
                        <n-form-item label="模板名称" required> <n-input v-model:value="bean.name"/> </n-form-item>
                        <n-form-item label="所属企业" required>
                            <Selector url="/system/company-list" v-model:value="bean.cid" />
                        </n-form-item>
                        <n-form-item label="极简审批链">
                            <SelectorStaff v-model:value="bean.chains" multiple :cid="bean.cid" placeholder="设置后将无法选择步骤/人员" />
                        </n-form-item>
                        <n-form-item label="备注信息"> <n-input type="textarea" :rows="2" v-model:value="bean.summary"  placeholder="备注信息"/> </n-form-item>
                    </n-space>
                </n-card>
                <n-card title="额外参数配置" size="small" class="mt-2">
                    <n-space vertical>
                        <n-form-item label="内容宽度">
                            <n-input-number style="width: 200px;" v-model:value="bean.options.width" clearable place="默认为900（单位px）"/>
                            <span class="h ml-2">新建流程窗口的宽度</span>
                        </n-form-item>
                        <n-form-item label="标题渲染模板">
                            <n-input v-model:value="bean.options.titleTpl" placeholder="在发起流程前自定义标题，占位符 {{ 变量名 }}" />
                        </n-form-item>
                        <n-form-item label="确认按钮文字"> <n-input v-model:value="bean.options.btnText"/> </n-form-item>
                        <n-form-item label="步骤自动化">
                            <n-switch v-model:value="bean.options.auto"/>
                            <span class="h ml-2">勾选后，流程将自动计算步骤（无需人工参与）</span>
                        </n-form-item>
                        <n-form-item label="办理步骤">
                            <Actions ref="action" :cid="bean.cid" :text="bean.options.actions" />
                        </n-form-item>
                    </n-space>
                </n-card>

                <!-- <n-space vertical>
                    <n-alert type="info" :bordered="false" :show-icon="true">
                        模板必须关联企业，如未录入企业信息，请前往<Tag size="small">企业维护</Tag>处操作！
                    </n-alert>
                    <n-form-item label="模板名称" required> <n-input v-model:value="bean.name"/> </n-form-item>
                    <n-form-item label="所属企业" required>
                        <Selector url="/system/company-list" v-model:value="bean.cid" />
                    </n-form-item>
                    <n-form-item label="备注信息"> <n-input type="textarea" :rows="3" v-model:value="bean.summary"  placeholder="备注信息"/> </n-form-item>
                    <div class="h" style="text-align: center; padding: 6px;border-bottom: 1px dashed rgba(69,90,100,.4);">额外参数配置</div>
                    <n-form-item label="办理步骤">
                        <Actions ref="action" :cid="bean.cid" :text="bean.options.actions" />
                    </n-form-item>
                    <n-form-item label="步骤自动化">
                        <n-switch v-model:value="bean.options.auto"/>
                        <span class="h ml-2">勾选后，流程将自动计算步骤（无需人工参与）</span>
                    </n-form-item>
                    <n-form-item label="标题渲染模板">
                        <n-input v-model:value="bean.options.titleTpl" placeholder="在发起流程前自定义标题，占位符 {{ 变量名 }}" />
                    </n-form-item>
                </n-space> -->
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

    import P from "@Pagination"

    import SelectorStaff from "@CA/selector.staff.vue"
    import Actions from "./预设步骤.vue"

    const router = useRouter()

    let { beans , form, pagination, refresh } = P({url:`/system/flow-list`, form:{}})
    let editing = ref(false)
    let bean = ref({ options:{} })
    let action = ref()

    const columns = [
        { title:"#", width:60, render:(r,i)=> i+1 },
        { title:"名称", width:140, key:"name" },
        { title:"归属公司", width: 210, key:"cname" },
        { title:"描述", key:"summary", ellipsis:true },
        {
            title:"操作", width:300, align:"center",
            title:()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render: (r,i)=>h(NSpace, {size:"small"}, ()=>[
                h(NButton, {secondary:true, onClick:()=>toEdit(r)}, ()=>"修改"),
                h(NButton, {secondary:true, onClick:()=>toForm(r)}, ()=>"编辑表单"),
                h(NButton, {secondary:true, onClick:()=>toCopy(r), title:"拷贝一份副本"}, ()=>"副本"),
                h(NButton, {class:"error", secondary:true, onClick:()=>toDel(r,i)}, ()=>"删除")
            ])
        }
    ]

    const toForm = row=>{
        let r = router.resolve({name:`sys-flow-form`, params:{id:row.id}})
        H.openUrl(r.href, { center: true, title:`${row.name}-编辑表单`})
    }
    const toEdit = row=>{
        //兼容旧数据
        let b = row?? {id:undefined, name:"新建模板", cid:undefined, options:{}}
        if(Array.isArray(b.options))
            b.options = { actions: b.options, auto: false }

        bean.value = b
        editing.value = true
    }
    const editDo = ()=>{
        let { name, cid, options } = bean.value
        if(!(name && cid))   return M.warn(`名称、所属企业必须填写`)

        options.actions = action.value.getValue()
        RESULT("/system/flow-add", bean.value, d=>{
            M.notice.ok(`模板信息已保存`)
            editing.value = false
            refresh()
        })
    }
    const toDel = (row,i)=> M.confirm(`删除确认`, UI.html(`确认删除模板${UI.wrapHtml(row.name)}吗？`), ()=>{
        RESULT("/system/flow-del", {id:row.id}, ()=>{
            M.ok(`模板已删除`)
            beans.value.splice(i, 1)
        })
    })
    const toCopy = row=> M.confirm(`确认复制`, UI.html(`确认复制模板${UI.wrapHtml(row.name)}（名称将增加副本标识）吗？`), ()=>{
        RESULT("/system/flow-copy", {id:row.id}, ()=>{
            M.ok(`模板已复制`)
            refresh()
        })
    })
</script>
