<template>
    <!-- <n-tooltip trigger="hover">
        <template #trigger>
            <n-color-picker :value="ui.primaryColor" :swatches="primaryColors" :style="{ width: size, height: size }"
                :on-update:value="(v) => ui.setPrimaryColor(v)" :render-label="() => ''" :on-update:show="onShow" />
        </template>
        设置主题色
    </n-tooltip> -->
    <n-color-picker title="设置主题色" ref="picker"
        :value="ui.primaryColor" :swatches="primaryColors" :style="{ width: size, height: size, color }"
        :on-update:value="update" :render-label="() => ''" :on-update:show="onShow" />
</template>

<script setup>
    import { uiStore, presetColors } from '@/store'
    import { getPresetColors } from '@arco-design/color'

    const props = defineProps({
        size:{type:String, default:'20px'},
        color:{type:String}
    })

    const ui = uiStore()

    let picker = ref()
    const primaryColors = ref([])

    const onShow = v=>{
        if(primaryColors.value.length==0){
            primaryColors.value = presetColors()
        }
    }
    const update = v=>{
        ui.setPrimaryColor(v)
        M.info(`主题色已更新`)
    }

    // onMounted(() => {
    //     //设置圆角，保持一致
    //     let div = picker.value?.$el.querySelector("div>div:nth-child(2)")
    //     if(div)
    //         div.style['borderRadius']='var(--n-border-radius)'
    // })
</script>
