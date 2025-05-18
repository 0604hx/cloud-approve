<template>
    <div class="flex-center login-container">
        <n-card size="large" embedded bordered :style>
            <div style="height: 100%;">
                <n-grid cols="24" item-responsive responsive="screen" x-gap="12">
                    <n-gi span="0 m:0 l:12">
                        <div class="flex-center">
                            <img style="width:80%; object-fit: cover;" :src />
                        </div>
                    </n-gi>
                    <n-gi span="24 m:24 l:12">
                        <n-space vertical :size>
                            <n-h1>{{ title }}</n-h1>
                            <n-text depth="3">请输入您的账号和密码登录</n-text>
                            <n-form-item label="账户/手机号" :showFeedback>
                                <n-input :size v-model:value="bean.name" placeholder="请输入登陆账户">
                                    <template #prefix><n-icon><UserRound /></n-icon></template>
                                </n-input>
                            </n-form-item>
                            <n-form-item label="密码" :showFeedback>
                                <n-input :size v-model:value="bean.pwd" type="password" placeholder="请输入密码">
                                    <template #prefix><n-icon><Lock /></n-icon></template>
                                </n-input>
                            </n-form-item>
                            <n-form-item label="验证码" :showFeedback>
                                <n-input :size v-model:value="bean.code" placeholder="请输入验证码" @keyup="e=>e.keyCode==13 && toLogin()">
                                    <template #prefix><n-icon><Image /></n-icon></template>
                                    <template #suffix>
                                        <n-tooltip>
                                            <template #trigger>
                                                <div @click="refreshCaptcha" class="cursor-pointer captcha" v-html="captchaSvg"></div>
                                            </template>
                                            点击可刷新验证码
                                        </n-tooltip>
                                        <!-- <img style="width:200px" :src="captchaUrl" /> -->
                                    </template>
                                </n-input>
                            </n-form-item>
                            <n-button type="primary" size="large" block @click="toLogin" :loading>登录</n-button>
                            <n-text depth="3">忘记密码？请联系管理员重置</n-text>
                        </n-space>
                    </n-gi>
                </n-grid>
            </div>
        </n-card>
    </div>
</template>

<script setup>
    import { UserRound, Lock, Image } from 'lucide-vue-next'
    const title = APP_TITLE

    const route = useRoute()
    const router= useRouter()
    const baseUrl = BASE_URL

    const uuid = btoa(Math.random())
    const showFeedback = false
    const size = "large"
    const style = {width:"90%", maxWidth:"1180px", height:"80%", maxHeight:"500px", marginTop:"120px"}
    const src = computed(()=> `${baseUrl}img/login-bg-${Math.ceil(Math.random()*5)}.svg`)

    let redirect = import.meta.env.PUBLIC_DEFAULT_ROUTE

    let loading = ref(false)
    const bean = reactive({name:"", pwd:"", code:"", uuid})
    let captchaSvg = ref()

    const refreshCaptcha = (tip=true)=> GET("/common/captcha", {uuid, timestamp:Date.now()}, d=>{
        captchaSvg.value = d
        tip && M.info(`验证码已刷新`)
        bean.code = ""
    })
    const toLogin = ()=> H.checkValue(bean, {name:"账户", pwd:"密码", code:"验证码"}).then(()=>{
        RESULT(
            "/common/login-with-p",
            {name: bean.name, pwd:btoa(bean.pwd), code:bean.code, uuid:bean.uuid},
            d=>{
                //保存token
                localStorage.setItem(import.meta.env.PUBLIC_HEADER_TOKEN, d.data)
                E.emit("login.done")
                //跳转到指定页面
                router.replace(redirect)
            },
            {
                loading,
                fail: res=>{
                    if(res.message)
                        M.notice.error(res.message, `登录失败`)
                    else{
                        M.error(`账户或者密码不正确`)
                        bean.pwd = ""
                    }
                    refreshCaptcha(false)
                    return true
                }
            }
        )
    })
    onMounted(() => {
        refreshCaptcha(false)

        if(!!route.query.from){
            redirect = route.query.from
            // M.warn(`请先登录`)
        }
    })
</script>

<style scoped>
    .flex-center {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
