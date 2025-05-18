<template>
    <div class="p-4 h-full">
        <n-space>
            <n-input v-model:value="form.LIKE_title" placeholder="标题" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-select v-if="!todo" :options="Status" v-model:value="form.EQ_status" clearable placeholder="状态" style="width: 120px;"></n-select>
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans" :style="{height}"
            :remote="true" :bordered="false" striped flex-height />
    </div>
</template>

<script setup>
    import { NButton } from 'naive-ui'
    import { Search } from 'lucide-vue-next'

    import { Status } from '@S/Const'

    import Tag from "@C/common/tag.vue"
    import StatusPin from "@CA/status.vue"
    import P from "@Pagination"

    import History from "./交办记录.vue"

    const router = useRouter()
    const route = useRoute()

    const secondary = true
    const eventCreate = "process.create"
    const todo = route.name == 'process-todo'
    const EQ_status = route.query.status!=undefined?Number(route.query.status):undefined

    let height = "calc(100% - 50px)"
    let { beans , form, pagination, refresh } = P({url:`/process-${todo?"todo":"mine"}`, form:{SORT_id:1, EQ_status}})

    const columns= (()=>{
        let rows = [
            { title:"序号", width:60, align:"center", render:(row,i)=> i+1 },
            {
                title:"标题", key:"title",ellipsis:true,
                render: r=>h('span',{onClick:()=>open(r), class:"cursor-pointer"}, r.title)
            },
            { title:"状态", key:"status", width:80, render:r=>h(StatusPin, {code:r.status}) },
            { title:"模板", key:"fName", width:120, render:r=>h(Tag, {type:"default"}, ()=>r.fName)},
            { title:"当前处理人", key:"curSName", width:100 },
            { title:"最后交办时间", key:"lastOn", width: 180, render: r=> r.lastOn?H.date.datetime(r.lastOn):"" },
        ]
        if(todo)
            rows.push({ title:"发起人", key:"sname", width:100 })

        rows.push({ title:"发起日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) })
        rows.push({
            title:"操作", width:160,align:"center",
            render: (r,i)=>[
                h(NButton, { size:"small", type:"primary", secondary, class:"mr-1", onClick:()=>toHistory(r) }, ()=>"交办记录"),
                todo?
                    (
                        r._auto==true?
                            UI.popDel(
                                { text:`确定同意流程${UI.wrapHtml(r.title)}吗？`, type:"primary" },
                                ()=>toApprove(r, i),
                                ()=>h(NButton, { size:"small", type:"primary" }, ()=>"同意")
                            )
                            :
                            null
                    )
                    :
                    UI.popDel(
                        `确定删除流程${UI.wrapHtml(r.title)}吗？`,
                        ()=>toDel(r, i),
                        ()=>h(NButton, { size:"small", type:"error", secondary }, ()=>"删除")
                    )
            ]
        })
        return rows
    })()

    const open = row=> {
        let r = router.resolve({name:`process-view`, params:{id: row.id}})
        H.openUrl(r.href, {title: row.name, center:true })
    }

    const toDel = (row, i)=>RESULT("/process-del", {id:row.id},d=> {
        M.ok(`流程已删除`)
        beans.value.splice(i, 1)
    })

    const toApprove = (row, i)=> RESULT("/process-auto-approve", { id: row.id }, d=>{
        M.ok(`流程已同意`)
        beans.value.splice(i, 1)
    })

    const toHistory = row=>M.dialog({
        title: UI.html(`流程${UI.wrapHtml(row.title)}的交办记录`),
        showIcon:false,
        maskClosable:false,
        // transformOrigin:"center",
        style:{ width:"880px" },
        content:()=> h(History, { pid:row.id })
    })

    onMounted(() => E.on(eventCreate, refresh))
    onUnmounted(() => E.off(eventCreate, refresh))
</script>
