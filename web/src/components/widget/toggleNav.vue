<template>
    <n-popover :trigger>
        <template #trigger>
            <n-button title="切换导航栏背景色" :color :size circle quaternary><template #icon><component :is='icon'/></template></n-button>
        </template>
        <n-space vertical>
            <n-button v-for="item in options" secondary :type="ui.darkNav==item.value?'primary':'default'" @click="change(item)">
                <template #icon><component :is="item.icon" /></template>
                {{ item.text }}
            </n-button>
        </n-space>
    </n-popover>
</template>

<script setup>
    import { Lightbulb, LightbulbOff } from 'lucide-vue-next'
    import { uiStore } from '@/store'

    const props = defineProps({
        size:{type:String, default:"small"},
        trigger:{type:String, default:"click"},
        color:{type:String}
    })
    const ui = uiStore()
    const options = [
        { text:"浅色", value:false, icon: Lightbulb },
        { text:"深色", value:true, icon: LightbulbOff },
    ]

    const icon = computed(()=> ui.darkNav?Lightbulb:LightbulbOff)

    const change = option=>{
        ui.setDarkNav(option.value)
        nextTick(()=>M.info(`导航栏切换到${UI.wrap(option.text)}`))
    }
</script>
