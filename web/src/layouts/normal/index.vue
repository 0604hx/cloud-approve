<template>
    <n-layout class="w-full h-full" position="absolute">
        <AppHeader :inverted="ui.darkNav" />

        <n-layout :has-sider="showSider" position="absolute" :style="{ top: 'var(--header-height)' }">
            <n-layout-sider
                :collapsed-width :width="siderWidth" @collapse="collapsed = true" @expand="collapsed = false"
                :collapse-mode="enableCollapsed?'width':'transform'" :content-style="{padding: '0 6px 0 0px'}"
                :show-collapsed-content="true" :collapsed
                bordered :native-scrollbar="false"
                show-trigger="arrow-circle">
                <Menu :enableCollapsed :collapsed :collapsed-width />
            </n-layout-sider>

            <n-layout :native-scrollbar="false" content-class="h-full" :content-style>
                <slot />

                <n-layout-footer bordered position="absolute" style="height:var(--footer-height); padding: 10px;text-align: center;">
                    <AppFooter />
                </n-layout-footer>
            </n-layout>
        </n-layout>
    </n-layout>
</template>

<script setup>
    import AppHeader from './header.vue'
    import AppFooter from './footer.vue'
    import Menu from '@/components/common/menu.vue'

    import { uiStore } from '@/store'

    const ui = uiStore()
    const enableCollapsed = import.meta.env.PUBLIC_SIDER_COLLAPSED=='true'
    const siderWidth = import.meta.env.PUBLIC_SIDER_WIDTH
    const collapsedWidth = enableCollapsed?64:14

    let collapsed = ref(false)
    let showSider = ref(true)
    const contentStyle = computed(()=>({
        "padding-bottom":"var(--footer-height)",
        "min-height": "calc(100vh - var(--header-height))",
        "display": "flex",
        "flex-direction": "column",
        "background-color": ui.isDark?"inherit":"#f5f7f960"
    }))
</script>

<style>
    .collapsed {
        width: 64px;
    }
</style>
