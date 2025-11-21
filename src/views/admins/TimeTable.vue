<!-- @/pages/TimeTable.vue -->
<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { ChevronDown } from 'lucide-vue-next' // ⟵ added for custom dropdown arrows
import { showNotification } from '@/lib/notifications'
import {
  getAllTimeSlots,
  createSlot, updateSlot, removeSlots,
  listPrograms, listGroups, listSemestersByProgram,
  listTimeTablesFiltered,
  createTimeTable as apiCreateTimeTable,
  deleteTimeTable as apiDeleteTimeTable,
  listStaff, listRooms,
  eventToSlot
} from '@/stores/apis/TimeTableCRUD'

/* --------------------------------- state --------------------------------- */
const allEvents = ref([])
const loading = ref(false)
const error = ref(null)

/* vue-cal ref to force the view */
const cal = ref(null)

/* keep current view’s week (Mon 00:00) */
const currentWeekStart = ref(startOfWeek(new Date()))
const initialDate = ref(new Date())

/* keep focus after any reload (edits/clone/creates) */
const desiredFocusDate = ref(null)

/* -------- grid: 05:00 → 17:00, widen only if needed -------- */
const BASE_FROM = 5 * 60
const BASE_TO   = 17 * 60
const timeFromM = ref(BASE_FROM)
const timeToM   = ref(BASE_TO)
const snapTo = 15

/* filters: Year -> Program -> Semester -> Group */
const yearOptions = ref([])
const yearLabel   = ref(null)

const programOptions = ref([])
const selectedProgramId = ref(null)

/* 🔻 Preloaded cache: program_id -> array of semesters */
const semestersByProgram = ref({})

/* 🔹 Weekday picker (create-only) */
const weekdayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
function weekdayIndexFromDate(d){ return (d.getDay() + 6) % 7 }
const editorWeekday = ref(0)
function moveDraftToWeekday(dayIdx){
  if (!draft.value) return
  const durationMs = +draft.value.end - +draft.value.start
  const s = new Date(currentWeekStart.value)
  s.setDate(s.getDate() + Number(dayIdx))
  s.setHours(draft.value.start.getHours(), draft.value.start.getMinutes(), 0, 0)
  const e = new Date(s.getTime() + Math.max(durationMs, MIN_MIN*60*1000))
  draft.value.start = s
  draft.value.end   = e
}

/* Semesters for the currently selected program (client-side, instant) */
const semesterOptions = computed(() =>
  selectedProgramId.value == null
    ? []
    : (semestersByProgram.value[selectedProgramId.value] || [])
)

const filterSemesterId = ref(null)

const allGroupOptions = ref([])
const groupOptions = computed(() =>
  filterSemesterId.value == null
    ? []
    : allGroupOptions.value.filter(g => g.semester_id === filterSemesterId.value)
)
const filterGroupId = ref(null)

/* staff/rooms */
const staffOptions = ref([])
const roomOptions  = ref([])

/* resolved time table (internal; no dropdown) */
const selectedTimeTableId = ref(null)
const programmaticTTChange = ref(false)

/* no-table banner/disable state */
const tableState = reactive({
  noTableForCriteria: false,
  canCreate: false,
  reason: '' // 'filters-incomplete' | 'no-group-available' | 'create-failed' | 'api'
})

const MIN_MIN = 50
const EXTRA_HOURS_AFTER_LAST = 2
const subjectId = 1

/* -------------------------------- helpers -------------------------------- */
function minutesOf(d){ return d.getHours() * 60 + d.getMinutes() }
function ensureMinDuration(start, end){
  if ((+end - +start)/60000 < MIN_MIN){
    const e = new Date(start); e.setMinutes(e.getMinutes() + MIN_MIN); return e
  }
  return end
}
function parseHHMMSS(t){ const [hh,mm]=(t||'').split(':').map(x=>parseInt(x||'0',10)); return { h:hh||0, m:mm||0 } }
function parseAPIDate(d){
  const [a,b,c] = (d||'').split('-').map(x=>parseInt(x||'0',10))
  if ((d||'').length>=10 && String(a).length===4) return { y:a||1970, m:b||1, d:c||1 }
  return { y:c||1970, m:b||1, d:a||1 }
}
function slotToDates(dateStr, startTime, endTime){
  const { y, m, d } = parseAPIDate(dateStr)
  const { h:sh, m:sm } = parseHHMMSS(startTime)
  const { h:eh, m:em } = parseHHMMSS(endTime)
  return { start:new Date(y, m-1, d, sh, sm, 0, 0), end:new Date(y, m-1, d, eh, em, 0, 0) }
}

