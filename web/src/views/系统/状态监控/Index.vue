<template>
    <n-flex v-if="inited" vertical class="p-4" size="large">
        <Warnings v-if="bean.warnings && bean.warnings.length" :list="bean.warnings" />

        <n-card title="系统状态">
            <n-grid :x-gap="12" :y-gap="12" cols="200:1 400:2 600:3 800:4 1000:5">
                <n-gi>
                    <n-card :size>
                        <template #header> <MonitorCog class="icon primary"/> 操作系统</template>
                        <template #header-extra><Tag :size>NODE {{bean.os.runtime}}</Tag></template>
                        <Tag class="mr-2" :size>{{bean.os.platform}}</Tag>{{bean.os.os.split("-")[0]}}
                        <!-- <Tag class="ml-2" :size>NODE</Tag> {{bean.os.runtime}} -->
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card :size>
                        <template #header> <Cpu class="icon primary"/> 处理器信息</template>
                        {{bean.os.cpu}}
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card :size>
                        <template #header> <MemoryStick class="icon primary" /> 内存信息</template>
                        <Tag class="mr-2" :size>已用</Tag>{{filesize(bean.os.memUse)}}
                        <Tag class="ml-2" :size>总共</Tag> {{filesize(bean.os.memTotal)}}
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card :size>
                        <template #header> <Database class="icon primary" /> 数据库</template>
                        <Tag class="mr-2" :size>{{bean.os.dbType}}</Tag>
                        {{filesize(bean.os.dbSize)}}
                    </n-card>
                </n-gi>
                <n-gi>
                    <n-card :size>
                        <template #header> <Clock3 class="icon primary" /> 后端启动日期</template>
                        {{bean.os.started}}
                    </n-card>
                </n-gi>
            </n-grid>
        </n-card>

        <DashboardData :data="bean.data" />
    </n-flex>
</template>

<script setup>
    import { MonitorCog, Cpu, MemoryStick,Clock3, Database } from 'lucide-vue-next'
    import DashboardData from "@VW/dashboard.data.vue"
    import Warnings from './告警.vue'

    const size = "small"

    let bean = {}
    let inited = ref(false)

    onMounted(() => {
        RESULT("/system/ops-dashboard", {}, d=>{
            bean = d.data
            inited.value = true
        })
    })
</script>
