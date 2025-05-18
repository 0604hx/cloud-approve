<template>
    <n-space vertical class="w-full">
        <n-input type="textarea" rows="5" placeholder="请输入留言内容" v-model:value="text"></n-input>
        <n-space v-if="historys.length"  size="small">
            历史留言:
            <Tag size="small" class="cursor-pointer" v-for="item in historys" :title="item.value" @click="()=>text=item.value">{{item.short}}</Tag>
        </n-space>
        <div class="text-center">
            <n-button size="large" type="primary" @click="toSave">保存</n-button>
        </div>
    </n-space>
</template>

<script setup>
    const props=defineProps({
        pid:Number,
        onDone: Function,
        max:{type:Number, default:5}
    })

    const maxText = 8
    const storeKey = `process.log.${User.id}`
    let text = ref()
    let historys = ref([])

    const toSave = ()=>{
        RESULT("/process-log-add", {pid: props.pid, value: text.value},d=>{
            M.confirm(
                `数据提交成功`,
                `是否将本次的内容缓存，方便下次快速录入？`,
                ()=>{
                    props.onDone && props.onDone()
                    H.store.setList(storeKey, text.value, props.max)
                },
                props.onDone
            )
        })
    }

    onMounted(() => {
        const items = H.store.getList(storeKey)
        historys.value = items.map(value=>({value, short:value.length>maxText?value.substring(0,maxText):value}))
        console.debug(historys)
    })
</script>