/* calendar window */
function widenCalendarWindow(evts){
  if (!evts.length){ timeFromM.value = BASE_FROM; timeToM.value = BASE_TO; return }
  let minM = 24 * 60, maxM = 0
  for (const e of evts){ minM = Math.min(minM, minutesOf(e.start)); maxM = Math.max(maxM, minutesOf(e.end)) }
  const suggestedFrom = Math.max(0, Math.floor(minM / 60 - 1) * 60)
  const suggestedTo   = Math.min(24*60, Math.ceil(maxM / 60 + EXTRA_HOURS_AFTER_LAST) * 60)
  timeFromM.value = Math.min(BASE_FROM, suggestedFrom)
  timeToM.value   = Math.max(BASE_TO, suggestedTo)
}
async function forceLayout(){ await nextTick(); window.dispatchEvent(new Event('resize')) }

/* event builder */
function buildEventsFromSlots(slots){
  const tMap = new Map(staffOptions.value.map(s => [Number(s.id), s.name]))
  const rMap = new Map(roomOptions.value.map(r => [Number(r.id), r.name]))

  return slots.map(s=>{
    let start_time = '08:00:00', end_time = '09:00:00'
    try{ const j = JSON.parse(s.time_slot||'{}'); start_time = j.start_time || start_time; end_time   = j.end_time   || end_time }catch{}
    const { start, end } = slotToDates(s.time_slot_date, start_time, end_time)
    const teacherId = Number(s.teacher_id ?? s.teacher?.id ?? NaN)
    const roomId    = Number(s.location_id ?? s.location?.id ?? NaN)
    return {
      id: s.id,
      title: (s.remark && s.remark.trim()) || 'Untitled',
      start, end, class: 'event-blue',
      teacherId: Number.isFinite(teacherId) ? teacherId : undefined,
      teacherName: s.teacher?.name ?? tMap.get(teacherId) ?? '',
      roomId: Number.isFinite(roomId) ? roomId : undefined,
      roomName: s.location?.name ?? rMap.get(roomId) ?? '',
      timeTableId: s.time_table_id,
      timeTableName: s.time_table?.name
    }
  })
}

/* utilities: weeks */
function startOfWeek(d){ const dt=new Date(d); const day=dt.getDay(); const diff=(day+6)%7; dt.setDate(dt.getDate()-diff); dt.setHours(0,0,0,0); return dt }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x }
function isoWeekStart(year, week){
  const simple = new Date(year, 0, 1 + (week-1)*7)
  const dow = simple.getDay() || 7
  const monday = new Date(simple)
  monday.setDate(simple.getDate() - (dow-1))
  monday.setHours(0,0,0,0)
  return monday
}

/* -------- local mutation helpers (no full reload after CRUD) -------- */
function replaceEventLocal(ev) {
  const i = allEvents.value.findIndex(e => String(e.id) === String(ev.id))
  if (i >= 0) allEvents.value[i] = ev
  else allEvents.value.push(ev)
}
function removeEventLocal(id) {
  allEvents.value = allEvents.value.filter(e => String(e.id) !== String(id))
}

/* hard jump to a specific week */
async function jumpTo(dateLike){
  const d = startOfWeek(dateLike)
  initialDate.value = new Date(d)
  currentWeekStart.value = new Date(d)
  await nextTick()
  try { cal.value?.switchView?.('week', new Date(d)) } catch {}
  await forceLayout()
}

/* After local change, keep focus if desiredFocusDate is set */
async function refreshLayoutKeepFocus() {
  if (desiredFocusDate.value) {
    const d = new Date(desiredFocusDate.value)
    desiredFocusDate.value = null
    await jumpTo(d)
  }
  await forceLayout()
}
function eventsFromCreateResponse(data) {
  const rows =
    (Array.isArray(data?.time_slots) && data.time_slots) ||
    (Array.isArray(data?.slots) && data.slots) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.created) && data.created) ||
    (Array.isArray(data?.time_slot?.data) && data.time_slot.data) ||
    []
  return buildEventsFromSlots(rows)
}

/* ------------------------------- data loaders ------------------------------ */
async function loadRefLists() {
  const [staffRes, roomRes, progRes, groupRes] = await Promise.all([
    listStaff(), listRooms(), listPrograms(), listGroups()
  ])
  staffOptions.value = staffRes.success ? staffRes.data : []
  roomOptions.value  = roomRes.success  ? roomRes.data  : []

  programOptions.value   = progRes.success  ? progRes.data  : []
  allGroupOptions.value  = groupRes.success ? groupRes.data : []

  // 🔻 PRELOAD all semesters per program (parallel)
  const programs = programOptions.value || []
  if (programs.length) {
    const semesterFetches = programs.map(async (p) => {
      const res = await listSemestersByProgram(p.id)
      return [p.id, res.success ? res.data : []]
    })
    const entries = await Promise.all(semesterFetches)
    semestersByProgram.value = Object.fromEntries(entries)
  } else {
    semestersByProgram.value = {}
  }

  // Years
  const nowY = new Date().getFullYear()
  yearOptions.value = [nowY-1, nowY, nowY+1, nowY+2]
  if (!yearLabel.value) yearLabel.value = nowY
}

