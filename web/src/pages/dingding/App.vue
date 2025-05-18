<template>
    <div style="width: 80%; margin: 40px auto;">
        <div class="text-center" v-if="!errMsg">
            <n-spin :show="working">
                <template #description>
                    钉钉客户端登录中，请稍候...
                </template>
            </n-spin>
        </div>
        <n-alert v-else :type show-icon title="钉钉自动登录失败" :bordered="false">
            {{ errMsg }}
        </n-alert>
    </div>
</template>

<script setup>
    import { NSpin, NAlert, useMessage, NMessageProvider } from 'naive-ui'

    import { requestAuth } from "./dingding"
    import { checkLocalToken, saveLocalToken } from "../login"

    const msg = useMessage()

    let cid = undefined
    let corpId = undefined

    const debug = import.meta.env.DEV;
    let working = ref(true)
    let errMsg = ref("")
    let type = ref("info")

    const onMsg = (msg, isError=true)=>{
        errMsg.value = msg
        type.value = isError?"error":"info"
    }

    const tryToAutoLogin = ()=>{
        requestAuth(corpId)
            .then(code=>{
                msg.info(`CODE=${code}`)
                fetch(
                    "/common/login-with-dingding",
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ cid, code })
                    }
                )
                    .then(response => response.json())
                    .then(({ success, data, message }) => {
                        if(success==true){
                            msg.success(`登陆成功`)

                            saveLocalToken(data)
                            gotoIndex()
                        }
                        else{
                            const messages = {
                                E01 : "您的钉钉账户为首次登录，请先联系管理员完成激活",
                                E02 : "您的钉钉账户关联未激活，请联系企业管理员",
                                E03 : "找不到当前钉钉账户关联的员工"
                            }
                            onMsg(messages[message]||message, !messages[message])
                        }
                    })
            })
            .catch(e=>onMsg(typeof(e)=='string'?e:e.message))
    }

    const gotoIndex = ()=> location.href = "/"

    onMounted(() => {
        let u = new URL(location.href)
        cid = u.searchParams.get('cid')
        corpId = u.searchParams.get('corpId')

        if(checkLocalToken())
            return gotoIndex()

        tryToAutoLogin()
    })
</script>
