<template>
    <n-card>
        <template #header><LayoutDashboard class="primary icon" style="margin-right: 8px;" size="20"/>流程速览</template>

        <n-grid cols="3 100:1 600:3" x-gap="16" y-gap="16">
            <!-- <n-gi>
                <n-card class="cursor-pointer" :embedded title="进行中" @click="jump('process-mine',{status:0})">
                    <template #header-extra><Rocket class="info"/></template>
                    <span class="text-6xl">
                        <n-number-animation :to="bean.working" />
                    </span>
                </n-card>
            </n-gi>
            <n-gi>
                <n-card class="cursor-pointer" :embedded title="待我审批" @click="jump('process-todo')">
                    <template #header-extra><ListTodo class="warning"/></template>
                    <span class="text-6xl">
                        <n-number-animation :to="bean.todo" />
                    </span>
                </n-card>
            </n-gi>
            <n-gi>
                <n-card class="cursor-pointer" :embedded title="已完成" @click="jump('process-mine',{status:1})">
                    <template #header-extra><CircleCheck class="success" /></template>
                    <span class="text-6xl">
                        <n-number-animation :to="bean.total" />
                    </span>
                </n-card>
            </n-gi> -->
            <n-gi>
                <n-alert title="进行中" :bordered :style class="cursor-pointer" @click="jump('process-mine',{status:0})">
                    <template #icon><Rocket class="primary"/></template>
                    <span class="text-5xl">
                        <n-number-animation :to="bean.working" />
                    </span>
                </n-alert>
            </n-gi>
            <n-gi>
                <n-alert title="待我审批" :bordered :style class="cursor-pointer" @click="jump('process-todo')">
                    <template #icon><ListTodo class="primary"/></template>
                    <span class="text-5xl">
                        <n-number-animation :to="bean.todo" />
                    </span>
                </n-alert>
            </n-gi>
            <n-gi>
                <n-alert title="已完成" :bordered :style class="cursor-pointer" @click="jump('process-mine',{status:1})">
                    <template #icon><CircleCheck class="primary" /></template>
                    <span class="text-5xl">
                        <n-number-animation :to="bean.total" />
                    </span>
                </n-alert>
            </n-gi>
        </n-grid>
    </n-card>
</template>

<script setup>
    import { CircleCheck, ListTodo, Rocket, LayoutDashboard } from 'lucide-vue-next'

    import { uiStore } from '@/store'

    const router = useRouter()
    const ui = uiStore()

    let embedded = false
    let bordered = false
    let bean = ref({})
    const style = computed(()=>({ background:`${ui.primaryColor}10` }))

    const jump = (name, query)=>{
        let r = router.resolve({name, query})
        router.push(r)
    }

    onMounted(() => RESULT("/dashboard/mine",{}, d=>{
        bean.value=d.data
        if(bean.value.todo>0){
            //显示对话框
            M.dialog({
                content: UI.html(`您有${UI.wrapHtml(bean.value.todo)}则流程待审批`),
                title:`温馨提醒`,
                showIcon: false,
                positiveText: "立即前往审批",
                onPositiveClick: ()=> jump('process-todo'),
                negativeText:"下次再说"
            })
        }
    }))
</script>