/* resolve timetable or set disable state */
async function refreshTimeTables(){
  tableState.noTableForCriteria = false
  tableState.canCreate = false
  tableState.reason = ''

  const res = await listTimeTablesFiltered({
    group_id: filterGroupId.value ?? null,
    semester_id: filterSemesterId.value ?? null
  })

  if (res.success && res.data.length){
    programmaticTTChange.value = true
    selectedTimeTableId.value = res.data[0].id
    programmaticTTChange.value = false
    return
  }

  const noneFound = (res.success && !res.data.length) ||
    (!res.success && /no time tables found/i.test(res.error?.message || ''))

  if (!noneFound){
    selectedTimeTableId.value = null
    tableState.noTableForCriteria = true
    tableState.reason = 'api'
    return
  }

  tableState.noTableForCriteria = true

  const groupsExist = groupOptions.value.length > 0
  const haveGroupSelected = filterGroupId.value != null

  if (!selectedProgramId.value || !filterSemesterId.value){
    selectedTimeTableId.value = null
    tableState.reason = 'filters-incomplete'
    return
  }

  if (!groupsExist){
    selectedTimeTableId.value = null
    tableState.reason = 'no-group-available'
    return
  }

  if (haveGroupSelected){
    const gName = (groupOptions.value.find(g => g.id === filterGroupId.value)?.name) || 'Group'
    const sName = (semesterOptions.value.find(s => s.id === filterSemesterId.value)?.name) || 'Semester'
    const pName = (programOptions.value.find(p => p.id === selectedProgramId.value)?.name) || 'Program'

    const name = `Time Table • ${gName}`
    const desc = `Auto-created for ${pName} / ${sName}`

    const created = await apiCreateTimeTable({ name, description: desc, group_id: Number(filterGroupId.value) })

    if (created.success){
      const after = await listTimeTablesFiltered({
        group_id: filterGroupId.value, semester_id: filterSemesterId.value
      })
      if (after.success && after.data.length){
        programmaticTTChange.value = true
        selectedTimeTableId.value = after.data[0].id
        programmaticTTChange.value = false
        showNotification('No timetable found — created an empty one for you.', 'success')
        return
      }
    }

    selectedTimeTableId.value = null
    tableState.reason = 'create-failed'
    tableState.canCreate = true
    return
  }

  selectedTimeTableId.value = null
  tableState.reason = 'filters-incomplete'
}

/* Selected week’s events only */
function eventsInWeek(events, weekStart){
  const weekEnd = addDays(weekStart, 7)
  return events.filter(e => e.timeTableId === selectedTimeTableId.value && e.start >= weekStart && e.start < weekEnd)
}
const filteredEvents = computed(() => allEvents.value.filter(e => e.timeTableId === selectedTimeTableId.value))
const weekEvents = computed(() => eventsInWeek(filteredEvents.value, currentWeekStart.value))
const weekIsEmpty = computed(() => !!selectedTimeTableId.value && weekEvents.value.length === 0)

/* filters complete? */
const filtersActive = computed(() =>
  selectedProgramId.value != null && filterSemesterId.value != null && filterGroupId.value != null
)
/* calendar enabled when we have a resolved table id */
const calendarEnabled = computed(() => !!selectedTimeTableId.value)

/* ----------------------------- filter interactions ----------------------------- */
watch(selectedProgramId, async () => {
  filterSemesterId.value = null
  filterGroupId.value = null
  await refreshTimeTables()
  await maybeFetchWithFilters()
})

watch(filterSemesterId, async () => {
  filterGroupId.value = null
  await refreshTimeTables()
  await maybeFetchWithFilters()
})

watch(filterGroupId, async () => {
  await refreshTimeTables()
  await maybeFetchWithFilters()
})

/* Keep the week stable */
watch(filteredEvents, async (evts) => {
  if (desiredFocusDate.value){
    const d = new Date(desiredFocusDate.value)
    desiredFocusDate.value = null
    await jumpTo(d)
    widenCalendarWindow(evts)
    return
  }

  if (currentWeekStart.value instanceof Date) {
    widenCalendarWindow(evts)
    await forceLayout()
    return
  }

  const first = evts.slice().sort((a,b)=>+a.start - +b.start)[0]
  const d = first ? new Date(first.start) : new Date()
  await jumpTo(d)
  widenCalendarWindow(evts)
})

