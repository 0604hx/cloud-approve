<template>
    <n-spin v-if="initing" class="text-center w-full">
        <template #description>数据加载中... </template>
    </n-spin>
    <n-space class="p-4" v-else size="large" vertical>
        <n-card :size>
            <template #header>
                <Palette class="icon primary" /> 表格/按钮外观
                <n-text depth="3" class="ml-2 text-xs">定义页面内表格、按钮的基本外观属性</n-text>
            </template>
            <n-grid cols="10">
                <n-form-item-gi span="2" :showFeedback label="尺寸">
                    <n-radio-group v-model:value="bean.size" :size>
                        <n-radio-button value="small">偏小</n-radio-button>
                        <n-radio-button value="medium">普通</n-radio-button>
                        <n-radio-button value="large">偏大</n-radio-button>
                    </n-radio-group>
                </n-form-item-gi>
                <n-form-item-gi span="3" :showFeedback label="全局按钮模式">
                    <n-space>
                        <n-radio-group v-model:value="bean.btnStyle">
                            <n-radio value=""><n-button :size>按钮</n-button type="primary"></n-radio>
                            <n-radio value="secondary"><n-button :size secondary type="primary">按钮</n-button></n-radio>
                            <n-radio value="tertiary"><n-button :size tertiary type="primary">按钮</n-button></n-radio>
                            <n-radio value="quaternary"><n-button :size quaternary type="primary">按钮</n-button></n-radio>
                        </n-radio-group>
                    </n-space>
                </n-form-item-gi>
                <n-form-item-gi :showFeedback label="表格外边框">
                    <n-switch v-model:value="bean.border"></n-switch>
                </n-form-item-gi>
                <n-form-item-gi :showFeedback label="单元格边框">
                    <n-switch v-model:value="bean.borderCell"></n-switch>
                </n-form-item-gi>
                <n-form-item-gi span="2" :showFeedback label="在数据行显示⌈查看流程⌋按钮">
                    <n-switch v-model:value="bean.showOpenBtn"></n-switch>
                </n-form-item-gi>
                <n-form-item-gi :showFeedback label="自动加载数据">
                    <n-switch v-model:value="bean.autoLoad"></n-switch>
                </n-form-item-gi>
            </n-grid>
        </n-card>
        <n-card :size>
            <template #header>
                <Search class="icon primary" /> 检索区
                <n-text depth="3" class="ml-2 text-xs">配置检索条件</n-text>
            </template>
            <SearchPane :items="bean.forms" />
        </n-card>
        <n-card :size>
            <template #header>
                <Columns3 class="icon primary" /> 数据列
                <n-text depth="3" class="ml-2 text-xs">配置表格的列内容</n-text>
            </template>
            <ColumnPane :items="bean.columns" />
        </n-card>
        <n-card :size>
            <template #header>
                <CirclePower class="icon primary" /> 自定义按钮
                <n-text depth="3" class="ml-2 text-xs">可配置数据行（表格内）、顶部区域（表格外）的按钮</n-text>
            </template>
            <ButtonPane :items="bean.buttons" />
        </n-card>
        <n-space justify="end">
            <n-button size="large" @click="json(false)">导出到JSON</n-button>
            <n-button size="large" @click="json()">导入JSON格式配置信息</n-button>
            <n-button size="large" @click="preview" title="在本地预览效果（无需保存配置信息）">本地预览</n-button>
            <n-button size="large" type="primary" @click="toSave">
                <template #icon><CircleCheck /></template>保存配置信息
            </n-button>
        </n-space>
    </n-space>
</template>

<script setup>
    import { Search, Palette, CirclePower, Columns3, CircleCheck } from 'lucide-vue-next'

    import SearchPane from "./检索区.vue"
    import ColumnPane from "./数据列.vue"
    import ButtonPane from "./按钮.vue"

    const router = useRouter()
    const id = useRoute().params.id
    const styles = ["", "secondary", "tertiary", "quaternary"]
    const showFeedback = false
    const size="small"

    let initing = ref(true)
    let loading = ref(false)
    let bean = ref({})

    const toSave = ()=>{
        RESULT("/system/page-add", {id, content: bean.value}, d=>{
            M.notice.ok(`页面信息保存成功`)
        }, {loading})
    }
    const preview = ()=>{
        //保存数据到本地
        H.store.setObj('pagePreview', bean.value)
        let r = router.resolve({name:`page-local`, params:{id}})
        H.openUrl(r.href, { title: `[本地预览] ID=${id}`, center:true })
    }
    const json = (out=true)=>{
        if(out == false){
            //导出配置信息
            H.copyTo(bean.value)
            M.notice.ok(`JSON格式的配置信息已经复制到粘贴板😄`)
        }
        else{
            M.prompt(`请粘贴JSON格式数据`, { rows: 12, type:'textarea', style:{width:'840px'} }).then(text=>{
                try{
                    let bb = JSON.parse(text)
                    M.confirm(`导入配置信息`, `确定从JSON中导入页面的配置信息吗，这将覆盖现有的数据？`, ()=>{
                        bean.value = bb
                    })
                }catch(e){
                    M.showError(e.message, `解析JSON数据失败`)
                    return false
                }
            })
        }
    }

    onMounted(() => {
        RESULT("/system/page-detail-"+id, {}, d=>{
            bean.value = d.data.content || {
                size:"medium", border: false, borderCell: false, showOpenBtn:true, btnStyle:"secondary", autoLoad: true,
                forms:[], columns:[], buttons:[], funcs:""
            }
            initing.value = false
        })
    })
</script>
