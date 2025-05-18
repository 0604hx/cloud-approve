/**
 * @typedef {Object} ServerConfig
 * @property {Number} port - 服务端口，默认10001
 * @property {Boolean} cors - 是否允许 CORS，开发模式下默认允许
 * @property {String} dataDir - 附件目录
 * @property {String} wwwDir - 静态资源目录
 * @property {String} wwwPrefix - 静态资源访问前缀
 * @property {DBConfig} db
 * @property {SecretConfig} secret
 * @property {HttpConfig} http
 *
 * @typedef {Object} DBConfig
 * @property {String} prefix - 表名前缀，默认为空
 * @property {String} type - 类型：mysql，sqlite3
 * @property {String} host - 数据库主机地址
 * @property {Number} port - 数据库端口
 * @property {String} user
 * @property {String} database
 * @property {String} password
 * @property {String} charset - 字符集，默认 utf8
 * @property {String} file - 数据库文件（针对 sqlite3）
 * @property {String} uri - 链接串
 *
 * @typedef {Object} SecretConfig
 * @property {Boolean} autoInit - 是否自动创建管理员账户及员工
 * @property {String} adminAccount - 管理员账户名
 * @property {Number} pwdRetryMax - 单位时间内密码重试次数，默认3
 * @property {String} sm4Key - SM4密钥（通常用于存储密码）
 * @property {String} jwtKey - JWT 密钥
 * @property {String} jwtExpire - JWT 有效期限，默认12h（12小时）
 * @property {String} header - 携带 TOKEN 的请求头名称，默认为 CUA
 *
 * @typedef {Object} HttpConfig
 * @property {Number} commonExpire - common 资源缓存时长，单位ms
 *
 * @typedef {Object} FuncConfig
 * @property {Boolean} enable - 是否开启动态函数
 * @property {Boolean} isolated - 是否使用隔离环境
 *
 * @typedef {Object} SysConfig
 * @property {Boolean} log - 是否记录操作日志
 * @property {Number} logMax - 日志存活天数（默认365天）
 *
 * @typedef {Object} ImgConfig
 * @property {Boolean} toWebp - 是否转换为 webp
 * @property {Array<String>} exts
 * @property {Number} quality - 质量
 */


/**
 * @typedef {Object} Account - 账户信息
 * @property {Number} id
 * @property {String} name
 * @property {String} pwd
 * @property {Boolean} active
 *
 * @typedef {Object} Constant
 * @property {String} id
 * @property {String} value
 */

/**
 * @typedef {Object} Pagination - 分页数据
 * @property {Number} page - 当前分页
 * @property {Number} pageSize - 每页数据量
 * @property {Array<String>} columns - 查询的字段
 */

/**
 * @typedef {Object} PageResult - 分页查询结果
 * @property {Array} results - 结果
 * @property {Number} total - 总数
 */

/**
 * @typedef {Object} FlowOptions - 模板选项
 * @property {Array} actions - 预设流程
 * @property {String} titleTpl - 流程标题
 * @property {Boolean} auto - 自动化
 *
 * @typedef {Object} FlowAutoAction - 自动化节点
 * @property {Number} index - 序号
 * @property {String} action - 步骤
 * @property {String} sid - 用户编号
 */

/**
 * @typedef {Object} CompanyConfig - 企业信息
 * @property {String} ddCorpId - 钉钉企业ID
 * @property {String} ddAppKey - 钉钉应用KEY
 * @property {String} ddAppSecret - 钉钉应用AppSecret
 * @property {Boolean} ddAutoCreate - 自动创建员工
 */