function onViewChange({ startDate }){
  const s = startDate instanceof Date ? startDate : new Date()
  currentWeekStart.value = startOfWeek(s)
}

/* ----------------------------- server-side filter ---------------------------- */
async function maybeFetchWithFilters(){
  if (!filtersActive.value || !calendarEnabled.value) { allEvents.value = []; return }

  try{
    loading.value = true
    const params = {
      per_page: 3000,
      year_label: yearLabel.value || undefined,
      program_id: selectedProgramId.value,
      semester_id: filterSemesterId.value,
      group_id: filterGroupId.value
    }

    const slotRes = await getAllTimeSlots(params)
    if (!slotRes.success) throw slotRes.error

    const { slots, table } = slotRes.data || {}
    allEvents.value = buildEventsFromSlots(slots || [])

    if (table && table.id){
      programmaticTTChange.value = true
      selectedTimeTableId.value = table.id
      programmaticTTChange.value = false
    }

    await refreshLayoutKeepFocus()
    widenCalendarWindow(filteredEvents.value)
  }catch(e){
    if (String(e?.message || '').toLowerCase().includes('no time slots available')) {
      allEvents.value = []
      await refreshLayoutKeepFocus()
      return
    }
    showNotification(e?.message || 'Failed to load time slots', 'error')
  }finally{
    loading.value = false
  }
}

async function loadAllSlotsUnfiltered(){
  try{
    loading.value = true
    const slotRes = await getAllTimeSlots()
    if (!slotRes.success) throw slotRes.error
    const { slots } = slotRes.data || {}
    allEvents.value = buildEventsFromSlots(slots || [])
  }catch{
    allEvents.value = []
  }finally{
    loading.value = false
  }
}

/* --------------------------------- CRUD glue -------------------------------- */
async function createSlotOnServer(tableId, ev){ return await createSlot(tableId, eventToSlot(ev, subjectId)) }
async function updateSlotOnServer(slotId, ev){ return await updateSlot(slotId, eventToSlot(ev, subjectId)) }
async function deleteSlotOnServer(tableId, slotId){ return await removeSlots(tableId, [slotId]) }

/* ------------------------------- UI Handlers ------------------------------- */
function eventTooltip(ev){
  const date = ev.start.toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric', year:'numeric' })
  const t1 = ev.start.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  const t2 = ev.end.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  return `${ev.title}\n${date} • ${t1} – ${t2}\nTeacher: ${ev.teacherName||'—'} • Room: ${ev.roomName||'—'}\n#${ev.id}`
}

function onCellDbl(payload){
  let when = null
  if (payload instanceof Date) when = payload
  else if (payload?.date instanceof Date) when = payload.date
  else if (payload?.startDate instanceof Date) when = payload.startDate
  openCreateDialog(when ?? new Date())
  return false
}

/* slot editor */
const showEditor = ref(false)
const isEditing = ref(false)
const editingSlotId = ref(null)

const draft = ref(null)
const draftTeacherId = ref('')
const draftRoomId = ref('')
const draftRemark = ref('New event')
const draftStart = ref('08:00')
const draftEnd   = ref('09:00')
const formError  = ref(null)

const draftDayLabel = computed(() =>
  draft.value ? draft.value.start.toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' }) : '—'
)

function openCreateDialog(startApprox){
  if (!selectedTimeTableId.value){ showNotification('No time table resolved from filters.', 'error'); return }
  formError.value = null; isEditing.value = false; editingSlotId.value = null
  const s = new Date(startApprox); const e = new Date(startApprox); e.setMinutes(e.getMinutes()+MIN_MIN)
  draft.value = { id:`local-${Math.random().toString(36).slice(2)}`, title:'New event', start:s, end:e, class:'event-blue', timeTableId: selectedTimeTableId.value }
  draftStart.value = `${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}`
  draftEnd.value   = `${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}`
  draftTeacherId.value = ''
  draftRoomId.value = ''
  draftRemark.value = 'New event'
  editorWeekday.value = weekdayIndexFromDate(s)
  showEditor.value = true
}

