<template>
    <div class="p-4 h-flex">
        <n-space>
            <Selector url="/system/company-list" style="width:240px" placeholder="筛选企业" v-model:value="form.EQ_cid" />
            <n-input v-model:value="form.LIKE_name" placeholder="账户名" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-input v-model:value="form.LIKE_phone" placeholder="联系电话" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />

        <n-modal v-model:show="editing" :style="{width:'640px'}" preset="card" title="创建账户" :mask-closable="false">
            <n-form :show-feedback="false" label-placement="left" label-width="90">
                <n-space vertical>
                    <n-alert type="info" :bordered="false" title="密码要求" show-icon>
                        <div v-for="(v, i) in pwdRules">{{i+1}}. {{v}}</div>
                    </n-alert>
                    <n-form-item label="登录账户" required> <n-input :input-props="{autocomplete:'username'}" v-model:value="bean.name"/> </n-form-item>
                    <n-form-item label="登录密码" required> <n-input :input-props="{autocomplete:'current-password'}" v-model:value="bean.pwd" type="password"/> </n-form-item>
                    <n-form-item label="是否生效"> <n-switch v-model:value="bean.active"/> </n-form-item>
                    <n-form-item label="来源类型">
                        <n-radio-group v-model:value="bean.type">
                            <n-radio v-for="item in Types" :value="item.value" :label="item.label"/>
                        </n-radio-group>
                    </n-form-item>
                    <n-form-item label="关联员工">
                        <StaffSelector v-model:value="bean.sid" company />
                    </n-form-item>
                </n-space>
            </n-form>

            <div class="text-right mt-3">
                <n-button type="primary" @click="editDo">确定并保存</n-button>
            </div>
        </n-modal>
    </div>
</template>

<script setup>
    import { NButton, NButtonGroup, NSwitch, NTag, NIcon, NInput, NSpace } from 'naive-ui'
    import { Search } from 'lucide-vue-next'

    import { Types } from '@S/Const'
    import { pwdRules, checkPwd } from '@S/Auth'

    import P from "@Pagination"
    import StaffSelector from "@CA/selector.staff.vue"
    import Selector from "@CA/selector.vue"
    import Account from "@S/Account"

    let { beans , form, pagination, refresh } = P({url:`/system/account-list`, form:{}})
    let editing = ref(false)
    let bean = ref({})

    const toEdit = row=>{
        bean.value = row?? {id:undefined}
        editing.value = true
    }

    const editDo = ()=>{
        let { name, active, type, sid } = bean.value
        if(!name)   return M.warn(`名称必须填写`)
        if(!sid)    return M.warn(`请先关联员工`)

        checkPwd(bean.value.pwd).then(pwd=>{
            RESULT("/system/account-add", {name, pwd, active, type, sid }, d=>{
                M.notice.ok(`账户信息已保存`)
                editing.value = false
                refresh()
            })
        })
    }
    const toDel = (row,i)=> M.confirm(`删除确认`, UI.html(`确认删除账户${UI.wrapHtml(row.name)}吗？`), ()=>{
        RESULT("/system/account-del", {id:row.id}, ()=>{
            M.ok(`账户已删除`)
            beans.value.splice(i, 1)
        })
    })

    let { columns, toSelectStaff, changePwd } = Account(false, { toEdit, toDel })
</script>
