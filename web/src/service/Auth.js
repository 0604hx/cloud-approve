export const ADMIN = "ADMIN"

export function checkRole(requireRole) {
    let roles = window.User ? (User.roles || []) : []
    return typeof (requireRole) === 'string' ? roles.includes(requireRole) : requireRole(roles)
}

export const hasAnyRole = (...items)=>{
    let roles = window.User ? (User.roles || []) : []
    return roles.some(r=> items.includes(r))
}

export const hasAllRole = (...items)=>{
    let roles = window.User ? (User.roles || []) : []
    return items.every(r=> roles.includes(r))
}

/**
 * 是否为管理员或者指定的角色
 * @param  {...String} items
 * @returns
 */
export const isAdminOr = (...items)=> hasAnyRole(ADMIN, ...items)

export const whoami = ()=> new Promise(ok=>{
    FETCH_JSON("/auth/whoami",{}, true).then(d=>{
        console.debug(d)
    })
})


export const pwdRules = [
    "长度不小于8位",
    "包含至少一个大写字母",
    "包含至少一个小写字母",
    "包含至少一个数字",
    "包含至少一个特殊字符（!@#$%^&*）"
]

/**
 * 检测密码是否符合要求
 * @param {String} pwd
 * @returns
 */
export const checkPwd = pwd=>new Promise(ok=>{
    if(!pwd)    return M.warn(`密码不能为空`)
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\.])[A-Za-z\d@$!%*?&\.]{8,}$/;

    if(!pwdRegex.test(pwd))
        return M.notice.warn(
            pwdRules.map((v,i)=>`${i+1}. ${v}`).join("\n"),
            `密码强度不够`
        )
    ok(btoa(btoa(pwd)))
})
