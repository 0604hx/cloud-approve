<template>
    <n-menu v-model:value="key" :collapsed :collapsedWidth ref="menu" :collapsed-icon-size="22" :options="menuOptions" />
</template>

<script setup>
    import { RouterLink } from 'vue-router'
    import {
        ListTodo, Gauge ,Workflow, FolderArchive, Users, Plane,ChartArea, LayoutTemplate, Info, Cog,Cookie,
        Database, DatabaseZap, ShieldCheck, UserCircle, Building2, SquareFunction, Logs, Binary, AppWindow, ShieldUser
    } from 'lucide-vue-next'

    import { isAdminOr, hasAnyRole } from '@S/Auth'

    const props = defineProps({
        enableCollapsed: {type:Boolean, default:false}, //是否启用压缩
        collapsed:{type:Boolean, default: false},
        collapsedWidth: {type:Number, default: 64}
    })

    const route = useRoute()
    const menu = ref()
    const key = ref()

    const menuOptions = computed(()=>{
        const opts = [
            UI.menuItem("home", "我的工作台", Gauge),
            UI.menuItem("process-mine", "我发起的流程", Plane),
            UI.menuItem("process-todo", "待我处理", ListTodo),
        ]
        if(hasAnyRole("COMPANY_ADMIN")){
            opts.push({
                label:"企业维护", key:"company",
                icon: UI.buildIcon2(Building2),
                type:props.enableCollapsed?"":"group",
                children:[
                    UI.menuItem("company-dashboard", "企业总览", ChartArea),
                    UI.menuItem("company-account", "登录账号/钉钉", ShieldUser),
                    UI.menuItem("company-staff", "员工管理", UserCircle),
                    UI.menuItem("company-constant", "数据码表", Binary),
                ]
            })
        }
        if(isAdminOr()){
            let adminOpts = [
                {
                    label:'用户管理', key:"account",
                    icon: UI.buildIcon2(UserCircle),
                    type:props.enableCollapsed?"":"group",
                    children:[
                        UI.menuItem("sys-account", "账户管理", ShieldCheck),
                        UI.menuItem("sys-staff", "用户/员工管理", UserCircle),
                        UI.menuItem("sys-role", "角色维护", Users),
                        UI.menuItem("sys-company", "企业维护", Building2),
                    ]
                },
                {
                    label: '数据维护',key:'data',
                    icon: UI.buildIcon2(Database),
                    type:props.enableCollapsed?"":"group",
                    children:[
                        UI.menuItem("sys-flow", "模板管理", LayoutTemplate),
                        UI.menuItem("sys-process", "流程数据维护", DatabaseZap),
                        UI.menuItem("sys-constant", "数据码表", Binary),
                        UI.menuItem("sys-page", "定制页面", AppWindow),
                        UI.menuItem("sys-cache", "系统缓存", Cookie)
                    ]
                },
                {
                    label: "系统管理", key:"system",
                    icon: UI.buildIcon2(Cog),
                    type:props.enableCollapsed?"":"group",
                    children:[
                        UI.menuItem("sys-dashboard", "系统状态", ChartArea),
                        UI.menuItem("sys-dbm", "数据维护（DBM）", Database),
                        UI.menuItem("sys-func", "动态函数", SquareFunction),
                        UI.menuItem("sys-ops-www", "更新前端资源", FolderArchive),
                        UI.menuItem("sys-log", "操作日志", Logs),
                    ]
                }
            ]
            opts.push(...adminOpts)
        }
        opts.push({
            label:"其他", key:"other",
            icon: UI.buildIcon2(Info),
            type:props.enableCollapsed?"":"group",
            children:[
                UI.menuItem("help-about", "关于", Info)
            ]
        })
        return opts
    })

    const changeRoute = ()=> {
        setTimeout(()=>{
            if(key.value != route.name){
                DEBUG && H.log.debug(`自动切换菜单选中`, route.name)
                key.value = route.name

                nextTick(()=>{
                    menu?.value.showOption(route.name)
                    let p = menu.value.$el?.parentNode?.parentNode
                    if(p){
                        //自动滚动到指定菜单
                        let item = p.querySelector(".n-menu-item-content--selected")
                        if(item){
                            let top = item.getBoundingClientRect().y-70
                            if(top>=300)
                                p.scrollTo({top, behavior: 'smooth'})
                        }
                    }
                })
            }
        }, 600)
    }

    watch(route, changeRoute)
    onMounted(changeRoute)
</script>
