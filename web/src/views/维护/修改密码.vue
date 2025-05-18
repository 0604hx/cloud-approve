<template>
    <div class="p-4">
        <n-card title="修改账户登录密码" style="max-width: 640px; margin: 0 auto;">
            <n-alert type="info" :bordered="false" title="密码要求" show-icon>
                <div v-for="(v, i) in pwdRules">{{i+1}}. {{v}}</div>
            </n-alert>

            <n-form class="mt-4" ref="formRef" :model="form" :rules="rules">
                <n-form-item label="旧密码" path="oldPwd">
                    <n-input v-model:value="form.oldPwd" type="password" placeholder="请输入旧密码" />
                </n-form-item>

                <n-form-item label="新密码" path="newPwd">
                    <n-input v-model:value="form.newPwd" type="password" placeholder="请输入新密码" />
                </n-form-item>

                <n-form-item label="确认新密码" path="confirmPwd">
                    <n-input v-model:value="form.confirmPwd" type="password" placeholder="请再次输入新密码" />
                </n-form-item>
            </n-form>
            <div class="text-center">
                <n-button size="large" type="primary" @click="toSave">修改密码</n-button>
            </div>
        </n-card>
    </div>
</template>

<script setup>
    import { pwdRules, checkPwd } from '@S/Auth'

    const form = ref({ oldPwd: '', newPwd: '', confirmPwd: '' })

    const rules = {
        oldPwd: [
            { required: true, message: '请输入旧密码', trigger: 'blur' },
        ],
        newPwd: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
        ],
        confirmPwd: [
            { required: true, message: '请确认新密码', trigger: 'blur' },
            {
                validator: (rule, value) => value === form.value.newPwd,
                message: '两次输入的密码不一致',
                trigger: 'blur',
            },
        ],
    };

    const formRef = ref(null)
    const reset = ()=>{
        form.value.oldPwd = ""
    }

    const toSave = () => {
        formRef.value?.validate((errors) => {
            if (!errors) {
                checkPwd(form.value.newPwd).then(pwd=>{
                    RESULT(
                        "/auth/change-p",
                        { oldPwd: btoa(form.value.oldPwd), pwd },
                        d=>{
                            M.notice.ok(`密码修改完成`)
                            reset()
                        },
                        { fail: reset }
                    )
                })
            } else {
                M.warn(`请检查表单内容`)
            }
        })
    }
</script>
