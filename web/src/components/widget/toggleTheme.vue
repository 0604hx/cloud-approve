<template>
    <n-popover :trigger>
        <template #trigger>
            <n-button title="切换明亮/暗黑模式" :color :size circle quaternary><template #icon><component :is='icon'/></template></n-button>
        </template>
        <n-space vertical>
            <n-button v-for="item in options" secondary :type="ui.theme==item.value?'primary':'default'" @click="change(item)">
                <template #icon><component :is="item.icon" /></template>
                {{ item.text }}
            </n-button>
        </n-space>
    </n-popover>
</template>

<script setup>
    import { Sun, Moon, SunMoon } from 'lucide-vue-next'
    import { uiStore } from '@/store'

    const props = defineProps({
        size:{type:String, default:"small"},
        trigger:{type:String, default:"click"},
        color:{type:String}
    })

    const ui = uiStore()
    const options = [
        { text:"浅色", value:"light", icon: Sun },
        { text:"深色", value:"dark", icon: Moon },
        { text:"自动", value:"auto", icon: SunMoon }
    ]

    const icon = computed(()=> ui.theme=='auto'?SunMoon: (ui.theme=='dark'? Moon : Sun))

    const change = option=>{
        ui.setTheme(option.value)
        nextTick(()=>M.info(`主题切换到${UI.wrap(option.text)}`))
    }
</script>
