<template>
    <div v-if="!inited" class="w-full text-center">
        <n-spin size="large" />
    </div>
    <Designer v-else :renders="RenderFuncs" :loading="loading" review :components="Components" contextMenu :form="bean" :debug enableCtrlS
        @save="toSave" class="h-full" />
</template>

<script setup>
    import { Designer, Components } from "@grid-form/designer"
    import { RenderFuncs } from "@grid-form/render-naive"
    import { createForm } from "@grid-form/common"

    const { id } = useRoute().params
    let inited = ref(false)
    let loading = ref(false)
    let bean = ref({})
    let debug = window.DEBUG

    const toSave = form=> RESULT("/system/flow-update", {id, key:"value", value:JSON.stringify(form)},d=>{
        M.notice.ok(`表单数据保存成功`)
    })

    onMounted(() => {
        RESULT("/system/flow-"+id, {},d=>{
            bean.value = d.data.value? JSON.parse(d.data.value):createForm({submitText:""})
            inited.value = true
        })
    })
</script>
