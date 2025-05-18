<template>
    <div class="p-4">
        <n-card v-if="cache.keys">
            <template #header><Cookie class="icon primary" /> 系统缓存</template>

            <n-grid cols="100:1 300:2 500:5" x-gap="20">
                <n-gi><n-statistic label="KEY总数" :value="cache.keys" /></n-gi>
                <n-gi><n-statistic label="命中" :value="cache.hits" /></n-gi>
                <n-gi><n-statistic label="未命中" :value="cache.misses" /></n-gi>
                <n-gi><n-statistic label="KEY占用空间" :value="filesize(cache.ksize)" /></n-gi>
                <n-gi><n-statistic label="值占用空间" :value="filesize(cache.vsize)" /></n-gi>
            </n-grid>

            <n-divider title-placement="left">缓存清理</n-divider>
            <n-space>
                <n-input v-model:value="id" placeholder="请输入KEY"></n-input>
                <n-button type="primary" secondary @click="toDel()">精准删除</n-button>
                <n-button type="primary" secondary @click="toDel(true)">模糊删除（前缀匹配）</n-button>
            </n-space>
        </n-card>
    </div>
</template>

<script setup>
    import { Cookie } from 'lucide-vue-next'

    let cache = ref({})
    let id = ref("")

    const toDel = (prefix=false)=> {
        if(!id.value.trim())    return M.warn(`请输入KEY`)

        RESULT("/system/cache-del", { id:id.value, prefix}, d=> M.notice.ok(`缓存清理完成（本次清理${d.data}个）`))
    }
    onMounted(() => {
        RESULT("/system/cache", {}, d=> cache.value = d.data)
    })
</script>
