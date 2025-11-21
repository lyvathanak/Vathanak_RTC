<template>
  <div class="flex flex-col gap-4 py-5">
    <!-- Header / Tools -->
    <div class="px-3 sm:px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!-- Left: search -->
      <div class="relative w-full md:w-[28rem]">
        <input
          v-model="search"
          type="text"
          placeholder="Search subjects…"
          class="w-full h-10 rounded-xl border px-10 pr-3 outline-none focus:ring-2 focus:ring-[#235AA6]"
          @input="debouncedFetch()"
        />
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      <!-- Right: actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click.stop.prevent="openAddModal"
          class="h-10 shrink-0 whitespace-nowrap inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-4 text-white font-semibold hover:bg-[#1f4f93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#235AA6]"
        >
          <Plus class="h-4 w-4" />
          <span class="text-sm">Add Subject</span>
        </button>

        <button
          type="button"
          @click.stop.prevent="exportData"
          :disabled="exporting || loading"
          class="h-10 shrink-0 whitespace-nowrap inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 text-white font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60"
        >
          <span v-if="exporting" class="inline-block h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
          <Download v-else class="h-4 w-4" />
          <span class="text-sm">{{ exporting ? 'Exporting…' : 'Export' }}</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="px-3 sm:px-5 flex flex-col md:flex-row md:items-center gap-3">
      <!-- Department -->
      <div class="relative w-full md:w-[20rem]">
        <select
          v-model="filters.department_id"
          @change="onDeptFilterChange"
          class="h-10 w-full rounded-xl border px-3 pr-9 outline-none focus:ring-2 focus:ring-[#235AA6] bg-white"
          :disabled="loadingRefData"
        >
          <option value="">Department</option>
          <option v-for="d in departmentsWithPrograms" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
        </select>
      </div>

      <!-- Program (after dept) -->
      <transition name="fade">
        <div v-if="filters.department_id" class="relative w-full md:w-[20rem]">
          <select
            v-model="filters.program_id"
            @change="fetchSubjects(1)"
            class="h-10 w-full rounded-xl border px-3 pr-9 outline-none focus:ring-2 focus:ring-[#235AA6] bg-white"
          >
            <option value="">Program</option>
            <option v-for="p in filteredProgramOptions" :key="p.id" :value="String(p.id)">
              {{ p.name }}
            </option>
          </select>
        </div>
      </transition>
    </div>

    <!-- Table -->
    <div class="px-3 sm:px-5">
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table class="w-full subject-table">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr class="text-xs font-semibold text-gray-600 uppercase">
              <th class="px-4 py-3 text-left th-code">Subject Code</th>
              <th class="px-4 py-3 text-left th-name">Subject Name</th>
              <th class="px-4 py-3 text-left hidden sm:table-cell">Credit</th>
              <th class="px-4 py-3 text-left hidden md:table-cell">Total Hour</th>
              <th class="px-4 py-3 text-left hidden lg:table-cell">Practice Hour</th>
              <th class="px-4 py-3 text-left hidden md:table-cell">Program</th>
              <th class="px-4 py-3 text-left hidden lg:table-cell">Department</th>
              <th class="px-3 py-3 text-left sticky-right w-[88px] min-w-[88px] md:w-[96px] md:min-w-[96px]">Action</th>
            </tr>
          </thead>

          <tbody class="divide-y">
            <tr v-for="s in subjects" :key="s.id" class="hover:bg-gray-50">
              <!-- Code -->
              <td class="px-4 py-3 td-code">
                <div class="code-wrap font-medium text-gray-900" :title="s.__code">{{ s.__code || '-' }}</div>
              </td>

              <!-- Name -->
              <td class="px-4 py-3 td-name">
                <div class="name-wrap text-sm font-semibold text-gray-900">{{ s.__name || '-' }}</div>
                <div class="mobile-code" v-if="s.__code">{{ s.__code }}</div>
                <div v-if="s.description" class="desc-ellipsis text-xs text-gray-500 mt-0.5" :title="s.description">
                  {{ s.description }}
                </div>
              </td>

              <!-- Meta -->
              <td class="px-4 py-3 text-sm hidden sm:table-cell align-top">{{ formatCredit(s.credit) }}</td>
              <td class="px-4 py-3 text-sm hidden md:table-cell align-top">{{ formatHour(s.total_hours) }}</td>
              <td class="px-4 py-3 text-sm hidden lg:table-cell align-top">{{ formatHour(s.practice_hours) }}</td>
              <td class="px-4 py-3 text-sm hidden md:table-cell align-top">{{ programNameFromSubject(s) }}</td>
              <td class="px-4 py-3 text-sm hidden lg:table-cell align-top">{{ departmentNameFromSubject(s) }}</td>

              <!-- Actions -->
              <td class="px-2 py-2 sticky-right bg-white align-top">
                <div class="flex items-center gap-1.5 md:gap-2" @click.stop>
                  <button
                    class="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 px-2 py-1"
                    title="View"
                    @click.stop.prevent="viewSubject(s)"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <button
                    class="inline-flex items-center justify-center rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 px-2 py-1"
                    title="Edit"
                    @click.stop.prevent="editSubject(s)"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>

                  <!-- AlertDialog delete -->
                  <AlertDialog>
                    <AlertDialogTrigger as-child>
                      <button
                        class="inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 disabled:opacity-60"
                        title="Delete"
                        @click.stop="subjectToDelete = s"
                        :disabled="deletingId === s.id"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete
                          <strong>{{ s.__name || s.subject_name || 'this subject' }}</strong>.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          class="bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                          :disabled="deletingId === s.id"
                          @click="confirmDelete()"
                        >
                          {{ deletingId === s.id ? 'Deleting…' : 'Delete' }}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>

            <tr v-if="loading">
              <td colspan="8" class="px-4 py-6 text-center text-sm text-gray-500">Loading…</td>
            </tr>
            <tr v-if="!loading && subjects.length === 0">
              <td colspan="8" class="px-4 py-6 text-center text-sm text-gray-500">No subjects found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="px-3 sm:px-5">
      <Pagination
        class="mx-auto"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-items="meta.total"
        :page-size-options="[10,25,50,100]"
        item-label="subjects"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- MODALS -->
    <AddSubject v-model="openAdd" @created="onCreated" />
    <ViewSubject v-model="openView" :subject="activeSubject" @edit="onEditFromView" @updated="onUpdated" />
    <EditSubject :key="activeSubject?.id || 'edit'" v-model="openEdit" :subject="activeSubject" @updated="onUpdated" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import api from '@/stores/apis/axios'
