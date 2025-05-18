const { Knex } = require("knex")
const { Constant, Account, Staff, Process, ProcessNode, ProcessData, Flow, Company, getKnex, FileItem, Role, RoleLink, Func, Relation, OpLog, Page } = require("../")
const logger = require("../../common/logger")
const { CID, NAME, SUMMARY, ID, VALUE, ACTIVE, TYPE, ADD_ON, SID, TITLE, STATUS, PID, FID, LAST_ON, EXPIRE, ACTION, NEXT_ACTION, OPTIONS, SIZE, PATH, ROLE, CODE, LAUNCH, ORIGIN, TARGET, FORMAT, ABOUT, CONTENT, PHONE, PERSONAL, AUTH } = require("../../fields")
const { ProcessLog } = require("../Process")

/**
 * @callback BuilderFunction
 * @param {Knex.CreateTableBuilder} table
 *
 * @typedef {Object.<string, BuilderFunction>} Tables
 */

/**
 * @type {Tables}
 */
const tables = {
    [Constant.tableName]    : table=>{
        table.integer(ID).primary()
        table.integer(CID).index()
        table.string(NAME)
        table.string(TYPE)
        table.string(VALUE)
    },
    [Account.tableName]     : table=>{
        table.increments(ID).primary()
        table.string(NAME).notNullable()
        table.string("pwd")
        table.boolean(ACTIVE).defaultTo(true)
        table.string(TYPE)
        table.integer(SID)
        table.integer(CID)
        table.bigint(ADD_ON)
    },
    [Staff.tableName]       : table=>{
        table.increments(ID).primary()
        table.integer(CID)
        table.string(NAME)
        table.string(PHONE)
        table.string(SUMMARY)
        table.bigint(ADD_ON)
    },
    [Company.tableName]     : table=>{
        table.increments(ID).primary()
        table.string(NAME)
        table.string(SUMMARY)
        table.bigint(EXPIRE)
        table.bigint(ADD_ON)
    },
    // 流程
    [Process.tableName]     : table=>{
        table.increments(ID).primary()
        table.integer(SID).index()
        table.integer(CID).index()
        table.string(TITLE)
        table.string(SUMMARY)
        table.integer(STATUS).index()
        table.integer(FID)
        table.string("fName")
        table.integer("curSId").index()
        table.string("curSName")
        table.bigInteger(LAST_ON)
        table.bigint(ADD_ON)
    },
    [ProcessNode.tableName] : table=>{
        table.increments(ID).primary()
        table.integer(PID).index()
        table.integer(SID)
        table.string("sname")
        table.integer("nextSId")
        table.string("nextSName")
        table.string(TYPE)
        table.string(ACTION)
        table.string(NEXT_ACTION)
        table.string(SUMMARY)
        table.bigint(ADD_ON)
    },
    [ProcessData.tableName] : table=>{
        table.increments(ID).primary()
        table.integer(SID).index()
        table.integer(PID).index()
        table.boolean(ACTIVE).index()
        table.integer(FID).index()
        table.text(VALUE)
        table.bigint(ADD_ON)
    },
    [ProcessLog.tableName]: table=>{
        table.increments(ID).primary()
        table.integer(PID).index()
        table.integer(SID)
        table.string("sname")
        table.string(VALUE)
        table.bigint(ADD_ON)
    },
    [FileItem.tableName] : table=>{
        table.increments(ID).primary()
        table.integer(PID).index()
        table.integer(SID)
        table.string("sname")
        table.integer(CID)
        table.string(NAME)
        table.integer(SIZE)
        table.string(PATH)
        table.string("ext")
        table.string(SUMMARY)
        table.bigint(ADD_ON)
    },
    //流程模版
    [Flow.tableName] : table=>{
        table.increments(ID).primary()
        table.integer(CID).index()
        table.string(NAME)
        table.text(VALUE)
        table.string(OPTIONS)
        table.string(SUMMARY)
        table.bigint(ADD_ON)
    },
    [Page.tableName] : table=>{
        table.increments(ID).primary()
        table.integer(FID).index()
        table.string(NAME)
        table.string(FORMAT)
        table.boolean(PERSONAL)
        table.string(AUTH)
        table.string(ABOUT)
        table.text(CONTENT)
        table.string(SUMMARY)
        table.bigint(ADD_ON)
    },
    [Func.tableName] : table=>{
        table.increments(ID).primary()
        table.integer(SID)
        table.string(NAME)
        table.text(CODE)
        table.string(SUMMARY)
        table.integer(LAUNCH)
        table.bigint(ADD_ON)
    },
    //系统相关
    [Role.tableName]    : table=>{
        table.string(ID).primary()
        table.integer(CID)
        table.string(NAME)
        table.string(SUMMARY)
        table.bigint(ADD_ON)
    },
    [RoleLink.tableName] : table=>{
        table.integer(ID).primary()
        table.string(ROLE)
    },
    [Relation.tableName] : table=>{
        table.increments(ID).primary()
        table.string(ORIGIN)
        table.integer(TARGET)
        table.string(TYPE)
        table.bigint(ADD_ON)
    },
    [OpLog.tableName] : table=>{
        table.increments(ID).primary()
        table.integer(SID)
        table.integer(CID).index()
        table.string("mod")
        table.string(SUMMARY)
        table.bigint(ADD_ON)
    }
}

/**
 * 初始化数据表
 */
exports.createTableIfNotExist =  async (knex=getKnex())=>{
    const names = Object.keys(tables)
    logger.info(`即将初始化数据库：`, names.join(","))

    const timing = Date.now()
    let created = 0
    for (let i = 0; i < names.length; i++) {
        const name = names[i]
        if(await knex.schema.hasTable(name)){
            logger.info(`表 ${name} 已经存在...`)
            continue
        }

        await knex.schema.createTable(name, tables[name])
        logger.info(`创建新表 ${name} :)`)
        created ++
    }

    logger.info(`初始化完成，共处理 ${names.length} 个表，建表 ${created} 个（耗时${(Date.now()-timing)} ms） :)`)
}

exports.runSQL = async (sql, ...params)=>{
    let knex = getKnex()
    return await knex.raw(sql)
}
