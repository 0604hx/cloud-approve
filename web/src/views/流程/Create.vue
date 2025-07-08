<!--流程发起按钮-->
<template>
    <n-dropdown v-if="!expand" trigger="click" :options show-arrow
        key-field="id" label-field="name"
        @select="onSelect" @update:show="onShow">
        <n-button :color :size circle quaternary title="发起新流程">
            <template #icon><CirclePlus /></template>
        </n-button>
    </n-dropdown>
    <n-space v-else size="large">
        <n-tooltip v-for="item in options" trigger="hover" placement="bottom-start">
            <template #trigger>
                <n-button :secondary="light" size="large" type="primary" @click="onSelect(0, item)">{{ item.name }}</n-button>
            </template>
            {{ item.summary||'暂无描述信息' }}
        </n-tooltip>
    </n-space>
</template>

<script setup>
    import { NText } from 'naive-ui'
    import { CirclePlus } from 'lucide-vue-next'

    import Edit from "./新建.vue"

    const props = defineProps({
        expand:{type:Boolean, default: false},
        size:{type:String, default:"small"},
        trigger:{type:String, default:"click"},
        color:{type:String},
        light:{type:Boolean, default: true }
    })
    let options = ref([])

    const refresh = ()=>RESULT("/flow/mine",{}, d=> {
        if(Array.isArray(d.data) && d.data.length)
            options.value = d.data
        else{
            options.value = props.expand==true? [] : [{
                type:"render",
                render:()=>h(NText, {depth:3, class:"p-4"}, ()=>"暂无可用模板，请联系管理员")
            }]
        }
    })

    const onShow = show=>{
        if(show && options.value.length==0){
            refresh()
        }
    }

    const onSelect = (id, flow)=>{
        let width = `${(flow.options?.width??900)/0.75}px`
        let height = `460px`
        const dialog = M.dialog({
            title: `拟稿「${flow.name}」`,
            showIcon:false,
            maskClosable:false,
            // transformOrigin:"center",
            style:{ width },
            content:()=> h(Edit, { flow, height, onClose:()=> dialog.destroy() })
        })
    }

    onMounted(()=>{
        if(props.expand == true)
            refresh()
    })
</script>