import Pagination from '@/components/features/Pagination.vue'
import AddSubject from '@/components/admins/subject/AddSubject.vue'
import ViewSubject from '@/components/admins/subject/ViewSubject.vue'
import EditSubject from '@/components/admins/subject/EditSubject.vue'
import { Plus, Download, Search, Eye, Trash2, Pencil } from 'lucide-vue-next'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { showNotification } from '@/lib/notifications.js'

/* ---------- robust base URL + helpers (prod safe) ---------- */
const FALLBACK_BASE = 'https://api.rtc-bb.camai.kh/api'
const RESOLVED_BASE =
  (api?.defaults?.baseURL && String(api.defaults.baseURL).replace(/\/+$/, '')) ||
  (import.meta?.env?.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '')) ||
  FALLBACK_BASE
const buildURL = (path) => `${RESOLVED_BASE}/${String(path || '').replace(/^\/+/, '')}`

/* ---------- state ---------- */
const loading = ref(false)
const exporting = ref(false)
const subjects = ref([])
const meta = ref({ current_page: 1, from: 0, to: 0, total: 0, per_page: 25, last_page: 1 })

const page = ref(1)
const pageSize = ref(25)

const search = ref('')

const filters = ref({ department_id: '', program_id: '', credit: '', total_hours: '' })
const filterHours = ref('')

const loadingRefData = ref(false)
const departments = ref([])
const programs = ref([])
const deptMap = ref(new Map())
const programMap = ref(new Map())

const openAdd = ref(false)
const openView = ref(false)
const openEdit = ref(false)
const activeSubject = ref({})

/* delete dialog state */
const subjectToDelete = ref(null)
const deletingId = ref(null)

