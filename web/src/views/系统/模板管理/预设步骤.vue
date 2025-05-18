<template>
    <n-table size="small" :bordered="false" striped>
        <thead>
            <tr>
                <th>步骤</th>
                <th width="180">预设处理人</th>
                <th width="30"></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in items">
                <td><n-input v-model:value="item.action" /></td>
                <td><SelectorStaff v-model:value="item.sid" v-model:name="item.sname" :cid /></td>
                <td>
                    <n-button size="small" type="error" secondary circle @click="items.splice(index, 1)">
                        <template #icon><n-icon :component="Trash" /></template>
                    </n-button>
                </td>
            </tr>
            <tr>
                <td colspan="3" class="text-center">
                    <n-button type="primary" secondary circle @click="items.push({action:''})"><template #icon><n-icon :component="Plus" /></template></n-button>
                </td>
            </tr>
        </tbody>
    </n-table>
</template>

<script setup>
    import { Trash, Plus } from 'lucide-vue-next'
    import SelectorStaff from "@CA/selector.staff.vue"

    const props = defineProps({
        text:{type:[String, Array, Object]},
        cid:Number
    })

    const items = ref(H.toObj(props.text, []))

    const toText = ()=> JSON.stringify(_raw(items))
    const getValue = ()=> items.value

    defineExpose({ toText, getValue })
</script>
