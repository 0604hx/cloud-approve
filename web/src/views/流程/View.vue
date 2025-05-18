<!--查看流程的详细信息-->
<template>
    <n-spin v-if="state==0" class="text-center w-full">
        <template #description>数据加载中... </template>
    </n-spin>
    <div v-else-if="state==1" class="p-2 h-full">
        <n-card class="h-full">
            <template #header>
                <StatusPin :code="bean.status" />
                {{bean.title}}
            </template>
            <template #header-extra v-if="bean.status==0">
                当前处理人：<Tag size="small">{{bean.curSName}}</Tag>
            </template>

            <n-tabs type="line" class="h-full">
                <n-tab-pane tab="流程数据" name="data" :display-directive :style>
                    <Render ref="render" :flowId="bean.fid" :pid="bean.id" />
                </n-tab-pane>
                <n-tab-pane tab="附件" name="attach" :display-directive :style>
                    <FilePane :pid="bean.id" :disabled="bean.status!=0" />
                </n-tab-pane>
                <n-tab-pane tab="流程办理" name="action" :display-directive :style>
                    <ProcessDeal v-if="bean.status==0" :flowId="bean.fid" :pid="bean.id" :disabled :onDone="onSave" />
                    <n-text v-else depth="3">流程已{{bean.status==1?"办结":"取消"}}于{{time}}</n-text>
                </n-tab-pane>
                <n-tab-pane tab="交办记录" name="node" :display-directive :style>
                    <History :pid="id" />
                </n-tab-pane>
                <n-tab-pane tab="日志数据" name="log" :display-directive :style>
                    <LogPane :pid="id" />
                </n-tab-pane>
            </n-tabs>
        </n-card>
    </div>
    <n-alert v-else type="error" title="无法查看流程详情"></n-alert>
</template>

<script setup>
    import { FilePenLine } from 'lucide-vue-next'

    import Render from "./流程渲染.vue"
    import ProcessDeal from "@VW/流程办理.vue"
    import History from "./交办记录.vue"
    import FilePane from "./附件.vue"
    import StatusPin from "@CA/status.vue"
    import LogPane from "./日志.vue"

    const route = useRoute()
    const id = parseInt(route.params.id)

    const displayDirective = "show:lazy"
    const height = "100%"
    const isNew = !id
    const style = {height: `${window.innerHeight - 150}px`, overflowY:'auto'}

    let disabled = ref(false)
    let bean = ref({})
    let state = ref(0)
    const time = computed(()=> H.date.datetime(bean.value.lastOn))

    const onSave = node =>{
        node.pid = id
        RESULT("/process-approve", node, d=>{
            disabled.value = true
            M.notice.ok(`流程已提交（请刷新页面查看最新数据）`)
            if(node.type=='done')
                location.reload()
        })
    }

    onMounted(() => {
        if(!id) return state.value = 1

        RESULT(`/process-detail-${id}`, {},d=> {
            let b = d.data
            if(b && b.id == id){
                bean.value = b
                disabled.value = b.curSId != window.User.id
                state.value = 1
            }
            else
                state.value = -1
        })
    })
</script>