function formatCredit (n) {
  const num = Number(n ?? 0)
  if (!Number.isFinite(num)) return '0.00'
  if (Number.isInteger(num)) return num.toFixed(2)
  const hundred = Math.round((num % 1) * 100)
  if (hundred === 50) return (Math.floor(num) + 0.5).toString()
  return num.toFixed(2).replace(/\.?0+$/, '')
}
function formatHour (v) {
  const n = Number(v ?? 0)
  if (!Number.isFinite(n)) return '0'
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.00$/, '')
}
function departmentNameFromSubject (s) {
  const inline = s.department_name ?? s.department?.department_name ?? s.department?.name
  if (inline) return inline
  let depId = s.department_id ?? s.departmentId ?? s.department?.id ?? null
  if (!depId) {
    const pid = s.program_id ?? s.programId ?? s.program?.id ?? null
    if (pid) depId = programMap.value.get(String(pid))?.department_id ?? null
  }
  if (!depId) return '-'
  return deptMap.value.get(String(depId))?.name ?? `#${depId}`
}
function programNameFromSubject (s) {
  const inline = s.program_name ?? s.program?.program_name ?? s.program?.name
  if (inline) return inline
  const pid = s.program_id ?? s.programId ?? s.program?.id
  if (!pid) return '-'
  return programMap.value.get(String(pid))?.name ?? `#${pid}`
}

/* --- ref data --- */
const departmentsWithPrograms = computed(() => {
  const set = new Set(programs.value.map(p => Number(p.department_id)).filter(Number.isFinite))
  return departments.value.filter(d => set.has(Number(d.id)))
})
const filteredProgramOptions = computed(() => {
  if (!filters.value.department_id) return []
  const dep = String(filters.value.department_id)
  return programs.value.filter(p => String(p.department_id ?? '') === dep)
})
async function fetchRefData () {
  loadingRefData.value = true
  try {
    const [{ data: dres }, { data: pres }] = await Promise.all([
      api.get('/managements/get_all_department'),
      api.get('/managements/get_all_program'),
    ])
    const dlist = Array.isArray(dres?.all_department) ? dres.all_department : []
    departments.value = dlist.map(d => ({ id: Number(d.id), name: String(d.department_name) }))
    deptMap.value = new Map(departments.value.map(d => [String(d.id), d]))

    const plist = Array.isArray(pres?.programs) ? pres.programs : []
    programs.value = plist.map(p => ({ id: Number(p.id), name: String(p.program_name), department_id: p.department_id }))
    programMap.value = new Map(programs.value.map(p => [String(p.id), p]))
  } finally {
    loadingRefData.value = false
  }
}
function onDeptFilterChange () {
  if (filters.value.program_id) {
    const p = programMap.value.get(String(filters.value.program_id))
    if (!p || String(p.department_id ?? '') !== String(filters.value.department_id ?? '')) {
      filters.value.program_id = ''
    }
  }
  fetchSubjects(1)
}

/* --- data --- */
const MAX_PAGES_TO_PULL = 50
const approxEq = (a, b, eps = 1e-9) => Math.abs(Number(a) - Number(b)) <= eps
const hasClientFilters = () =>
  !!(filters.value.department_id ||
     filters.value.program_id ||
     (filters.value.credit !== '' && filters.value.credit != null) ||
     (filters.value.total_hours !== '' && filters.value.total_hours != null))

