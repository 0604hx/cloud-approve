<template>
    <n-space vertical>
        <n-alert type="info" show-icon :bordered="false" title="请勾选需要分配的角色"></n-alert>
        <Selector v-if="inited" multiple url="/system/role-list" v-model:value="roles" :params
            :transfer="v=>({label:`${v.id} / ${v.name}`, value:v.id})"
        />
        <div class="text-center">
            <n-button type="primary" size="large" @click="toSave">确定</n-button>
        </div>
    </n-space>
</template>

<script setup>
    import Selector from "@CA/selector.vue"

    const props = defineProps({
        sid:Number,
        onClose :{type:Function}
    })

    const params = { pagination:{pageSize:200} }
    let roles = ref([])
    let inited = ref(false)

    const toSave = ()=> RESULT("/system/role-link-update", {id:props.sid, role:roles.value.join(",")}, d=>{
        M.notice.ok(`角色分配成功`)
        props.onClose && props.onClose()
    })

    onMounted(() => {
        RESULT("/system/role-link", {id:props.sid},d=>{
            if(d.data && d.data.role)
                roles.value = d.data.role.split(",")
            else
                roles.value = []

            inited.value = true
        })
    })
</script>
