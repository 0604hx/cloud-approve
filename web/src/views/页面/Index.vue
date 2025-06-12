<template>
    <div class="p-4 h-flex">
        <div v-if="!inited" class="text-center">
            <n-spin size="large">
                <template #description>页面加载中...</template>
            </n-spin>
        </div>
        <template v-else>
            <n-alert v-if="bean.about" class="mb-2" closable :bordered="false" show-icon type="info">
                <div v-html="bean.about"></div>
            </n-alert>
            <n-card :title="bean.name" size="small" segmented>
                <Query :items="bean.content.forms" :query="refresh" :form :pid="id" :buttons="formBtns" />
            </n-card>

            <n-data-table class="mt-2 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
                :remote="true" :bordered="bean.content.border" striped flex-height :size="bean.content.size" :single-line="!bean.content.borderCell"/>
        </template>
    </div>
</template>

<script setup>
    import Query from './检索.vue'

    import P from "@Pagination"
    import { buildColumns, C_ROW, getGlobalBtns } from "@S/Page"

    const route = useRoute()
    const { id } = route.params
    let { beans , form, pagination, refresh } = P({url:`/flow/page-data-${id}`, form:{}}, false)
    let inited = ref(false)

    let bean
    // let bean = {
    //     name:"请款管理",
    //     fid:1,
    //     format:"normal",
    //     about: '这是一个<b class="primary">请款管理</b>页面',
    //     content: {
    //         size: "small",
    //         border: true,
    //         borderCell: true,
    //         btnStyle: "quaternary",
    //         forms:[
    //             { id:"$.username", label:"请款人", type:'text' },
    //             { id:"day", label:"申请日期", type:'date' },
    //             { id:"$.xmmc", type:'constant', content:1 }
    //         ],
    //         columns:[
    //             { key:"username", label:"请款人", width:120 },
    //             { key:"#date#", label: "录入日期", width:180 }
    //         ],
    //         buttons: [
    //             { label:"修改", icon:"Chrome", type:"info", category:C_ROW, handler:`row.pay=true; console.debug(row, rowIndex);` }
    //         ]
    //     }
    // }
    let columns = []
    let formBtns= []    //检索区自定义按钮

    const buildPage = d=>{
        bean = d
        if(bean.content==null)  return M.alert(`检测到页面（#${id}）${UI.wrapHtml("未配置内容","error")}，请联系管理员`, "数据异常")

        bean.content.forms?.filter(f=>f.type=='hide').forEach(f=> form.value[f.id]=f.content)
        columns = buildColumns(bean.content, bean.content.forms?.filter(f=>f.type=='hide'))
        formBtns = getGlobalBtns(bean.content.buttons)

        console.debug("页面数据列", columns)
        nextTick(()=>{
            inited.value = true
            bean.content.autoLoad && refresh()
        })
    }

    onMounted(() => {
        if(route.name == 'page-local'){
            //从本地取出配置信息
            buildPage({id, content: H.store.getObj("pagePreview")})
        }
        else{
            RESULT("/flow/page-detail", {id}, d=>buildPage(d.data))
        }
    })
</script>
