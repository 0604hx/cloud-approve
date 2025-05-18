<template>
    <n-data-table class="h-full" :columns="columns" :data="beans" :bordered="false" striped />
</template>

<script setup>
    import Tag from "@C/common/tag.vue"

    const props = defineProps({
        pid: {type:Number}
    })

    const columns = [
        { title:"序号", width:55, render:(row,i)=> i+1 },
        { title:"处理时间", width:180, render:r=> H.date.datetime(r.addOn) },
        { title:"处理人", width:100, key:"sname" },
        { title:"处理步骤", width:160, key:"action",render:r=>h(Tag, {type:"default"}, ()=>r.action) },
        // { title:"下一步骤", width:160, key:"nextAction"},
        { title:"意见", key:"summary",ellipsis:true }
    ]
    const beans = ref([])

    onMounted(() => RESULT("/process-nodes", props, d=> beans.value=d.data))
</script>
