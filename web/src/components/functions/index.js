import { useRouter } from 'vue-router'

export const openProcess = (row, blank=true)=>{
    let id = typeof(row) == 'object'?row.id:row
    H.openUrl(`#/process/${id}`, {title: row?.name, center:true, type:blank?"_blank":"" })
}
