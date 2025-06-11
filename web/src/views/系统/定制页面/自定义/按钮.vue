<template>
    <n-table size="small" :bordered="false">
        <thead>
            <tr>
                <th width="40" class="text-center">#</th>
                <th width="120">显示区域</th>
                <th>按钮文本</th>
                <th width="180">样式</th>
                <th width="50">图标</th>
                <th width="80" class="text-center">
                    <n-button circle size="tiny" secondary type="primary" @click="add"><template #icon><n-icon :component="Plus" /></template> </n-button>
                </th>
            </tr>
        </thead>
        <tbody ref="dragEl">
            <tr v-for="(item, index) in items">
                <td class="text-center"> <AlignJustify class="draggable ml-1" size="20" /> </td>
                <td><n-select :options="areas" v-model:value="item.category" /> </td>
                <td><n-input v-model:value="item.label"/> </td>
                <td><n-select :options="types" v-model:value="item.type" /></td>
                <td>
                    <n-popover trigger="click">
                        <template #trigger>
                            <n-button :type="item.type" secondary block>
                                <template #icon><component :is='icons[item.icon]' /></template>
                                <!-- {{item.icon||'无'}} -->
                            </n-button>
                        </template>
                        <n-grid cols="4" x-gap="20" y-gap="20" class="p-3">
                            <n-gi v-for="(icon, iconName) in icons" :title="iconName">
                                <component @click="item.icon=item.icon==iconName?null:iconName"
                                    :class="{'cursor-pointer':true, 'primary': iconName==item.icon}"
                                    :is='icon' />
                            </n-gi>
                        </n-grid>
                    </n-popover>
                </td>
                <td class="text-center">
                    <n-button circle title="编辑脚本" size="small" @click="editBtnScript(item)" tertiary type="primary"><template #icon><n-icon :component="Code" /></template> </n-button>
                    <n-button class="ml-2" circle size="small" @click="items.splice(index,1)" tertiary type="error"><template #icon><n-icon :component="Trash" /></template> </n-button>
                </td>
            </tr>
        </tbody>
    </n-table>

    <n-modal v-model:show="btner.show" preset="card" :style="{width: '1000px'}" :mask-closable="true">
        <template #header>
            按钮⌈{{btner.item.label}}⌋的脚本代码
        </template>
        <n-alert type="info" class="mb-4" :bordered="false" >
            点击按钮后出发，如果是<Tag size="small">数据行</Tag>按钮，参数为：btn（按钮对象）、row（行数据）、rowIndex（行序号）、api（封装接口）
        </n-alert>

        <CodeEditor v-model:value="btner.item.handler" height="420px" />
    </n-modal>
</template>

<script setup>
    import { Plus,Trash, AlignJustify, Code } from 'lucide-vue-next'
    import { useDraggable } from 'vue-draggable-plus'

    import CodeEditor from "@CODE"

    import { C_ROW, C_GLOBAL, icons } from "@S/Page"
    const areas = UI.buildOptions({[C_ROW]:"数据行", [C_GLOBAL]:"检索区"})
    const types = UI.buildOptions({default:"默认/DEFAULT", primary:"主要/PRIMARY", info:"信息/INFO", success:"成功/SUCCESS", warning:"警告/WARN", error:"错误/ERROR"})

    const props=defineProps({
        items:{type:Array}
    })
    let dragEl = ref()
    const btner  = reactive({show: false, item:{}})

    const add = ()=> props.items.push({id:"", label:`新建按钮`})
    const editBtnScript = v=> {
        btner.item = v
        btner.show = true
    }

    onMounted(()=>nextTick(()=>useDraggable(dragEl, props.items, {handle:".draggable"})))
</script>
