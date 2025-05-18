<template>
    <n-space vertical>
        <n-alert v-for="item in list" :title="item" :bordered="false" type="error" show-icon></n-alert>
    </n-space>
</template>

<script setup>
    const props = defineProps({
        list: {type:Array, default:[]}
    })
</script>
