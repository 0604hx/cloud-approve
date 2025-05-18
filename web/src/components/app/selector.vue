<template>
    <n-select :disabled v-model:value="shadow" :options :multiple filterable clearable :placeholder="placeholder"
        @update:value="(v, option)=>emits('update:value', v, option)" />
</template>

<script setup>
    const emits = defineEmits(["update:value"])
    const props = defineProps({
        value: {type:[String, Number, Array]},
        url: {type:String},
        params: {type:Object, default:({})},
        disabled:{type:Boolean, default:false},
        multiple:{type:Boolean, default:false},
        placeholder:{type:String, default:"请选择"},
        transfer:{type:Function, default:v=>({label:v.name, value:v.id})},
        items:{type:Array}
    })
    let shadow = ref(props.value)
    let options = ref(props.items)

    watch(()=>props.items, ()=> options.value = props.items)

    onMounted(() => {
        if(options.value)   return

        if(!props.url)  H.log.error(`请指定 selector 的 url 参数...`)
        RESULT(props.url, props.params, d=>options.value = d.data.map(props.transfer) )
    })
</script>
