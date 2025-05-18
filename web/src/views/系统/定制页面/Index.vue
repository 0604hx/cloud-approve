<template>
    <div class="p-4 h-flex">
        <n-space>
            <n-input v-model:value="form.LIKE_name" placeholder="标题" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <Selector v-model:value="form.EQ_fid" :items="flows" placeholder="关联模板"/>
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table size="small" class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />

        <n-modal v-model:show="editing" :style="{width:'640px'}" preset="card" title="编辑定制页面" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="left" label-width="80">
                <n-space vertical>
                    <n-form-item label="页面名称" required> <n-input v-model:value="bean.name"/> </n-form-item>
                    <n-form-item label="关联模板" required><Selector :items="flows" v-model:value="bean.fid" /></n-form-item>
                    <n-form-item label="渲染方式">
                        <n-radio-group v-model:value="bean.format">
                            <n-space>
                                <n-radio v-for="(text, id) in formatTypes" :value="id">{{text}}</n-radio>
                            </n-space>
                        </n-radio-group>
                    </n-form-item>
                    <n-form-item label="私人数据">
                        <n-switch v-model:value="bean.personal" :checked-value="1" :unchecked-value="0" />
                        <n-text depth="3" class="ml-4">勾选后，只加载个人发布的流程数据</n-text>
                    </n-form-item>
                    <n-form-item label="授权人员">
                        <n-space vertical class="w-full">
                            <n-alert type="info" :show-icon="false" :bordered="false">
                                默认只授权给<Tag size="small">企业管理员</Tag>，设置为 <Tag size="small">*</Tag>则为全部企业内员工，
                                或通过<Tag size="small">S+员工ID</Tag> 的方式限定到指定人员（支持多个，用英文逗号隔开）
                            </n-alert>
                            <n-input type="textarea" :rows="2" v-model:value="bean.auth"/>
                        </n-space>
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
    import { NButton, NButtonGroup } from 'naive-ui'
    import { Search, Plus, Trash, PencilRuler, Pencil } from 'lucide-vue-next'

    import { formatTypes } from '@S/Page'

    import Selector from "@CA/selector.vue"
    import Tag from "@C/common/tag.vue"
    import P from "@Pagination"

    const router = useRouter()
    let flows = ref([])
    let { beans , form, pagination, refresh } = P({url:`/system/page-list`, form:{}})
    let editing = ref(false)
    let bean = ref({})

    const columns= [
        { title:"序号", width:60, align:"center", render:(row,i)=> i+1 },
        {
            title:"名称", key:"name",ellipsis:true, width:180,
            render: r=>h('span',{onClick:()=>toView(r), class:"cursor-pointer"}, r.name)
        },
        { title:"模板", key:"fname", width:120, render:r=>h(Tag,()=>r.fname)},
        { title:"渲染模式", key:"format", width:180, render:r=>h(Tag,()=>r.format?.toUpperCase()) },
        { title:"私人数据", key:"personal", width:100, render:r=>`${r.personal?"是":"否"}`},
        { title:"授权人员", key:"auth", ellipsis: true, width:160},
        { title:"描述", key:"summary",ellipsis:true },
        { title:"日期", key:"addOn", width: 160, render: row=> H.date.datetime(row.addOn) },
        {
            width:140,align:"center",
            title:()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
            render: (row,i)=>h(NButtonGroup, ()=>[
                UI.iconBtn(Pencil, ()=>toEdit(row), {title:"修改基本信息"}),
                UI.iconBtn(PencilRuler, ()=>toCustom(row), {title:"页面定制"}),
                UI.popDel(`确定删除${UI.wrapHtml(row.name)}页面吗？`, ()=>toDel(row, i))
            ])
        }
    ]

    const toEdit = row=>{
        bean.value = row?? {id:undefined, name:"新建定制页面"}
        editing.value = true
    }
    const editDo = ()=>{
        let { name, fid } = bean.value
        if(!name)       return M.warn(`名称不能为空`)
        if(!fid)        return M.warn(`请选择关联模板`)

        RESULT(`/system/page-add`, bean.value, d=>{
            M.notice.ok(`页面信息已保存`)
            editing.value = false
            refresh()
        })
    }
    const toDel = (row, i)=>RESULT("/system/page-del", {id:row.id},d=> {
        M.ok(`流程${UI.wrap(row.title)}已删除`)
        beans.value.splice(i, 1)
    })
    const toCustom = row=>{
        let r = router.resolve({name:`sys-page-edit`, params:{id: row.id}})
        H.openUrl(r.href, {title: row.name, center:true }) //, width: screen.width - 40
    }
    const toView = row=>{
        let r = router.resolve({name:`page-view`, params:{id: row.id}})
        H.openUrl(r.href, { title: row.name, center:true })
    }

    onMounted(() => {
        RESULT("/system/flow-list", {}, d=> flows.value = d.data?.map(v=>({value: v.id, label:v.name})))
    })
</script>
