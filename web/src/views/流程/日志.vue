<template>
    <div v-if="loading" class="text-center"><n-spin size="large"></n-spin></div>
    <n-table v-else striped :bordered="false" :size>
        <thead>
            <tr>
                <th width="180">日期</th>
                <th width="100">记录者</th>
                <th>内容</th>
                <th width="50" class="p-0">
                    <n-button secondary type="primary" @click="toAdd" circle :size>
                        <template #icon><Plus /></template>
                    </n-button>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in beans">
                <td>{{datetime(item.addOn)}}</td>
                <td>{{item.sname}}</td>
                <td>{{item.value}}</td>
            </tr>
        </tbody>
    </n-table>
</template>

<script setup>
    import { Plus } from 'lucide-vue-next'

    import Message from "@VW/流程留言.vue"

    const props = defineProps({
        pid: {type:Number},
    })

    const size = "small"
    let loading = ref(true)
    let beans = ref([])

    const refresh = () => RESULT("/process-log-list", props, d=> beans.value=d.data, {loading})
    const toAdd = ()=>{
        const dialog = M.dialog({
            title: `新增留言`,
            showIcon:false,
            maskClosable:false,
            style:{ width:"640px" },
            content:()=> h(Message, {
                pid:props.pid,
                onDone:()=> {
                    dialog.destroy()
                    refresh()
                }
            })
        })
    }

    onMounted( refresh )
</script>
