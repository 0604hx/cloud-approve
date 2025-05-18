<template>
    <div class="p-4 h-flex">
        <n-space>
            <n-input v-model:value="form.LIKE_name" placeholder="名称" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />

        <n-modal v-model:show="editing" :style="{width:'840px'}" preset="card" title="编辑码表" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="left" label-width="80">
                <n-space vertical>
                    <n-form-item label="数据名称" required> <n-input v-model:value="bean.name"/> </n-form-item>
                    <n-form-item label="数据类型" required>
                        <n-radio-group v-model:value="bean.type" name="radiogroup">
                            <n-space>
                                <n-radio v-for="v in typeOptions" :value="v.value">{{v.label}}</n-radio>
                            </n-space>
                        </n-radio-group>
                    </n-form-item>
                    <n-form-item label="所属企业" v-if="!isCompany" required>
                        <Selector url="/system/company-list" v-model:value="bean.cid" />
                    </n-form-item>
                    <n-form-item label="值">
                        <n-input type="textarea" :rows="16" v-model:value="bean.value"  placeholder="请填写数据内容"/>
                    </n-form-item>
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

    import Tag from "@C/common/tag.vue"
    import P from "@Pagination"

    const route = useRoute()
    const isCompany = route.name.startsWith("company-")
    const prefix = isCompany?'company':'system'
    const types = { text:"文本", number:"数值", bool:"布尔", list:"清单", json:"JSON" }
    const typeOptions = UI.buildOptions(types)

    let { beans , form, pagination, refresh } = P({url:`/${prefix}/constant-list`, form:{}})
    let loading = ref(false)
    let editing = ref(false)
    let bean = ref({})

    const columns= (()=>{
        let cs = [
            { title:"编号", width:60, align:"center", key:'id'},
            { title:"名称", width:160, key:'name'}
        ]
        if(!isCompany)
            cs.push({ title:"所属企业", width:220, key:'cname'})

        return [
            ...cs,
            { title:"类型", width:100, key:"type", render:r=>h(Tag,()=>types[r.type]) },
            { title:"内容", key:"value", ellipsis:true },
            {
                width: 145,align:"center",
                title:()=> UI.iconBtn(Plus, ()=> toEdit(), {type:"primary", secondary:true}),
                render: (r,i)=>h(NSpace, {size:"small"}, ()=>[
                    h(NButton, {secondary:true, onClick:()=>toEdit(r)}, ()=>"修改"),
                    UI.popDel(`确认删除码表${UI.wrapHtml(r.name)}吗？`, ()=>toDel(r,i), ()=>h(NButton, {class:"error", secondary:true}, ()=>"删除"))
                ])
            }
        ]
    })()

    const toEdit = row=>{
        bean.value = row?? {id:undefined, type:"text", name:"新建码表"}
        editing.value = true
    }
    const editDo = ()=>{
        let { name, cid, type, value } = bean.value
        if(!(name && type))     return M.warn(`名称、类型不能为空`)
        if(!isCompany && !cid)  return M.warn(`所属企业不能为空`)

        //数据验证
        if(type == 'number' && isNaN(value))    return M.warn(`请填写有效的数值`)
        if(type == 'json'){
            try{
                JSON.parse(value)
            }catch(e){
                H.log.error(`解析JSON出错`, e)
                return M.notice.warn(e.message, `JSON格式有误`)
            }
        }

        RESULT(`/${prefix}/constant-add`, bean.value, d=>{
            M.notice.ok(`数据已保存`)
            editing.value = false
            refresh()
        })
    }
    const toDel = (row,i)=> RESULT(`/${prefix}/constant-del`, {id:row.id}, ()=>{
        M.ok(`数据已删除`)
        beans.value.splice(i, 1)
    })
</script>
