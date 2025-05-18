<template>
    <n-data-table class="h-full" :columns="columns" :data="beans" :bordered="false" striped />
</template>

<script setup>
    import { Search, Plus } from 'lucide-vue-next'
    import { NButtonGroup, NButton } from 'naive-ui'
    import Uploader from "@C/uploader.vue"

    const props = defineProps({
        pid: {type:Number},
        disabled: {type:Boolean, default:false}
    })

    const columns = [
        { title:"文件名", key:"name" },
        { title:"文件大小", width:120, render:r=> H.filesize(r.size) },
        { title:"上传者", width:100, key:"sname" },
        { title:"备注", width:240, key:"summary" },
        { title:"日期", key:"addOn", width: 180, render: row=> H.date.datetime(row.addOn) },
        {
            width:80,align:"center",
            title:()=> h(
                Uploader,
                {
                    action:"/process-file-upload",
                    data: { pid: props.pid },
                    noticeOnOk:false,
                    onOk: uploadDone
                },
                ()=> UI.iconBtn(Plus, null, {disabled: props.disabled, type:"primary", title:"上传附件", secondary:true}),
            ),
            render: (r,i)=>h(NButtonGroup, {size:"small"}, ()=>[
                h(NButton, {secondary:true, onClick:()=>toDownload(r)}, ()=>"下载"),
                UI.popDel(`确定删除附件${UI.wrapHtml(r.name)}吗？`, ()=>toDel(r,i), h(NButton, {class:"error",disabled: canDel(r), secondary:true}, ()=>"删除")),
            ])
        }
    ]
    const beans = ref([])

    const toDownload = row=> DOWNLOAD("/process-file-download", {id: row.id})
    const canDel = row=> row.sid != window.User.id
    const toDel = (row,i)=>RESULT("/process-file-del", {id:row.id},d=> {
        M.ok(`附件已删除`)
        beans.value.splice(i, 1)
    })

    const uploadDone = d=> {
        beans.value.push(d.data)
        M.ok(`上传附件⌈${d.data.name}⌋`)
    }
    onMounted(() => RESULT("/process-files", props, d=> beans.value=d.data))
</script>
