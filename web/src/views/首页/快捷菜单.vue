<template>
    <n-card>
        <template #header><PlaneTakeoff class="icon primary" style="margin-right: 8px;" size="20" />我的快捷功能</template>
        <n-space v-if="pages.length">
            <n-tooltip v-for="p in pages" trigger="hover" placement="bottom-start">
                <template #trigger>
                    <n-button type="primary" secondary size="large" @click="goto(p)">{{p.name}}</n-button>
                </template>
                {{ p.summary||'暂无描述信息' }}
            </n-tooltip>
        </n-space>
        <n-text v-else depth="3">暂无数据</n-text>
    </n-card>
</template>

<script setup>
    import { PlaneTakeoff } from 'lucide-vue-next'

    const router = useRouter()
    let pages = ref([])

    const goto = row=>E.emit('jumpTo', {name:"page", params:{id: row.id}})
    onMounted(() => {
        RESULT("/flow/page-list",{},d=> pages.value = d.data)
    })
</script>
