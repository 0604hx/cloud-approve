<template>
    <n-form inline label-placement="top" :show-feedback="false">
        <template v-for="item in items">
            <ConstantItem v-if="item.type=='constant'" :style="buildStyle(item.width)" v-model:value="form[item.id]" :uuid="item.content" />
            <n-form-item v-else-if="item.type!='hide'" :label="item.label" :style="buildStyle(item.width)">
                <n-input v-if="item.type=='text'" v-model:value="form[item.id]" clearable />
                <n-input-number v-else-if="item.type=='number'" v-model:value="form[item.id]" clearable/>
                <n-switch v-else-if="item.type=='switch'" v-model:value="form[item.id]" />
                <n-date-picker v-else-if="item.type=='date'" v-model:formatted-value="form[item.id]" class="w-full" clearable/>
            </n-form-item>
        </template>
        <n-form-item>
            <n-button secondary circle type="primary" @click="query">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-form-item>
    </n-form>
</template>

<script setup>
    import { Search } from 'lucide-vue-next'

    import ConstantItem from '@VW/常量组件.vue'

    const props = defineProps({
        items:{type:Array, default:[]},
        form:{type:Object},
        query:{type:Function}
    })

    const buildStyle = w=> {
        let width = typeof(w)=='number'? `${w}px` : w ?? '180px'
        return { width, height:"100%" }
    }
</script>
