<template>
    <n-table size="small" :bordered="false">
        <tr v-for="(item, index) in bean">
            <th width="150">{{index}}</th>
            <td @dblclick="showDetail(index, item)">{{item}}</td>
        </tr>
    </n-table>
</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({
        bean:{type:Object}
    })

    const showDetail = (index,key)=> M.showData(`${props.bean[index]}`, { title:`字段⌈${index}⌋的详细内容`, pre:true})
</script>
