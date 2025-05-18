<template>
    <div class="p-4 h-flex" v-if="inited">
        <div class="flex-1 h-flex">
            <n-alert show-icon type="info" title="数据维护（DBM）">
                通过执行<Tag size="small">原生SQL</Tag>对数据库进行管理，请慎用！！
                <n-button @click="help=true" type="primary" size="tiny" secondary>查看语法帮助</n-button>
            </n-alert>
            <CodeEditor class="flex-1 pt-3" placeholder="请输入SQL代码，按 CTRL+ENTER / CTRL+SHIFT+ENTER（多行） 执行（注意查询添加 LIMIT 以提高性能）" :keyBinds="[{key:'Ctrl-Enter'}]"
                @keyup="handleKeyUp" v-model:value="sql" language="sql"/>
            <div class="pt-3 text-center">
                <n-button type="primary" size="large" :loading @click="toRun">
                    <template #icon><Plane class="icon" /></template>
                    执行SQL
                </n-button>
            </div>
        </div>
        <n-card style="height: 320px;" class="mt-3" size="small">
            <template #header>执行结果 <n-text v-if="used>0" class="text-xs ml-2" depth="3">耗时{{used}}ms</n-text></template>
            <TableView ref="viewer" />
        </n-card>

        <n-drawer v-model:show="help" width="880">
            <n-drawer-content title="SQL常用命令" :closable="true" :body-content-style="{padding:'10px'}" :native-scrollbar="false">
                <Help />
            </n-drawer-content>
        </n-drawer>
    </div>
</template>

<script setup>
    import { sm4 } from 'sm-crypto'
    import { Plane} from 'lucide-vue-next'

    import CodeEditor from "@CODE"
    import TableView from "./table.vue"
    import Help from './help.vue'

    let key = ""
    let inited = ref(false)
    let sql = ref()
    let loading = ref(false)
    let used = ref(0)
    let viewer = ref()
    let help = ref(false)

    const handleKeyUp = ({ctrlKey, shiftKey, keyCode})=>{
        if(loading.value === true)  return M.warn(`上一个命令正在执行中`)

        if(ctrlKey==true && keyCode==13)
            toRun()
    }

    const toRun = ()=>{
        if(!H.hasText(sql.value))   return M.warn(`请输入 SQL 语句`)

        let started = Date.now()
        RESULT("/system/dbm-run",{text: sm4.encrypt(sql.value, key)},d=>{
            used.value = Date.now()-started
            viewer.value.update(d.data)
            console.debug("耗时", used)
        },{loading})
    }

    onMounted(() => {
        RESULT("/system/dbm-secret", {}, d=> {
            key = d.data
            inited.value = true
        })
    })
</script>