function openEditFromEvent(ev){
  formError.value = null; isEditing.value = true; editingSlotId.value = Number(ev.id)
  const s = new Date(ev.start); const e = new Date(ev.end)
  draft.value = { ...ev, start:s, end:e }
  draftStart.value = `${String(s.getHours()).padStart(2,'0')}:${String(s.getMinutes()).padStart(2,'0')}`
  draftEnd.value   = `${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}`
  draftTeacherId.value = ev.teacherId ?? ''
  draftRoomId.value = ev.roomId ?? ''
  draftRemark.value = ev.title
  showEditor.value = true
}
function applyDraftToEvent(){
  if (!draft.value) return
  formError.value = null
  const base = new Date(draft.value.start)
  const [sh, sm] = draftStart.value.split(':').map(Number)
  const [eh, em] = draftEnd.value.split(':').map(Number)
  const s = new Date(base); s.setHours(sh||0, sm||0, 0, 0)
  const e = new Date(base); e.setHours(eh||0, em||0, 0, 0)
  draft.value.start = s
  draft.value.end   = ensureMinDuration(s, e)
  draft.value.title = (draftRemark.value?.trim()) || 'Untitled'
  if (draftTeacherId.value !== '') draft.value.teacherId = Number(draftTeacherId.value)
  if (draftRoomId.value !== '')    draft.value.roomId    = Number(draftRoomId.value)
  draft.value.teacherName = (staffOptions.value.find(t => Number(t.id) === Number(draft.value.teacherId)) || {}).name || draft.value.teacherName
  draft.value.roomName    = (roomOptions.value.find(r => Number(r.id) === Number(draft.value.roomId)) || {}).name    || draft.value.roomName
}
async function saveEditor(){
  if (!draft.value || !selectedTimeTableId.value){ showNotification('No time table resolved from filters.', 'error'); return }
  applyDraftToEvent()
  const roomOk = Number.isFinite(Number(draft.value.roomId)) && Number(draft.value.roomId) > 0
  if (!roomOk){ formError.value = 'Please choose a room.'; return }
  if (draft.value.end <= draft.value.start){ formError.value = 'End time must be after start time.'; return }

  desiredFocusDate.value = startOfWeek(draft.value.start)

  try{
    if (isEditing.value && editingSlotId.value!=null){
      const res = await updateSlotOnServer(editingSlotId.value, draft.value)
      if (!res.success) throw res.error

      replaceEventLocal({
        ...(allEvents.value.find(e => String(e.id)===String(editingSlotId.value)) || {}),
        ...draft.value,
        id: editingSlotId.value,
        timeTableId: selectedTimeTableId.value
      })
      showNotification('Time slot updated.', 'success')
    }else{
      const res = await createSlotOnServer(selectedTimeTableId.value, draft.value)
      if (!res.success) throw res.error

      const created = eventsFromCreateResponse(res.data)
      if (created.length){
        created.forEach(ev => replaceEventLocal({ ...ev, timeTableId: ev.timeTableId ?? selectedTimeTableId.value }))
      }else{
        replaceEventLocal({
          ...draft.value,
          id: `tmp-${Date.now()}`,
          timeTableId: selectedTimeTableId.value
        })
      }
      showNotification('Time slot created.', 'success')
    }

    showEditor.value = false
    draft.value = null
    isEditing.value = false
    editingSlotId.value = null
    await refreshLayoutKeepFocus()
  }catch(e){
    const msg = e?.message || (isEditing.value ? 'Failed to update time slot' : 'Failed to create time slot')
    formError.value = msg; showNotification(msg, 'error')
  }
}
function cancelEditor(){ showEditor.value = false; draft.value = null; formError.value = null; isEditing.value=false; editingSlotId.value=null }

/* 🔻 delete */
async function onEventDelete(ev){
  if (!selectedTimeTableId.value) return false

  const closeEditorAfter = showEditor.value && Number(editingSlotId.value) === Number(ev.id)

  desiredFocusDate.value = new Date(currentWeekStart.value)
  try{
    const res = await deleteSlotOnServer(selectedTimeTableId.value, Number(ev.id))
    if (!res.success) throw res.error
    removeEventLocal(ev.id)
    showNotification('Time slot deleted.', 'success')

    if (closeEditorAfter){
      showEditor.value = false
      draft.value = null
      isEditing.value = false
      editingSlotId.value = null
      formError.value = null
    }

    await refreshLayoutKeepFocus()
    return true
  }catch(e){
    showNotification(e?.message || 'Failed to delete time slot', 'error')
    return false
  }
}

/* --------------------------- clone when empty --------------------------- */
const customCloneYear = ref(new Date().getFullYear())
const customCloneWeek = ref(1)

