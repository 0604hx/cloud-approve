<template>
    <n-data-table v-if="ok" :columns="columns" class="db-table-view" :data="rows" :style="{height}" :bordered="false" striped size="small"
        :scroll-x="scrollX" flex-height :row-props="rowProps" />
</template>

<script setup>
    import { ref, nextTick, h } from 'vue'

    import TableExpand from "./table-expand.vue"

    const emits = defineEmits(["edit"])
    const props = defineProps({
        height: {type:[Number, String], default:"100%"},
    })
    const resizable = true
    const ellipsis  = true
    const width     = 80

    let ok = ref(false)
    let scrollX = "100%"
    let columns = []
    let rows = []

    const rowProps = (row, index)=>({
        ondblclick: e=> emits("edit", row)
    })

    const empty = ()=>{
        columns = []
        rows = []
    }
    const update = (items) => {
        ok.value = false
        nextTick(()=> {
            if(items==null) {
                empty()
            }
            else if(Array.isArray(items)){
                let row = items[0]
                columns = Object.keys(row).map((key,i)=>({
                    title:key, key:i, resizable, ellipsis, width, className:"db-cell",
                    render: r=> r[key]
                }))
                if(columns.length>1){
                    //增加展开行
                    columns.unshift({
                        type: "expand",
                        width: 20,
                        renderExpand: bean => h(TableExpand, {bean}) // JSON.stringify(row)
                    })
                }
                items.forEach((v,i)=>v.key=v.key??i)
                rows = items
            }

            console.debug(rows, columns)
            ok.value = true
        })
    }

    defineExpose({ update })
</script>

<style scoped>
    .db-table-view {
        .db-cell {
            padding:2px !important;
        }
    }
</style>
