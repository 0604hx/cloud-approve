<template>
    <n-tag :bordered="bordered" :type="type" :size="size">
        <slot></slot>
    </n-tag>
</template>

<script setup>
    const props = defineProps({
        type:{type:String, default:"primary"},
        size:{type:String, default:"medium"},
        bordered:{type:Boolean, default:false}
    })
</script>
