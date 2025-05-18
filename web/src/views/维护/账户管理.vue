<template>
    <div class="p-4 h-flex">
        <n-space>
            <n-input v-model:value="form.LIKE_name" placeholder="账户名" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-input v-model:value="form.LIKE_phone" placeholder="联系电话" @keyup="e=>e.keyCode==13 && refresh()" clearable />
            <n-button secondary circle type="primary" @click="refresh">
                <template #icon><n-icon :component="Search" /> </template>
            </n-button>
        </n-space>

        <n-data-table class="mt-4 flex-1" :columns="columns" :pagination="pagination" :loading="pagination.loading" :data="beans"
            :remote="true" :bordered="false" striped flex-height />
    </div>
</template>

<script setup>
    import { NButton, NButtonGroup, NSwitch, NTag, NIcon, NInput, NSpace } from 'naive-ui'
    import { Search } from 'lucide-vue-next'

    import { Types } from '@S/Const'
    import { pwdRules } from '@S/Auth'

    import P from "@Pagination"
    import StaffSelector from "@CA/selector.staff.vue"
    import Account from "@S/Account"

    let { beans , form, pagination, refresh } = P({url:`/company/account-list`, form:{}})

    let { columns } = Account()
</script>
