<template>
    <n-form-item v-if="state!=0" :label="bean.name">
        <n-text v-if="state==-1" depth="3">码表#{{uuid}}有误</n-text>
        <n-select v-else="state==1":options @update:value="v=>emits('update:value', v)" clearable></n-select>
    </n-form-item>
    <n-form-item v-else>
        <n-skeleton :sharp="false" size="medium" />
    </n-form-item>
</template>

<script setup>
    const emits = defineEmits(["update:value"])
    const props = defineProps({
        value:{type:[String, Number]},
        uuid:{type:[Number, String], default:0}
    })

    let state = ref(0)
    let bean = {}
    let options = []

    onMounted(() => {
        RESULT("/process-constants", props.uuid,d=>{
            bean = d.data
            if(bean.id == props.uuid){
                options = UI.buildOptions(bean.value)
                state.value = 1
            }
            else{
                state.value = -1
            }
        })
    })
</script>