async function fetchOnePage(p, q) {
  const isSearch = !!(q && q.trim())
  const url = isSearch ? '/managements/search_paginate_subjects' : '/managements/get_all_subjects'
  const params = { page: p, per_page: pageSize.value }
  if (isSearch) params.search = q.trim()
  const { data } = await api.get(url, { params })
  const pack = data?.subjects || {}
  const rows = Array.isArray(pack.data) ? pack.data : []
  const m = {
    current_page: pack.current_page ?? p,
    from: pack.from ?? (rows.length ? 1 : 0),
    to: pack.to ?? rows.length,
    total: pack.total ?? rows.length,
    per_page: pack.per_page ?? pageSize.value,
    last_page: pack.last_page ?? 1,
  }
  return { rows, meta: m }
}
async function fetchSubjects (p = 1) {
  loading.value = true
  try {
    const q = (search.value || '').trim()
    const first = await fetchOnePage(p, q)
    let rows = first.rows
    let serverMeta = first.meta

    if (hasClientFilters()) {
      const all = [...rows]
      const lastPage = Number(serverMeta.last_page || 1)
      const limit = Math.min(lastPage, MAX_PAGES_TO_PULL)
      for (let i = 1; i <= limit; i++) {
        if (i === p) continue
        const more = await fetchOnePage(i, q)
        all.push(...more.rows)
      }
      rows = all
    }

    const normalized = rows.map(r => {
      const code = r.subject_code ?? r.code ?? r.subjectCode ?? r.course_code
      const name = r.subject_name ?? r.name ?? r.title ?? r.subject ?? r.subjectName
      const totalHours = r.total_hours ?? r.total_hour ?? r.totalTime ?? r.totalHours ?? 0
      const practiceHours = r.practice_hours ?? r.practice_hour ?? r.practiceTime ?? r.practiceHours ?? 0
      const pid = r.program_id ?? r.programId ?? r.program?.id ?? null
      let did = r.department_id ?? r.departmentId ?? r.department?.id ?? null
      if (!did && pid) {
        const pm = programMap.value.get(String(pid))
        if (pm) did = pm.department_id ?? null
      }
      return {
        ...r,
        subject_code: code || '',
        subject_name: name || '',
        program_id: pid,
        department_id: did,
        total_hours: totalHours,
        practice_hours: practiceHours,
        __code: code || '-',
        __name: name || '-',
      }
    })

    // filters + search
    let list = normalized
    if (filters.value.department_id) {
      const wanted = String(filters.value.department_id)
      list = list.filter(r => String(r.department_id ?? '') === wanted)
    }
    if (filters.value.program_id) {
      const wanted = String(filters.value.program_id)
      list = list.filter(r => String(r.program_id ?? '') === wanted)
    }
    if (filters.value.credit !== '' && filters.value.credit != null) {
      list = list.filter(r => approxEq(r.credit, filters.value.credit))
    }
    if (filters.value.total_hours !== '' && filters.value.total_hours != null) {
      list = list.filter(r => approxEq(r.total_hours, filters.value.total_hours))
    }
    if (q) {
      const ql = q.toLowerCase()
      list = list.filter(r => {
        const hay = [r.__code, r.__name, r.description, programNameFromSubject(r), departmentNameFromSubject(r)]
          .map(x => String(x || '').toLowerCase()).join(' ')
        return hay.includes(ql)
      })
    }

    // meta + slice
    if (hasClientFilters()) {
      const start = (p - 1) * pageSize.value
      const end = start + pageSize.value
      subjects.value = list.slice(start, end)
      const total = list.length
      meta.value = {
        current_page: p,
        from: total ? start + 1 : 0,
        to: Math.min(end, total),
        total,
        per_page: pageSize.value,
        last_page: Math.max(1, Math.ceil(total / pageSize.value)),
      }
    } else {
      subjects.value = list
      meta.value = {
        current_page: serverMeta.current_page ?? p,
        from: serverMeta.from ?? ((p - 1) * (serverMeta.per_page || pageSize.value) + 1),
        to: serverMeta.to ?? ((p - 1) * (serverMeta.per_page || pageSize.value) + list.length),
        total: serverMeta.total ?? list.length,
        per_page: serverMeta.per_page ?? pageSize.value,
        last_page: serverMeta.last_page ?? Math.max(1, Math.ceil((serverMeta.total ?? list.length) / (serverMeta.per_page ?? pageSize.value))),
      }
    }

    page.value = meta.value.current_page
  } finally { loading.value = false }
}

/* ✅ AlertDialog-backed delete with fallbacks + snackbars */
async function confirmDelete () {
  const row = subjectToDelete.value
  if (!row || !row.id) return
  const id = row.id
  deletingId.value = id

  // try multiple endpoints (relative, absolute, alt)
  const endpoints = [
    `/managements/remove_subject/${id}`,
    buildURL(`/managements/remove_subject/${id}`),
    `/managements/delete_subject/${id}`,
    buildURL(`/managements/delete_subject/${id}`),
  ]

  let lastErr = null
  for (const url of endpoints) {
    try {
      await api.delete(url, { withCredentials: true })
      subjects.value = subjects.value.filter(r => Number(r.id) !== Number(id))
      if (subjects.value.length === 0 && page.value > 1) page.value = page.value - 1
      await fetchSubjects(page.value)
      showNotification('Subject deleted successfully!', 'success')
      deletingId.value = null
      subjectToDelete.value = null
      return
    } catch (e) {
      lastErr = e
      // continue to next candidate
    }
  }

  const msg =
    lastErr?.response?.data?.message ||
    lastErr?.response?.data?.error ||
    lastErr?.message ||
    'Failed to delete subject'
  showNotification(msg, 'error')
  deletingId.value = null
  subjectToDelete.value = null
}

