<template>
    <n-input-group v-if="company">
        <Selector url="/system/company-list" v-model:value="cid" />
        <n-select style="width:60%"  :disabled v-model:value="shadow" :options :multiple filterable clearable :placeholder="placeholder"
            @update:value="onUpdate" />
    </n-input-group>
    <n-select v-else :disabled v-model:value="shadow" :options :multiple filterable clearable :placeholder="placeholder"
        @update:value="onUpdate" />
</template>

<script setup>
    const emits = defineEmits(["update:value", "update:name"])
    const props = defineProps({
        value: {type:[String, Number,Array]},
        cid:{type:Number},
        company:{type:Boolean, default: false},
        disabled:{type:Boolean, default:false},
        multiple:{type:Boolean, default:false},
        placeholder:{type:String, default:"选择人员"},
        onUpdateValue:{type:Function}
    })

    let shadow = ref(props.value)
    let options = ref([])
    let cid = ref(props.cid)

    const onUpdate = (v, option)=>{
        emits('update:value', v, option)
        if(option?.label)
            emits('update:name', option.label)

        if(typeof(props.onUpdateValue)=="function")
            props.onUpdateValue(v, option)
    }

    const refresh = ()=>RESULT(
        props.cid || props.company?"/system/staff-by-company":"/company-staff-list",
        cid.value?{cid: cid.value}:{},
        d=>options.value = d.data.map(v=>({label:`${v.name}`, value:v.id}))
    )
    watch(()=>props.value, v=> shadow.value =v)
    watch(()=>props.cid, refresh)
    watch(()=>cid.value, refresh)

    onMounted(()=>{
        if(!props.company)
            refresh()
    })
</script>
