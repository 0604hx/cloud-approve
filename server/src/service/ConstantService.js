const { assert } = require("../common")
const { Constant } = require("../db")
const ConstantBean = require("../db/Constant")
const StaffBean = require('../db/Staff')
const { ID } = require("../fields")
const { opLog } = require("./SystemService")

/**
 * 转换格式
 * @param {ConstantBean} bean
 * @returns {*}
 */
const parseValue = bean=>{
    const { value, type } = bean
    if(value == null || type == Constant.TEXT)
        return value
    if(type == Constant.NUMBER)     return isNaN(value)?null:parseInt(value)
    if(type == Constant.BOOL)       return /^(true|1)$/i.test(value)
    if(type == Constant.LIST){
        if(!value.trim())   return []
        return value.split("\n").map(v=>v.trim())
    }
    if(type == Constant.JSON)       return JSON.parse(value)
}

module.exports = {
    /**
     * 返回企业信息
     * @param {String} cid
     * @param {String} name - 默认加载配置信息
     * @returns {Object}
     */
    loadWithCidAndName : async (cid, name="config")=>{
        let q = Constant.query()
        q.where({ cid })
        if(!!name)
            q.andWhere({ name })
        q.first()

        let row = await q
        if(!row)
            return null
        return parseValue(row)
    },

    /**
     * 通过 ids 获取企业内部的常量值
     * @param {Array<Number>} ids
     */
    byIdsWithinCompany : async (cid, ids)=>{
        let q = Constant.query()
        let isSingle = !Array.isArray(ids)

        if(isSingle)
            q.where(ID, ids)
        else
            q.whereIn(ID, ids)
        if(cid != null) q.where({cid})

        let list = await q

        if(isSingle){
            let c = list[0]
            return c?{ id:c.id, value: parseValue(c), type:c.type, name:c.name }:null
        }
        else{
            let result = []
            for(let i=0;i<ids.length;i++){
                let c = list.find(v=>v.id==ids[i])
                try{
                    result.push(c?parseValue(c):null)
                }
                catch(e){
                    throw `解析常量${ids[i]}出错：${e.message}`
                }
            }
            return result
        }
    },

    /**
     *
     * @param {ConstantBean} bean
     * @param {StaffBean} operator
     * @param {Boolean} lockCompany
     */
    createOrUpdate : async (bean, operator, lockCompany=true)=>{
        assert.hasText(bean.name, "名称不能为空")
        if(!bean.type)  bean.type = Constant.TEXT

        if(bean.id){
            let old = await Constant.query().findById(bean.id)
            if(!old)    `常量#${bean.id}不存在`
            if(lockCompany && bean.cid != old.cid)
                throw `常量的归属企业（${old.cid}）不可变更`

            old.name = bean.name
            old.value = bean.value
            old.type = bean.type
            old.cid = bean.cid
            await Constant.updateById(old)

            opLog(operator, `更新常量 ${old.name}/${old.type}（CID=${bean.cid}）`, Constant.tableName)
        }
        else{
            if(lockCompany) bean.cid = operator.cid
            await Constant.query().insert(bean)
            opLog(operator, `新增常量 ${bean.name}/${bean.type}`, Constant.tableName)
        }
    },

    /**
     *
     * @param {Number} id
     * @param {StaffBean} operator
     * @param {Boolean} lockCompany
     */
    del : async (id, operator, lockCompany = true)=>{
        if(lockCompany)
            await Constant.query().where({id, cid: operator.cid}).delete()
        else
            await Constant.query().deleteById(id)

        opLog(operator, `删除常量#${id}`, Constant.tableName)
    }
}