/* export */
async function exportData () {
  if (exporting.value) return
  exporting.value = true
  try {
    const q = (search.value || '').trim()
    const params = {}
    if (q) params.search = q
    const { data } = await api.get('/managements/export_subjects', { params, responseType: 'blob' })
    if (!(data instanceof Blob)) throw new Error('No file returned')
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
    const dl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = dl
    a.download = `subjects-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'')}.csv`
    a.click()
    window.URL.revokeObjectURL(dl)
  } catch {
    showNotification('Export is not available yet on the server.', 'error')
  } finally { exporting.value = false }
}

/* Pagination */
function handlePageChange (p) { page.value = p; fetchSubjects(p) }
function handlePageSizeChange (size) { pageSize.value = size; page.value = 1; fetchSubjects(1) }

/* misc */
let debounceTimer
function debouncedFetch () { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => fetchSubjects(1), 300) }
function openAddModal () { openAdd.value = true }
function onCreated () { fetchSubjects(1) }
function viewSubject (s) { activeSubject.value = { ...s }; nextTick(() => { openView.value = true }) }
function editSubject (s) { activeSubject.value = { ...s }; nextTick(() => { openEdit.value = true }) }
function onEditFromView (s) { activeSubject.value = { ...(s || activeSubject.value) }; openView.value = false; nextTick(() => { openEdit.value = true }) }

/* After child update */
function onUpdated (updated) {
  if (updated?.id) {
    const i = subjects.value.findIndex(r => Number(r.id) === Number(updated.id))
    if (i !== -1) {
      subjects.value[i] = { ...subjects.value[i], ...updated }
      subjects.value[i].__name = updated.subject_name ?? subjects.value[i].__name
      subjects.value[i].__code = updated.subject_code ?? subjects.value[i].__code
    }
  }
  fetchSubjects(page.value)
}

let timeDebounce
watch(filterHours, (val) => {
  clearTimeout(timeDebounce)
  timeDebounce = setTimeout(() => {
    const isEmpty = val === '' || val == null || (typeof val === 'string' && val.trim() === '')
    if (isEmpty) {
      filters.value.total_hours = ''
      fetchSubjects(1)
      return
    }
    const parsed = typeof val === 'number' ? val : parseFloat(String(val))
    filters.value.total_hours = (Number.isFinite(parsed) && parsed >= 0) ? parsed : ''
    fetchSubjects(1)
  }, 250)
})

function clearFilter (key) {
  if (key === 'search') { search.value = ''; debouncedFetch(); return }
  if (key === 'department_id') filters.value.department_id = ''
  if (key === 'program_id') filters.value.program_id = ''
  if (key === 'credit') filters.value.credit = ''
  if (key === 'total_hours') { filters.value.total_hours = ''; filterHours.value = '' }
  fetchSubjects(1)
}
function clearAllFilters () {
  search.value = ''
  filters.value = { department_id: '', program_id: '', credit: '', total_hours: '' }
  filterHours.value = ''
  fetchSubjects(1)
}

onMounted(async () => {
  await fetchRefData()
  fetchSubjects(1)
})
</script>

<style scoped>
/* small fade for program select */
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }

.subject-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }
.subject-table  { table-layout: auto; }

/* keep actions on top & clickable */
.sticky-right { position: sticky; right: 0; z-index: 50; background:#fff; box-shadow: -2px 0 0 rgba(0,0,0,.04); pointer-events: auto; }

/* text behavior */
.name-wrap { white-space: normal; word-break: break-word; line-height: 1.25; }
.code-wrap { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.desc-ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Hide CODE column on small screens */
.th-code, .td-code { display: none; }
.mobile-code {
  display: inline-block;
  font-size: 11px;
  margin-top: 2px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #f3f4f6;
  color: #6b7280;
}

/* ≥640px: show the Code column again */
@media (min-width: 640px) {
  .th-code, .td-code { display: table-cell; width: 160px; min-width: 140px; }
  .mobile-code { display: none; }
}

/* Phones: allow horizontal scroll */
@media (max-width: 768px) {
  :deep(table) { min-width: 900px; }
  th, td { padding-top: 10px; padding-bottom: 10px; }
}

/* Very small phones */
@media (max-width: 380px) {
  th, td { padding-left: 10px; padding-right: 10px; }
}
</style>
