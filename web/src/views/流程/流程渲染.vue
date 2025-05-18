<template>
    <n-skeleton v-if="initing" text :repeat="10" height="40px" />
    <template v-else>
        <n-alert v-if="fail" type="warning" show-icon :bordered="false" :title>
            请联系<Tag size="small">管理员</Tag>完善模板的表单内容，以便录入流程内容。
        </n-alert>
        <FormRender v-else :renders="RenderFuncs" :initValue ref="render" :form :debug/>
    </template>
</template>

<script setup>
    import { FormRender, RenderFuncs } from "@grid-form/render-naive"

    const props = defineProps({
        pid:{type:Number},
        readonly:{type:Boolean, default:false},
        flowId:{type:Number}
    })

    const title = "表单渲染失败"
    let debug = window.DEBUG
    let initing = ref(true)
    let fail = ref(false)
    let form = ref({})
    let render = ref()
    let initValue = {}

    const getValue = ()=> {
        if(render.value)    return render.value.getFormData()

        M.notice.error(`请联系管理员完善模板的表单内容`, title)
        throw title
    }

    onMounted(() => RESULT(`/process-flow-data`,{ pid: props.pid, flowId: props.flowId },d=> {
        form.value = typeof(d.data)=="string"?JSON.parse(d.data):d.data
        if(form.value == null)
            fail.value = true
        if(props.pid && d.message){
            initValue = typeof(d.message)=='string'?JSON.parse(d.message):d.message
        }
        nextTick(()=> initing.value = false)
    }))

    defineExpose({ getValue })
</script>