async function cloneFromWeek(sourceWeekStart){
  if (!selectedTimeTableId.value){ showNotification('No time table resolved from filters.', 'error'); return }
  const src = eventsInWeek(allEvents.value, sourceWeekStart)
  if (!src.length){ showNotification('Source week has no events.', 'error'); return }

  const deltaDays = Math.round((currentWeekStart.value - sourceWeekStart) / (1000*60*60*24))

  let created = 0, conflicts = 0, failed = 0
  loading.value = true
  try{
    for (const ev of src){
      const s = new Date(ev.start); const e = new Date(ev.end)
      s.setDate(s.getDate() + deltaDays); e.setDate(e.getDate() + deltaDays)
      const res = await createSlotOnServer(selectedTimeTableId.value, { ...ev, start:s, end:e })
      if (res.success) {
        const newEvents = eventsFromCreateResponse(res.data)
        if (newEvents.length){
          newEvents.forEach(ne => replaceEventLocal({ ...ne, timeTableId: ne.timeTableId ?? selectedTimeTableId.value }))
        }
        created++
      } else if (res.error?.status === 422 && /time conflict/i.test(res.error?.message || '')) {
        conflicts++
      } else {
        failed++
      }
    }

    const parts = []
    if (created) parts.push(`${created} created`)
    if (conflicts) parts.push(`${conflicts} skipped (conflicts)`)
    if (failed) parts.push(`${failed} failed`)
    showNotification(parts.join(', ') || 'Nothing cloned.', conflicts || failed ? 'warning' : 'success')

    desiredFocusDate.value = new Date(currentWeekStart.value)
    await refreshLayoutKeepFocus()
  } finally {
    loading.value = false
  }
}
async function cloneFromLastWeek(){ await cloneFromWeek(addDays(currentWeekStart.value, -7)) }
async function cloneFromCustom(){ await cloneFromWeek(isoWeekStart(Number(customCloneYear.value), Number(customCloneWeek.value))) }

/* --------------------------- time table create/delete --------------------------- */
const showCreateTable = ref(false)
const newTableName = ref('Time Table')
const newTableDesc = ref('Time table for selected group.')

async function createTimeTableUI(name, description, groupId){ return await apiCreateTimeTable({ name, description, group_id: groupId }) }
async function deleteTimeTableUI(tableId){ return await apiDeleteTimeTable(tableId) }
async function doCreateTable(){
  if (!filterGroupId.value){ showNotification('Pick a group first.', 'error'); return }
  const res = await createTimeTableUI(newTableName.value.trim(), newTableDesc.value.trim(), Number(filterGroupId.value))
  if (!res.success){ showNotification(res.error?.message || 'Failed to create time table', 'error'); return }
  showCreateTable.value = false
  await refreshTimeTables()
  await maybeFetchWithFilters()
  showNotification('Time table created.', 'success')
}
async function doDeleteTable(){
  const id = selectedTimeTableId.value
  if (!id){ showNotification('No time table selected.', 'error'); return }
  const res = await deleteTimeTableUI(id)
  if (!res.success){ showNotification(res.error?.message || 'Failed to delete time table', 'error'); return }
  await refreshTimeTables()
  await maybeFetchWithFilters()
  showNotification('Time table deleted.', 'success')
}

/* ----------------------------------- boot ---------------------------------- */
async function load(){
  loading.value = true; error.value = null
  try{
    await loadRefLists()
    await refreshTimeTables()

    if (!calendarEnabled.value){
      allEvents.value = []
      return
    }

    await maybeFetchWithFilters()

    await jumpTo(currentWeekStart.value)
    widenCalendarWindow(filteredEvents.value)
  }catch(e){
    error.value = e?.message || 'Failed to load'
    allEvents.value = []
  }finally{ loading.value = false }
}

