<template>
    <n-card :title>
        <template #header-extra v-if="data.scope"><Tag>{{data.scope}}</Tag></template>
        <n-grid :cols>
            <template v-for="(d, v) in data">
                <n-gi v-if="labels[v]">
                    <n-statistic :label="labels[v].label" tabular-nums>
                        <template #prefix><component :is='labels[v].icon' class="icon primary" :size></component> </template>
                        <n-number-animation :from="0" :to="d" />
                    </n-statistic>
                </n-gi>
            </template>
        </n-grid>
    </n-card>
</template>

<script setup>
    import { ShieldCheck,UserCircle,Building2,DatabaseZap,Paperclip,LayoutTemplate, Binary,AppWindow } from 'lucide-vue-next'

    const props = defineProps({
        title:{type:String, default:"数据总览"},
        data:{type:Object},
        size:{type:[Number, String], default:24}
    })

    const cols = computed(()=>{
        let len = Object.keys(props.data).filter(v=>labels[v]).length
        return `200:2 ${len*100}:${len}`
    })
    const labels = {
        account: { label:"应用账号", icon:ShieldCheck },
        staff: { label:"员工", icon:UserCircle },
        company:{ label:"企业", icon:Building2 },
        process: { label:"流程", icon: DatabaseZap },
        file: {label:"附件", icon:Paperclip },
        flow: {label:"模板", icon:LayoutTemplate},
        constant:{label:"码表", icon: Binary },
        page: {label:"动态页面", icon: AppWindow}
    }
</script>
