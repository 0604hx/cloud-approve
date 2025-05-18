/**
 * 系统预设内容
 */

const { Role } = require("..");
const { Roles, RoleNames } = require("../../fields");

const presetRoles = ()=> [
    Role.of(Roles.ADMIN, 0, RoleNames[Roles.ADMIN], "具备最高的管理权限"),
    Role.of(Roles.COMPANY_ADMIN, 0, RoleNames[Roles.COMPANY_ADMIN], "能够管理归属企业的相关内容"),
    Role.of(Roles.DATA_MANAGER, 0, RoleNames[Roles.DATA_MANAGER], "数据相关管理员")
]

module.exports = { presetRoles }
