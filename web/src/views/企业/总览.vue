<template>
    <n-flex v-if="inited" vertical class="p-4">
        <DashboardData :data="bean.data" />
    </n-flex>
</template>

<script setup>
    import { MonitorCog, Cpu, MemoryStick,Clock3 } from 'lucide-vue-next'
    import DashboardData from "@VW/dashboard.data.vue"

    const size = "small"
    let bean = {}
    let inited = ref(false)

    onMounted(() => {
        RESULT("/dashboard/company", {}, d=>{
            bean = d.data
            inited.value = true
        })
    })
</script>
