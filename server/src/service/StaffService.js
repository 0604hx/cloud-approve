const { Status } = require("../beans");
const { assert } = require("../common");
const { Staff, Process } = require("../db");
const StaffBean = require("../db/Staff");
const { ID, NAME } = require("../fields");
const { clearStaff } = require("./CacheService");
const { opLog } = require("./SystemService");

module.exports = {
    /**
     * 获取公司员工列表
     * @param {Number} cid
     * @param {Boolean} simple - 是否精简（只返回 id、name）
     */
    listByCompany: async (cid, simple=true)=>{
        return await (simple? Staff.query().where({cid}).columns(ID, NAME) : Staff.query().where({cid}))
    },

    /**
     * 新建或者修改员工信息
     * @param {StaffBean} bean - 员工对象
     * @param {StaffBean} operator - 操作人
     * @param {Boolean} lockCompany - 是否锁定公司
     */
    createOrUpdate : async (bean, operator, lockCompany=true)=>{
        assert.hasText(bean.name, "员工名称不能为空")
        assert.isTrue(bean.cid>0, "请选择归属公司")

        if(bean.id>0){
            let oldBean = await Staff.query().findById(bean.id)
            if(!oldBean)    throw `员工#${bean.id}不存在`
            if(lockCompany && oldBean.cid != bean.cid)
                throw `员工的归属企业（#${oldBean.cid}）不可变更`

            oldBean.name = bean.name
            oldBean.cid = bean.cid
            oldBean.summary = bean.summary
            await Staff.updateById(oldBean)
            opLog(operator, `修改员工#${bean.id} > ${bean.name} ${bean.summary}`, Staff.tableName)
        }
        else{
            if(lockCompany)
                bean.cid = operator.cid

            bean.addOn = Date.now()
            await Staff.query().insert(bean)
            opLog(operator, `新增员工：${bean.name} ${bean.summary}`, Staff.tableName)
        }

        clearStaff(bean.id)
    },

    /**
     *
     * @param {Number} id
     * @param {StaffBean} operator
     * @param {Boolean} lockCompany
     */
    del : async (id, operator, lockCompany = true)=>{
        if(id == operator.id)  throw `不能删除自己`
        if(id == 1)         throw `不能删除ID=1的员工信息`

        let processSize = await Process.count({sid: id, status: Status.WORKING})
        if(processSize>0)
            throw `该员工还有${processSize}个进行中的流程`

        if(lockCompany)
            await Staff.query().where({id, cid: operator.cid}).delete()
        else
            await Staff.query().deleteById(id)
        clearStaff(id)

        opLog(operator, `删除员工#${id}`, Staff.tableName)
    }
}
