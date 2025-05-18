<template>
    <n-input v-if="!hasTitle" placeholder="请输入流程标题" v-model:value="title" size="large" class="mb-4">
        <template #prefix><n-icon :component="FilePenLine" /></template>
    </n-input>
    <div style="height: 16px;"></div>

    <n-split v-if="!chainSid" direction="horizontal" :style="{ height }" :resize-trigger-size="2"
        pane2-class="pl-4 pr-4" pane1-class="pr-1"
        :default-size="0.75" :max="0.75" :min="0.25">
        <template #1>
            <n-scrollbar :style="{maxHeight: height, paddingRight:'16px'}">
                <Render ref="render" :flowId="flow.id" />
            </n-scrollbar>
        </template>
        <template #2>
            <ProcessDeal showClose simple :onClose :onDone="onSave" :btnText="flow.options?.btnText" :flowId="flow.id"/>
        </template>
    </n-split>
    <div v-else>
        <n-scrollbar :style="{maxHeight: height, paddingRight:'16px'}">
            <Render ref="render" :flowId="flow.id" />
        </n-scrollbar>
        <div class="text-right mt-4">
            <n-button size="large" type="primary" @click="onSave()">{{ flow.options?.btnText||"提交流程" }}</n-button>
        </div>
    </div>
</template>

<script setup>
    import { Send, Plane, FilePenLine } from 'lucide-vue-next'

    import Render from "./流程渲染.vue"
    import ProcessDeal from "@VW/流程办理.vue"

    const props = defineProps({
        flow:{type:Object, default:()=>({})},
        onClose :{type:Function},
        height:{type:String, default:"400px"}
    })
    let chainSid = Array.isArray(props.flow.chains)?props.flow.chains[0]:undefined
    let hasTitle = !!props.flow.options?.titleTpl
    let loading = ref(false)

    let render = ref()

    let title = ref(props.flow?`${window.User.name}的${props.flow.name}`:"")
    let selectIndex = ref(-1)

    const buildModelForRender = bean=>({
        user: window.User.name,
        date: H.date.datetime(),
        bean
    })

    const onSave = (node={}) => {
        let { options, id:fid, name:fName } = props.flow
        if(!title.value && !options.titleTpl)    return M.warn(`请填写标题`)

        let { error, data } = render.value.getValue()
        console.debug(error, data)
        if(error)
            return M.dialog({content:UI.html(error), title:"请完善输入内容", type:"error"})

        if(options.titleTpl){
            title.value = H.io.render(options.titleTpl, buildModelForRender(data))
        }
        if(!!chainSid){
            node.nextSId = chainSid
        }

        let process = {
            title: title.value,
            status:0,
            fid, fName
        }

        node.action ??= import.meta.env.PUBLIC_NODE_STARTER
        RESULT(
            "/process-create",
            {process, node, data},
            d=>{
                M.notice.ok(`流程已发起`)
                props.onClose()
                E.emit("process.create")
            },
            { loading }
        )
    }

    onMounted(() => {
        selectIndex.value = 1
    })
</script>
