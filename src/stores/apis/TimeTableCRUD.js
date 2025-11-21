// @/stores/apis/TimeTableCRUD.js
import api from './axios.js'

/* ------------------------------ helpers ------------------------------ */
const ok   = (data) => ({ success: true, data })
const fail = (error) => ({ success: false, error })

function nx(err) {
  const res = err?.response
  const status = res?.status ?? null
  const data = res?.data
  const apiMsg = (data && (data.message || data.error || data.msg)) || null
  const axiosMsg = err?.message || 'Request failed'
  const msg = apiMsg || (status ? `HTTP ${status}: ${axiosMsg}` : axiosMsg)
  const url = (res?.config || err?.config)?.url || null
  return { status, message: msg, data, url }
}

/* -------------------------------- Slots ----------------------------------- */

async function getAllTimeSlotsPage(page = 1, params = {}) {
  return api.get(`/time_table/get_all_time_slots`, { params: { page, ...params } })
}

export async function getAllTimeSlots(params = null) {
  try {
    if (params && Object.keys(params).length) {
      const { data } = await api.get(`/time_table/get_all_time_slots`, { params })

      // Quiet empty results (server can send message + empty list)
      if (Array.isArray(data?.time_slots?.data) && data.time_slots.data.length === 0) {
        return ok({ slots: [], table: data?.time_table || null })
      }

      const container = data?.time_slots || {}
      const rows = Array.isArray(container.data) ? container.data : []
      const tableMeta = data?.time_table || data?.table_table || null
      return ok({ slots: rows, table: tableMeta })
    }

    // Unfiltered pagination (fallback)
    const first = await getAllTimeSlotsPage(1)
    const p = first.data?.time_slots || {}
    const rows = Array.isArray(p.data) ? p.data : []
    const last = Number(p.last_page || p.lastPage || 1)
    const all = [...rows]

    for (let i = 2; i <= Math.min(last, 50); i++) {
      const res = await getAllTimeSlotsPage(i)
      const seg = res.data?.time_slots?.data || []
      all.push(...seg)
    }
    return ok({ slots: all, table: null })
  } catch (error) {
    // Tolerate backend sending "No time slots available..." as an error
    const msg = String(error?.response?.data?.message || error?.message || '')
    if (/no time slots available/i.test(msg)) {
      const tableMeta = error?.response?.data?.time_table || null
      return ok({ slots: [], table: tableMeta })
    }
    return fail(nx(error))
  }
}

export async function createSlot(timeTableId, slotPayload) {
  try {
    const body = { slots: [slotPayload] }
    const { data } = await api.post(`/time_table/create_new_time_slot/${timeTableId}`, body)
    return ok(data)
  } catch (error) { return fail(nx(error)) }
}

export async function updateSlot(slotId, slotPayload) {
  try {
    const { data } = await api.put(`/time_table/update_time_slot/${slotId}`, slotPayload)
    return ok(data)
  } catch (error) { return fail(nx(error)) }
}

export async function removeSlots(timeTableId, slotIds) {
  try {
    const { data } = await api.post(`/time_table/remove_time_slots`, {
      time_table_id: timeTableId,
      slot_ids: slotIds
    })
    return ok(data)
  } catch (error) { return fail(nx(error)) }
}

/* ------------------------------ Time-tables -------------------------------- */

export async function listTimeTablesFiltered({ group_id = null, semester_id = null } = {}) {
  try {
    const params = {}
    if (group_id != null) params.group_id = group_id
    if (semester_id != null) params.semester_id = semester_id

    const items = []
    let url = `/time_table/get_all_time_table`
    let guard = 0

    let res = await api.get(url, { params })
    let j = res.data

    // Normalize “No time tables found …” to empty list
    const pageItems = Array.isArray(j?.time_tables?.data) ? j.time_tables.data : []
    items.push(...pageItems.map(t => ({
      id: t.id, name: t.name, description: t.description || '', group_id: t.group_id ?? null
    })))
    let next = j?.time_tables?.next_page_url || null

    while (next && guard < 50) {
      res = await api.get(next)
      j = res.data
      const page = Array.isArray(j?.time_tables?.data) ? j.time_tables.data : []
      items.push(...page.map(t => ({
        id: t.id, name: t.name, description: t.description || '', group_id: t.group_id ?? null
      })))
      next = j?.time_tables?.next_page_url || null
      guard++
    }

    return ok(items)
  } catch (error) {
    if (/no time tables found/i.test(error?.response?.data?.message || '')) return ok([])
    return fail(nx(error))
  }
}

