<template>
    <n-tag :type :bordered="false">{{ StatusList[code] }}</n-tag>
</template>

<script setup>
    import { StatusList } from '@S/Const'
    const props= defineProps({
        code: {type:Number, default:-1}
    })

    const type = computed(()=>["primary","success","warning"][props.code])
</script>
