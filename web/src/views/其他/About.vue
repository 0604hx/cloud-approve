<template>
    <div class="p-4">
        <n-card>
            <template #header><Info class="icon theme" /> 关于</template>
            <n-space vertical>
                <div>欢迎使用{{ name }}，如有疑问，请联系<Tag :size>管理员</Tag>。</div>
                <div>
                    <Tag :size>{{ name }}（cloud approve）</Tag>，一款专为小微企业打造，支持多租户的在线审批神器。
                    它简化了申请和审批流程，让您随时随地通过手机或电脑完成请款操作。
                    员工一键提交申请，审批者即时响应，方便快捷。同时，云请款提供全面的数据记录与分析，助力企业实现财务管理透明化、智能化，安全高效，
                    让财务管理变得简单轻松！
                </div>
                <div>最后，重要的事情说三遍：<b>开源、开源、所有代码开源</b>😄。</div>
                <div>在线文档：<a class="primary" style="text-decoration: underline;" href='https://m5pzztm72e.feishu.cn/wiki/HAhXwQmPRi5SUxkMknJcGhnpntT' target="_blank">飞书文档</a></div>
            </n-space>
        </n-card>
    </div>
</template>

<script setup>
    import { Info } from 'lucide-vue-next'

    const size = "small"
    const name = APP_TITLE
</script>
