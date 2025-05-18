<template>
    <n-flex vertical justify="space-between" :class="contentClass" size="small">
        <n-form label-placement="top" :disabled label-width="auto" :show-feedback="false">
            <n-space vertical>
                <n-form-item label="操作类型" required v-if="!simple">
                    <n-radio-group v-model:value="node.type" @update:value="onType">
                        <n-radio-button v-for="(item, key) in actions" :value="key" :label="item.label" />
                    </n-radio-group>
                </n-form-item>
                <n-form-item :label="textAction" required>
                    <n-select :placeholder="'请选择'+textAction" @update:value="onAction" :options="typeOptions" v-model:value="node.nextAction" />
                </n-form-item>
                <n-form-item v-show="!node.type || node.type=='deal'"  :label="textUser" required>
                    <SelectorStaff :disabled :placeholder="'请选择'+textUser" v-model:value="node.nextSId" @update:value="onSelect" />
                </n-form-item>
                <n-form-item :label="textSummary">
                    <n-space class="w-full" vertical size="small">
                        <n-input type="textarea" rows="5" v-model:value="node.summary" max="200" show-count />
                        <n-space size="small" v-if="!disabled">
                            常用意见:
                            <Tag size="small" class="cursor-pointer" v-for="item in defSummarys" @click="()=>node.summary=item">{{item}}</Tag>
                        </n-space>
                    </n-space>
                </n-form-item>
            </n-space>
        </n-form>
        <n-space justify="end">
            <n-button v-if="showClose" size="large" :disabled @click="onClose">取消</n-button>
            <n-button type="primary" :disabled size="large" @click="onSave">
                <template #icon><n-icon :component="Plane" /></template>
                {{ btnText }}
            </n-button>
        </n-space>
    </n-flex>
</template>

<script setup>
    import { Plane } from 'lucide-vue-next'

    import SelectorStaff from "@CA/selector.staff.vue"

    const props = defineProps({
        pid: {type:Number},                             //流程ID
        flowId: {type:Number},                          //模板ID
        simple:{type:Boolean, default:false},           //是否使用简单模式（通常是新建流程用）
        disabled:{type:Boolean, default: false},
        onClose:{type:Function},
        onDone: {type:Function},
        options: {type:[String, Array, Object], default:""},
        contentClass:{type:String, default:"h-full"},
        textUser:{type:String, default:"下一处理人"},
        textAction:{type:String, default:"下一步骤"},
        textSummary:{type:String, default:"意见说明"},
        textSubmit:{type:String, default:"提交"},
        showClose:{type:Boolean, default:false},
        btnText:{type:String, default:"提交流程"}
    })

    let actions = ref([])
    let defSummarys = (import.meta.env.PUBLIC_FLOW_SUMMARYS).split(",")
    let node = reactive({type:null, nextSId:null, summary:"", nextAction:null, nextSName:""})

    const typeOptions = computed(()=>UI.buildOptions(actions.value[node.type]?.items))

    const onSelect = (v, option)=> node.nextSName = option?.label
    const onSave = ()=>{
        if(!props.simple && !node.type)
            return M.warn(`请选择操作类型`)
        if(node.type=='deal' && !node.nextSId)
            return M.warn(`请选择${props.textUser}`)
        if(!node.nextAction)    return M.warn(`请选择${props.textAction}`)

        props.onDone(_raw(node))
    }

    const onType = (v,opt)=>node.nextAction=null
    const onAction = (v,opt)=>{
        if(opt.sid){
            node.nextSId = opt.sid
            node.nextSName = opt.sname
            M.info(`${UI.wrap(opt.label)}预设处理人：${opt.sname}`)
        }
    }

    const autoSelectAction = index=>{
        let act = typeOptions.value[index]
        if(act){
            node.nextAction = act.value
            onAction(null, act)
        }
    }

    const loadFlowCustom = ()=>RESULT("/flow/options", { id: props.flowId, pid:props.pid }, ({ data:opt })=>{
        if(typeof(actions.value.deal)=='object'){
            if(Array.isArray(opt.actions) && opt.actions.length){
                let customOpts = opt.actions.map(v=>({label:v.action, sid:v.sid, value:v.action, sname:v.sname}))
                actions.value.deal.items = customOpts

                //自动流程
                if(opt.auto==true){
                    node.type = 'deal'
                    //计算当前审批路径
                    autoSelectAction(opt.autoIndex || 0)
                }
            }
        }
    })

    onMounted(() => {
        RESULT("/common/actions", {}, d=>{
            // let acts = d.data
            // if(props.options && typeof(acts.deal)=='object'){
            //     const customOpts = typeof(props.options)=='object'? props.options : JSON.parse(props.options)
            //     if(Array.isArray(customOpts) && customOpts.length)
            //         acts.deal.items = customOpts.map(v=>({label:v.action, sid:v.sid, value:v.action, sname:v.sname}))
            // }
            actions.value = d.data
            loadFlowCustom()

            if(props.simple){
                nextTick(()=> node.type='deal')
            }
        })
    })
</script>
