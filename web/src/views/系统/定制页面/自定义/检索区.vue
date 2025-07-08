<template>
    <n-table size="small" :bordered="false">
        <thead>
            <tr>
                <th width="40" class="text-center">#</th>
                <th width="120">表单ID</th>
                <th width="180">标签名称</th>
                <th width="110">宽度(PX)</th>
                <th width="100">组件类型</th>
                <th>值 <n-text depth="3" class="text-xs">码表组件则为对应的编号，日期组件可填写诸如 yyyy-MM-dd 的格式</n-text></th>
                <th width="25">
                    <n-button circle size="tiny" secondary type="primary" @click="add()"><template #icon><n-icon :component="Plus" /></template> </n-button>
                </th>
            </tr>
        </thead>
        <tbody ref="dragEl">
            <tr v-for="(item, index) in items">
                <td class="text-center"> <AlignJustify class="draggable ml-1" size="20" /> </td>
                <td><n-input v-model:value="item.id"/> </td>
                <td><n-input v-model:value="item.label"/> </td>
                <td><n-input-number v-model:value="item.width" placeholder=""/></td>
                <td><n-select :options v-model:value="item.type" /></td>
                <td><n-input v-model:value="item.content"/> </td>
                <td class="text-center">
                    <n-button circle size="tiny" @click="items.splice(index,1)" tertiary type="error"><template #icon><n-icon :component="Trash" /></template> </n-button>
                </td>
            </tr>
        </tbody>
    </n-table>
</template>

<script setup>
    import { Plus,Trash, AlignJustify } from 'lucide-vue-next'
    import { useDraggable } from 'vue-draggable-plus'

    import { formItemTypes } from "@S/Page"

    const props=defineProps({
        items:{type:Array}
    })
    const options = UI.buildOptions(formItemTypes)
    let dragEl = ref()

    const add = ()=> props.items.push({id:"", label:""})

    onMounted(()=>nextTick(()=>useDraggable(dragEl, props.items, {handle:".draggable"})))
</script>
