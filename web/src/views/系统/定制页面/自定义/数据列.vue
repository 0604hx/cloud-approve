<template>
    <n-table size="small" :bordered="false">
        <thead>
            <tr>
                <th width="40" class="text-center">#</th>
                <th width="120">KEY</th>
                <th width="180">标签名称</th>
                <th width="110">宽度(PX)</th>
                <th width="60">居中</th>
                <th>
                    渲染函数
                    <n-text depth="3" class="ml-1 text-xs">
                        默认原样输出，支持自定义 JavaScript 脚本
                        （
                        参数为①数据行 <n-tag :bordered="false" size="tiny" type="info">row</n-tag>
                        、②渲染函数<n-tag :bordered="false" size="tiny" type="info">h</n-tag>
                        ）
                    </n-text>
                </th>
                <th width="25">
                    <n-button circle size="tiny" secondary type="primary" @click="add()"><template #icon><n-icon :component="Plus" /></template> </n-button>
                </th>
            </tr>
        </thead>
        <tbody ref="dragEl">
            <tr v-for="(item, index) in items">
                <td class="text-center"> <AlignJustify class="draggable ml-1" size="20"/> </td>
                <td><n-input v-model:value="item.key"/> </td>
                <td><n-input v-model:value="item.label"/> </td>
                <td><n-input-number v-model:value="item.width" placeholder=""/></td>
                <td><n-switch v-model:value="item.center" /></td>
                <td><n-input v-model:value="item.render"/> </td>
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

    const props=defineProps({
        items:{type:Array}
    })
    let dragEl = ref()

    const add = ()=> props.items.push({key:"", label:""})

    onMounted(()=>nextTick(()=>useDraggable(dragEl, props.items, {handle:".draggable"})))
</script>
