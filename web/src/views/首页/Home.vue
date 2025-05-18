<template>
    <n-space vertical size="large" class="p-4 w-full">
        <MineDashboard />

        <n-card>
            <template #header><CirclePlus class="primary icon" style="margin-right: 8px;" size="20"/>新建流程</template>
            <Create expand />
        </n-card>

        <MinePage />
    </n-space>
</template>

<script setup>
    import { CirclePlus } from 'lucide-vue-next'

    import MineDashboard from './个人总览.vue'
    import MinePage from "./快捷菜单.vue"
    import Create from "@V/流程/Create.vue"

    const router = useRouter()

    const toLogin = ()=> router.push({name:"login"})
</script>
