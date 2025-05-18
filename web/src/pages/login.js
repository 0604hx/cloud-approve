const NAME = import.meta.env.PUBLIC_HEADER_TOKEN
const CREATED = `${NAME}_CREATED`

/**
 * 检查本地 token 是否在有效期内
 * @param {Number} expired - token 有效期，默认12小时，单位毫秒
 * @returns {Boolean} true 时为 token 有效
 */
export const checkLocalToken = (expired=12*60*60*1000)=>{
    let token = localStorage.getItem(NAME)
    if(!token)  return false

    let expire = localStorage.getItem(CREATED)||0
    if(Date.now() - expire>=expired)
        return false

    return true
}

/**
 *
 * @param {String} token
 */
export const saveLocalToken = token=>{
    localStorage.setItem(NAME, token)
    localStorage.setItem(CREATED, Date.now())
}
