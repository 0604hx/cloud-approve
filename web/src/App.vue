<template>
    <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme :theme-overrides="ui.naiveThemeOverrides">
        <n-loading-bar-provider>
            <n-dialog-provider>
                <n-notification-provider :max="4">
                    <n-message-provider :max="5">
                        <NoticeProvider />

                        <router-view v-if="Layout" v-slot="{ Component, route: curRoute }">
                            <component :is="Layout">
                                <transition name="fade-slide" mode="out-in" appear>
                                    <KeepAlive :include="[]">
                                        <component :is="Component" :key="curRoute.fullPath" />
                                    </KeepAlive>
                                </transition>
                            </component>
                        </router-view>
                    </n-message-provider>
                </n-notification-provider>
            </n-dialog-provider>
        </n-loading-bar-provider>

    </n-config-provider>
</template>

<script setup>
    import { darkTheme, useOsTheme, zhCN, dateZhCN } from 'naive-ui'

    import NoticeProvider from "@C/NoticeProvider.vue"

    import { uiStore } from '@/store'

    const router = useRouter()
    const route = useRoute()
    const ui = uiStore()

    let osTheme = useOsTheme()
    let theme = computed(() => ui.isDark?darkTheme: null)

    const layouts = new Map()
    function getLayout(name="normal") {
        // 利用map将加载过的layout缓存起来，防止重新加载layout导致页面闪烁
        if (layouts.get(name))
            return layouts.get(name)
        const layout = markRaw(defineAsyncComponent(() => import(`@/layouts/${name}/index.vue`)))
        layouts.set(name, layout)
        return layout
    }

    let jumpTo = pathOrObj=> {
        let newRoute = typeof(pathOrObj)==='object'?pathOrObj:{name:pathOrObj}
        if(newRoute.name === "login"){
            if(!newRoute.query)    newRoute.query = {}
            newRoute.query['from'] = route.fullPath
        }
        router.push(newRoute)
    }

    const Layout = computed(() => {
        if (!route.matched?.length)
            return null
        return getLayout(route.meta?.layout)
    })

    onMounted(() => {
        E.on('jumpTo', jumpTo)
    })
</script>