onMounted(load)
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-3xl font-bold">Time Table</h2>
      <div class="flex gap-2">
        <button class="px-3 py-2 rounded border" @click="openCreateDialog(new Date())" :disabled="loading || !calendarEnabled">
          New time slot
        </button>
        <button class="px-3 py-2 rounded border" @click="showCreateTable = true" :disabled="loading">New time table</button>
        <button class="px-3 py-2 rounded border text-red-600" @click="doDeleteTable" :disabled="loading || !selectedTimeTableId">Delete current</button>
      </div>
    </div>

    <!-- Filters with lucide ChevronDown -->
    <div class="flex flex-wrap gap-3 items-center">
      <div class="relative">
        <select v-model="yearLabel" class="pill-select appearance-none pr-10" :disabled="loading">
          <option :value="null" disabled>Year</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
        <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronDown class="w-4 h-4 text-gray-500" />
        </span>
      </div>

      <div class="relative">
        <select v-model="selectedProgramId" class="pill-select appearance-none pr-10" :disabled="loading || !programOptions.length">
          <option :value="null" disabled>Program</option>
          <option v-for="p in programOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronDown class="w-4 h-4 text-gray-500" />
        </span>
      </div>

      <div class="relative" v-if="selectedProgramId!=null">
        <select v-model="filterSemesterId" class="pill-select appearance-none pr-10" :disabled="loading || !semesterOptions.length">
          <option :value="null" disabled>Semester</option>
          <option v-for="s in semesterOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronDown class="w-4 h-4 text-gray-500" />
        </span>
      </div>

      <div class="relative" v-if="filterSemesterId!=null">
        <select v-model="filterGroupId" class="pill-select appearance-none pr-10" :disabled="loading || !groupOptions.length">
          <option :value="null" disabled>Group</option>
          <option v-for="g in groupOptions" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
        <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronDown class="w-4 h-4 text-gray-500" />
        </span>
      </div>
    </div>

    <div class="text-[13px] text-gray-600">
      Tip: <b>Double-click</b> an empty cell to create a time slot.
      <b>Double-click a card to delete it.</b> Right-click a card to edit details. Hover a card to see full info.
    </div>

    <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>

    <!-- No-table / disabled calendar banner -->
    <div v-if="!calendarEnabled" class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
      <template v-if="tableState.reason === 'filters-incomplete'">
        <b>Select Program → Semester → Group</b> to view or create a timetable.
      </template>
      <template v-else-if="tableState.reason === 'no-group-available'">
        <b>No groups available</b> for the selected Program/Semester. Please create a group first, then create a timetable.
      </template>
      <template v-else-if="tableState.reason === 'create-failed' || tableState.noTableForCriteria">
        No time table found for this selection.
        <button
          v-if="tableState.canCreate"
          class="ml-2 inline-flex items-center px-3 py-1.5 rounded bg-blue-600 text-white"
          @click="showCreateTable = true"
        >
          Create one
        </button>
      </template>
      <template v-else>
        No timetable available.
      </template>
    </div>

    <!-- Empty-week clone banner -->
    <div v-if="calendarEnabled && weekIsEmpty" class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 flex flex-wrap items-center gap-3">
      <span>No events this week.</span>
      <button class="px-3 py-1.5 rounded bg-amber-600 text-white" @click="cloneFromLastWeek">Clone from last week</button>
      <div class="flex items-center gap-2">
        <span>or from week</span>
        <input v-model.number="customCloneWeek" type="number" min="1" max="53" class="w-20 border rounded px-2 py-1" />
        <span>year</span>
        <input v-model.number="customCloneYear" type="number" min="2000" max="2100" class="w-24 border rounded px-2 py-1" />
        <button class="px-3 py-1.5 rounded border" @click="cloneFromCustom">Clone</button>
      </div>
    </div>

    <!-- Calendar -->
    <vue-cal
      v-if="calendarEnabled"
      ref="cal"
      class="timetable-cal"
      default-view="week"
      :selected-date="initialDate"
      :disable-views="['years','year','month','day']"
      hide-view-selector
      :views-bar="false"
      :time-from="timeFromM"
      :time-to="timeToM"
      :snap-to-time="snapTo"
      :events="filteredEvents"
      :editable-events="true"
      @event-change="onEventChange"
      @event-delete="onEventDelete"
      @cell-dblclick="onCellDbl"
      @view-change="onViewChange"
      :hide-weekends="false"
    >
      <template #event="{ event }">
        <div
          class="event-card"
          :title="eventTooltip(event)"
          @dblclick.stop="onEventDelete(event)"
          @contextmenu.prevent.stop="openEditFromEvent(event)"
        >
          <div class="event-title">{{ event.title }}</div>
          <div class="event-time">
            {{ new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} –
            {{ new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </div>
          <div class="event-body">
            <div class="event-meta"><span class="label">TEACHER</span> {{ event.teacherName || '—' }}</div>
            <div class="event-meta"><span class="label">ROOM</span> {{ event.roomName || '—' }}</div>
          </div>
        </div>
      </template>
    </vue-cal>

    <div v-if="calendarEnabled && !loading && !filteredEvents.length" class="text-sm text-gray-500">
      No time slots for this selection yet — double-click a cell to create one, or use the clone banner above.
    </div>

    <!-- Slot Editor Dialog -->
    <div v-if="showEditor" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @keydown.esc="cancelEditor">
      <div class="bg-white rounded-2xl shadow-xl p-5 w-full max-w-xl space-y-4">
        <div class="text-xl font-semibold">{{ isEditing ? 'Edit time slot' : 'New time slot' }}</div>

        <div class="text-sm text-gray-600">On <b>{{ draftDayLabel }}</b></div>

        <div class="grid md:grid-cols-2 gap-3">
          <!-- 🔹 Day-of-week (create only) -->
          <div v-if="!isEditing" class="md:col-span-2">
            <label class="block text-sm mb-1">Day of week</label>
            <div class="relative">
              <select
                v-model.number="editorWeekday"
                class="border rounded px-3 py-2 w-full appearance-none pr-10"
                @change="moveDraftToWeekday(editorWeekday)"
              >
                <option v-for="(lbl, idx) in weekdayLabels" :key="idx" :value="idx">{{ lbl }}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm mb-1">Start</label>
            <input v-model="draftStart" type="time" class="border rounded px-3 py-2 w-full" step="300" />
          </div>
          <div>
            <label class="block text-sm mb-1">End</label>
            <input v-model="draftEnd" type="time" class="border rounded px-3 py-2 w-full" step="300" />
          </div>

          <div>
            <label class="block text-sm mb-1">Teacher</label>
            <div class="relative">
              <select v-model.number="draftTeacherId" class="border rounded px-3 py-2 w-full appearance-none pr-10">
                <option value="">—</option>
                <option v-for="t in staffOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm mb-1">Room <span class="text-red-600">*</span></label>
            <div class="relative">
              <select v-model.number="draftRoomId" class="border rounded px-3 py-2 w-full appearance-none pr-10">
                <option value="">(pick a room)</option>
                <option v-for="r in roomOptions" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm mb-1">Title</label>
            <input v-model="draftRemark" class="border rounded px-3 py-2 w-full" placeholder="Remark / Subject" />
          </div>
        </div>

        <div v-if="formError" class="text-sm text-red-600">{{ formError }}</div>

        <div class="flex justify-between items-center gap-2">
          <button
            v-if="isEditing"
            class="px-3 py-2 rounded border text-red-600"
            @click="onEventDelete({ id: editingSlotId })"
          >
            Delete
          </button>
          <div class="grow"></div>
          <button class="px-3 py-2 rounded border" @click="cancelEditor">Cancel</button>
          <button class="px-3 py-2 rounded bg-blue-600 text-white" @click="saveEditor">
            {{ isEditing ? 'Save changes' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create time table dialog -->
    <div v-if="showCreateTable" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-5 w-full max-w-xl space-y-4">
        <div class="text-xl font-semibold">Create Time Table</div>
        <div class="grid gap-3">
          <div>
            <label class="block text-sm mb-1">Name</label>
            <input v-model="newTableName" class="border rounded px-3 py-2 w-full" placeholder="Time Table for Group" />
          </div>
          <div>
            <label class="block text-sm mb-1">Description</label>
            <input v-model="newTableDesc" class="border rounded px-3 py-2 w-full" placeholder="Description" />
          </div>
          <div>
            <label class="block text-sm mb-1">Group</label>
            <div class="relative">
              <select v-model.number="filterGroupId" class="border rounded px-3 py-2 w-full appearance-none pr-10">
                <option :value="null">(pick a group)</option>
                <option v-for="g in groupOptions" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="px-3 py-2 rounded border" @click="showCreateTable=false">Cancel</button>
          <button class="px-3 py-2 rounded bg-blue-600 text-white" @click="doCreateTable">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.timetable-cal.vuecal){
  height: calc(100vh - 180px);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
}
:deep(.vuecal__view){ overflow: auto !important; }
:deep(.vuecal__bg .vuecal__cell){ border-bottom: none !important; }
:deep(.vuecal__time-column .vuecal__time-cell){ border-bottom: none !important; }
:deep(.vuecal__now-line), :deep(.vuecal__now-label){ display:none!important; }
:deep(.vuecal__time-cell){ height: 40px !important; }
:deep(.vuecal__event){ min-height: 120px !important; }

:deep(.vuecal__event){
  border-radius: 14px;
  border: 1px solid transparent;
  box-shadow: 0 1px 0 rgba(0,0,0,.04);
  transition: transform .06s ease, box-shadow .12s ease, border-color .12s ease;
  overflow: hidden; margin-top: 0 !important; box-sizing: border-box;
}
.event-card{
  height: 100%; padding: 10px 12px; display: grid; grid-template-rows: auto auto 1fr;
  gap: 4px; font-size: 13px; line-height: 1.28; min-height: 0;
  background:#eef4ff; border: 1px solid #c7d2fe; border-radius: 14px;
}
:deep(.vuecal__event:hover){ transform: translateY(-1px); box-shadow: 0 10px 24px rgba(17,24,39,.08); border-color: rgba(31,41,55,.06); }
.event-title{ font-weight: 800; font-size: 14px; }
.event-time{ opacity:.85; font-size: 12.5px; }
.event-body{ min-height: 0; overflow: auto; display: grid; gap: 4px; padding-right: 2px; }
.event-meta{ opacity:.95; display:flex; gap:8px; align-items:baseline; font-size:12.5px; }
.event-meta .label{ opacity:.7; letter-spacing:.04em; font-weight:700; font-size:11.5px; }

.pill-select{
  border-radius: 9999px; border: 1px solid #D1D5DB; background: #fff;
  padding: 0.5rem 1rem; height: 44px; min-width: 210px; font-size: 0.875rem;
}
.pill-select:focus{ outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,.25); }
</style>