export async function createTimeTable({ name, description, group_id }) {
  try {
    const { data } = await api.post(`/time_table/create_new_time_table`, { name, description, group_id })
    return ok(data)
  } catch (error) { return fail(nx(error)) }
}

export async function deleteTimeTable(tableId) {
  try {
    const { data } = await api.delete(`/time_table/remove_time_table/${tableId}`)
    return ok(data)
  } catch (error) { return fail(nx(error)) }
}

/* --------------------------- Reference lists ------------------------------- */

export async function listPrograms() {
  try {
    const { data } = await api.get(`/managements/get_all_program`)
    const list = Array.isArray(data?.programs) ? data.programs : []
    return ok(list.map(p => ({
      id: p.id,
      name: p.program_name,
      department_id: p.department_id ?? null
    })))
  } catch (error) { return fail(nx(error)) }
}

export async function listSemestersByProgram(programId) {
  try {
    const { data } = await api.get(`/managements/get_semesters_by_program/${programId}`)
    const list = Array.isArray(data?.semesters) ? data.semesters : []
    return ok(list.map(s => ({
      id: s.id,
      name: s.semester_key || `Semester ${s.semester_number}`,
      number: s.semester_number,
      program_id: s.program_id ?? null,
      academic_year_id: s.academic_year_id ?? null,
      year_label: s.academic_year?.year_label ?? null,
    })))
  } catch (error) { return fail(nx(error)) }
}

export async function listGroups() {
  try {
    const { data } = await api.get(`/groups/get_all_groups`)
    const list = Array.isArray(data?.groups?.data) ? data.groups.data : []
    return ok(list.map(g => ({
      id: g.id,
      name: g.name,
      department_id: g.department_id ?? null,
      semester_id: g.semester_id ?? null,
      description: g.description || ''
    })))
  } catch (error) { return fail(nx(error)) }
}

export async function listStaff() {
  try {
    const { data } = await api.get(`/users/get_all_users`, { params: { role: 'Staff' } })
    const list = Array.isArray(data?.users?.data) ? data.users.data : []
    const staff = list
      .filter(u => (u.roles || []).some(r =>
        (r.role_key === 'Staff') && (String(r.name).toLowerCase() === 'teacher')
      ))
      .map(u => ({ id: u.id, name: u.name }))
      .sort((a,b)=> a.name.localeCompare(b.name))
    return ok(staff)
  } catch (error) { return fail(nx(error)) }
}

export async function listRooms() {
  try {
    const { data } = await api.get(`/locations/get_all_locations`)
    const list = Array.isArray(data?.locations?.data) ? data.locations.data : []
    return ok(list.map(l => ({ id: l.id, name: l.name })).sort((a,b)=> a.name.localeCompare(b.name)))
  } catch (error) { return fail(nx(error)) }
}

/* ------------------------------- Utilities -------------------------------- */

export function eventToSlot(ev, subjectId = 1) {
  const sH = String(ev.start.getHours()).padStart(2,'0')
  const sM = String(ev.start.getMinutes()).padStart(2,'0')
  const eH = String(ev.end.getHours()).padStart(2,'0')
  const eM = String(ev.end.getMinutes()).padStart(2,'0')

  const dayName = (date) => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()]

  const toYMD = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth()+1).padStart(2,'0')
    const d = String(date.getDate()).padStart(2,'0')
    return `${y}-${m}-${d}`
  }

  return {
    day_of_week   : dayName(ev.start),
    teacher_id    : ev.teacherId ?? 0,
    subject_id    : subjectId,
    location_id   : ev.roomId ?? 1,
    remark        : ev.title || 'Untitled',
    time_slot_date: toYMD(ev.start),
    time_slot     : { start_time: `${sH}:${sM}:00`, end_time: `${eH}:${eM}:00` }
  }
}
