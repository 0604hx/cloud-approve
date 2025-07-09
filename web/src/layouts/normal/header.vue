<template>
    <n-layout-header bordered class="nav" :style :inverted>
        <n-text tag="div" class="ui-logo" :depth="1">
            <!-- <img src="./assets/images/naivelogo.svg"> -->
            <span :style="{color}">{{title}}</span>
            <span :style="{color, fontSize:'12px', margin:'12px 0 0 12px'}">{{version}}</span>
        </n-text>
        <div class="nav-menu">
            <n-menu mode="horizontal" :inverted :options="menuOptions" />
        </div>
        <div class="nav-end">
            <CreateProcess :size :color />
            <!-- <n-divider vertical :style="{ margin: '0px', backgroundColor:color }"/> -->
            <ToggleTheme :size :color />
            <ToggleNav :size :color />
            <ToggleColor :color />

            <n-button :color :size circle quaternary class="nav-picker"><template #icon><Github /></template></n-button>
            <!-- <n-divider vertical :style="{ margin: '0px', backgroundColor:color }" /> -->
            <n-dropdown trigger="click" @select="userMenuSelect" :options="userOptions" :show-arrow="true" style="padding: 8px;">
                <n-button :color :size circle quaternary class="nav-picker">
                    <template #icon><CircleUserRound /></template>
                </n-button>
            </n-dropdown>
        </div>
    </n-layout-header>
</template>

<script setup>
    import { Home, FileCode, CircleHelp,Info, LayoutGrid, LogOut, RotateCw, Github, Sun, Moon,LockKeyhole, CircleUserRound } from 'lucide-vue-next'
    import { NSpace, NText } from 'naive-ui'

    import ToggleTheme from '@CW/toggleTheme.vue'
    import ToggleColor from '@CW/toggleColor.vue'
    import ToggleNav from '@CW/toggleNav.vue'
    import CreateProcess from '@V/流程/Create.vue'
    import Tag from "@C/common/tag.vue"

    const router = useRouter()

    const props = defineProps({
        inverted:{type:Boolean, default:false},     //反转导航
    })

    const title = APP_TITLE
    const version = _VERSION_
    const style = computed(()=>({
        '--side-padding': '32px',
        'grid-template-columns':
        'calc(200px - var(--side-padding)) 1fr auto'
    }))
    const size = "large"

    const color = computed(()=> props.inverted?'#BBB':undefined)

    const menuOptions = [
        UI.menuItem("home", "首页", Home),
        UI.menuItem("help-about", "帮助", Info),
        { label:()=>h(NText, {depth:3, title:"归属企业"}, ()=>`${window.User?.cname||"未关联企业"}`), key:"cname" }
    ]
    const userOptions = [
        { type:"render", render:()=>h(NText,{class:"text-center w-full pl-3 pr-3 pt-2 pb-2"},()=>`Hi，${window.User?.name}！`)},
        { type: "divider"},
        { label: '修改密码', key:'pwd', icon:()=> UI.buildIcon(LockKeyhole)},
        { type: "divider"},
        { label: '重载界面',key: "reload", icon: ()=>UI.buildIcon(RotateCw)},
        { label: '退出平台',key: "quit", icon: ()=>UI.buildIcon(LogOut, {class:"error"})}
    ]

    const userMenuSelect = key=>{
        if(key == 'pwd')    router.push({name:"change-pwd"})
        else if(key == "reload") window.location.reload()
        else if(key == "quit"){
            M.confirm(`退出登录`, UI.html(`确定退出当前登录用户⌈ <b class="primary">${User.name}#${User.id}</b> ⌋吗？`), ()=>{
                localStorage.removeItem(import.meta.env.PUBLIC_HEADER_TOKEN)
                delete window.TOKEN

                router.push({name:"login"})
            })
        }
    }
</script>

<style scoped>
    .nav {
        display: grid;
        grid-template-rows: calc(var(--header-height) - 1px);
        align-items: center;
        padding: 0 var(--side-padding);
    }

    .ui-logo {
        display: flex;
        align-items: center;
        font-size: 22px;
    }

    .ui-logo>img {
        margin-right: 12px;
        height: 32px;
        width: 32px;
    }

    .nav-menu {
        padding-left: 36px;
    }

    .nav-picker {
        /* margin-right: 4px; */
    }

    .nav-picker.padded {
        padding: 0 10px;
    }

    /* .nav-picker:last-child {
        margin-right: 0;
    } */

    .nav-end {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
</style>
