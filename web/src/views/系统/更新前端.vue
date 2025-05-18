<template>
    <div class="p-4 h-flex">
        <n-alert title="前端资源更新" type="info" :bordered="false">
            <div>1、只允许上传当天新鲜热辣打包的 <Tag size="small">{{name}}</Tag> （无需做任何修改） </div>
            <div>2、上传成功后，自动进行解压操作（覆盖全部旧文件），故请 <Tag size="small">慎重操作</Tag> </div>
        </n-alert>

        <Uploader class="mt-3" accept=".zip" action="/system/ops-www" @ok="onOk" :noticeOnOk="false">
            <n-upload-dragger>
                <div>
                    <n-icon size="50" :component="ArrowUpFromLine" />
                </div>
                <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传 </n-text>
            </n-upload-dragger>
        </Uploader>

        <n-card class="mt-3 flex-1" size="small">
            <template #header>解压结果 <n-text class="ml-2 text-xs" depth="3" v-if="lines.length">共{{lines.length}}个文件/目录</n-text></template>
            <!-- <div v-html="lines" style="height:100%; overflow:auto"></div> -->
            <n-table size="small" :bordered="false" striped>
                <thead>
                    <tr>
                        <th>路径</th>
                        <th width="60">类型</th>
                        <th width="120">原始大小</th>
                        <th width="120">压缩后大小</th>
                        <th width="195">日期</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in lines">
                        <td><component :is='buildLine(item.name)' /></td>
                        <td>{{item.directory?"目录":"文件"}}</td>
                        <td>{{item.directory?"-":size(item.sizeOrigin)}}</td>
                        <td>{{item.directory?"-":size(item.sizeZip)}}</td>
                        <td>{{item.time}}</td>
                    </tr>
                </tbody>
            </n-table>
        </n-card>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import { ArrowUpFromLine } from 'lucide-vue-next'

    import Uploader from "@C/uploader.vue"

    const style = {color:'#9a9a9a'}
    const name = "www.zip"
    const lines = ref([])
    const size = v=> H.filesize(v)

    let onOk = d=>{
        lines.value = d.data
        M.ok(`资源文件导入成功`)
    }

    /**
     * @type {String} name
     */
    const buildLine = name=>{
        let i = name.lastIndexOf("/")
        if(i<=0 || i==name.length-1)
            return h('span', name)
        return h('span', [
            h('span', {style}, name.substring(0, i+1)),
            h('span', name.substring(i+1))
        ])
    }
</script>
