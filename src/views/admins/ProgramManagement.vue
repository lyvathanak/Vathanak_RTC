<!-- /src/pages/admins/program/ProgramIndex.vue -->
<template>
  <div class="flex flex-col gap-4 py-5">
    <!-- Header / Tools -->
    <div class="px-3 sm:px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!-- Left: search -->
      <div class="relative w-full md:w-[28rem]">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search programs…"
          class="w-full h-10 rounded-xl border px-10 pr-3 outline-none focus:ring-2 focus:ring-[#235AA6]"
          @input="debouncedFetch()"
        />
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      <!-- Right: actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openCreate = true"
          class="h-10 shrink-0 whitespace-nowrap inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-4 text-white font-semibold hover:bg-[#1f4f93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#235AA6]"
        >
          <Plus class="h-4 w-4" />
          <span class="text-sm">Create Program</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <Filter
      class="px-3 sm:px-5"
      :key="filterKey"
      :filter-definitions="programFilterDefinitions"
      :initial-filters="initialProgramFilters"
      clear-button-text="Clear"
      :auto-clear="true"
      @update:filters="handleFiltersUpdate"
      @clear-filters="handleClearFilters"
      @filter-change="handleFilterChange"
    />

    <!-- Table -->
    <div class="px-3 sm:px-5">
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <ListTable
          :key="columnsKey"
          :data="pagedRows"
          :loading="searching"
          :show-selection="false"
          :selected-ids="[]"
          :columns="columns"
          :sort-field="sortField"
          :sort-direction="sortDirection"
          :show-actions="true"
          :show-view-action="false"
          :show-edit-action="true"
          :show-delete-action="true"
          view-action-title="View program"
          edit-action-title="Edit program"
          delete-action-title="Delete program"
          empty-state-title="No programs found"
          empty-state-message="Try adjusting your search or filters."
          loading-message="Loading programs..."
          row-key="id"
          @edit="openEditFor($event)"
          @delete="askDelete($event)"
          @sort="onSort"
        >
          <!-- Program -->
          <template #column-program_name="{ value }">
            <span class="font-semibold text-gray-900 whitespace-normal break-words leading-snug">
              {{ value || '—' }}
            </span>
          </template>

          <!-- Department -->
          <template #column-department_id="{ value }">
            <span class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {{ getDepartmentName(value) }}
            </span>
          </template>

          <!-- Degree level -->
          <template #column-degree_level="{ value }">
            <span class="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
              {{ value || '—' }}
            </span>
          </template>

          <!-- Duration -->
          <template #column-duration_years="{ value }">
            <span>{{ value ? value + (value > 1 ? ' years' : ' year') : '—' }}</span>
          </template>
        </ListTable>
      </div>
    </div>

    <!-- Pagination (uses your component API exactly) -->
    <div class="px-3 sm:px-5">
      <Pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-items="programs.length"
        :page-size-options="[5, 10, 25, 50, 100]"
        item-label="Programs"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Create -->
    <Dialog v-model:open="openCreate">
      <DialogContent class="max-w-none w-[90vw] sm:w-[80vw] sm:!max-w-[1000px] rounded-sm p-0">
        <div class="flex flex-col h-[85vh] bg-gray-50 rounded-sm overflow-hidden">
          <div class="sticky top-0 z-10 bg-white border-b rounded-t-sm flex items-center justify-between px-6 py-4">
            <button @click="openCreate = false" class="p-1 rounded hover:bg-gray-100" aria-label="Close">
              <X class="w-5 h-5" />
            </button>
            <DialogHeader class="p-0">
              <DialogTitle>Create Program</DialogTitle>
            </DialogHeader>
            <div class="w-5"></div>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <AddProgramModal @success="onCreated" />
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Update -->
    <Dialog v-model:open="openEdit">
      <DialogContent class="max-w-none w-[90vw] sm:w-[80vw] sm:!max-w-[1000px] rounded-sm p-0">
        <div class="flex flex-col bg-gray-50 rounded-sm overflow-hidden max-h-[85vh]">
          <div class="sticky top-0 z-10 bg-white border-b rounded-t-sm flex items-center justify-between px-6 py-4">
            <button @click="openEdit = false" class="p-1 rounded hover:bg-gray-100" aria-label="Close">
              <X class="w-5 h-5" />
            </button>
            <DialogHeader class="p-0">
              <DialogTitle>Edit Program</DialogTitle>
            </DialogHeader>
            <div class="w-5"></div>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4">
            <UpdateProgramModal
              v-if="editingProgram"
              :program="editingProgram"
              @success="onUpdated"
              @cancel="openEdit = false"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import api from '@/stores/apis/axios'
import AddProgramModal from '@/components/admins/program/AddProgramModal.vue'
import UpdateProgramModal from '@/components/admins/program/UpdateProgramModal.vue'
import ListTable from '@/components/features/ListTable.vue'
import Pagination from '@/components/features/Pagination.vue'
import Filter from '@/components/features/Filter.vue'
import { useFilteredByDepartment } from '@/stores/global/FilterByDepartment.js'
import { Plus, X, Search } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const S = v => String(v ?? '')

/* ---------- state ---------- */
const openCreate = ref(false)
const openEdit = ref(false)
const editingProgram = ref(null)

/* programs (filtered dataset) */
const programs = ref([])

/* departments lookup */
const { departmentOptions } = useFilteredByDepartment({ immediate: true })
const deptIndex = ref(new Map())

/* filters */
const searchTerm = ref('')
const searching = ref(false)
const selectedDeptLabel = ref('All')

/* sorting */
const sortField = ref('')
const sortDirection = ref('asc')

/* pagination */
const page = ref(1)
const pageSize = ref(25)

/* responsive columns */
const isPhone = ref(false) // <= 768px
const columnsDesktop = [
  { key: 'id', label: 'ID', visible: true, sortable: true },
  { key: 'program_name', label: 'Program', visible: true, sortable: true },
  { key: 'degree_level', label: 'Degree Level', visible: true, sortable: true },
  { key: 'duration_years', label: 'Duration', visible: true, sortable: true },
  { key: 'department_id', label: 'Department', visible: true, sortable: true },
]
const columnsPhone = [
  { key: 'id', label: 'ID', visible: true, sortable: true },
  { key: 'program_name', label: 'Program', visible: true, sortable: true },
  { key: 'department_id', label: 'Department', visible: true, sortable: true },
]
const columns = computed(() => (isPhone.value ? columnsPhone : columnsDesktop))
const columnsKey = computed(() => `cols-${isPhone.value ? 'phone' : 'desktop'}`)

/* Filter component */
const programFilterDefinitions = computed(() => {
  const deptNames = departmentOptions.value.map(d => d.department_name || d.name)
  return [{ key: 'department', label: 'Department', options: ['All', ...deptNames] }]
})
const initialProgramFilters = computed(() => ({ department: 'All' }))
const filterKey = computed(() => `program-filter-${departmentOptions.value.length}`)

/* page slice */
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return programs.value.slice(start, start + pageSize.value)
})

/* helpers */
function buildDeptIndexFromPrograms(list) {
  const map = new Map()
  for (const d of departmentOptions.value) {
    const id = S(d.id)
    map.set(id, { id, department_name: d.department_name || d.name })
  }
  for (const p of list) {
    const d = p?.department
    if (d?.id) map.set(S(d.id), { id: S(d.id), department_name: d.department_name || d.name })
  }
  deptIndex.value = map
}
function normalizePrograms(list) {
  return (list || []).map(p => ({
    id: p.id,
    program_name: p.program_name,
    degree_level: p.degree_level,
    duration_years: p.duration_years,
    department_id: p.department_id ?? p.department?.id ?? null,
    department: p.department ?? null,
  }))
}
function getDepartmentName(id) {
  if (!id) return '—'
  const d = deptIndex.value.get(S(id))
  return d?.department_name || `#${id}`
}

/* API */
async function apiListAllPrograms() {
  const { data } = await api.get('/managements/get_all_program')
  return normalizePrograms(data?.programs || [])
}
async function apiListProgramsByDepartmentId(deptId) {
  const { data } = await api.get('/managements/get_program_by', { params: { department_id: deptId } })
  return normalizePrograms(data?.programs || [])
}
async function apiSearchPrograms(q) {
  const { data } = await api.get('/managements/search_paginate_program', { params: { search: q } })
  return normalizePrograms(data?.programs?.data || [])
}
async function apiDeleteProgram(id) { await api.delete(`/managements/remove_program/${id}`) }

/* Fetch + filters */
async function fetchCatalog() {
  searching.value = true
  try {
    const list = await apiListAllPrograms()
    programs.value = list
    buildDeptIndexFromPrograms(list)
    page.value = 1
  } finally { searching.value = false }
}
function deptLabelToId(label) {
  if (!label || label === 'All') return ''
  const found = departmentOptions.value.find(d => (d.department_name || d.name) === label)
  return found ? S(found.id) : ''
}
async function applyFiltersToList() {
  const q = searchTerm.value.trim()
  const deptId = deptLabelToId(selectedDeptLabel.value)
  searching.value = true
  try {
    let list = []
    if (q && deptId) list = (await apiSearchPrograms(q)).filter(p => S(p.department_id) === deptId)
    else if (q) list = await apiSearchPrograms(q)
    else if (deptId) list = await apiListProgramsByDepartmentId(deptId)
    else list = await apiListAllPrograms()

    programs.value = list
    buildDeptIndexFromPrograms(list)
    applySort()
    page.value = 1
  } catch (e) {
    console.error('applyFiltersToList failed:', e)
  } finally {
    searching.value = false
  }
}
function handleFiltersUpdate(f) {
  selectedDeptLabel.value = f.department || 'All'
  applyFiltersToList()
}
function handleClearFilters() {
  selectedDeptLabel.value = 'All'
  applyFiltersToList()
}
function handleFilterChange() {}

/* sorting */
function onSort({ field, direction }) {
  sortField.value = field
  sortDirection.value = direction
  applySort()
  page.value = 1
}
function applySort() {
  const f = sortField.value; const dir = sortDirection.value
  if (!f) return
  programs.value = [...programs.value].sort((a,b) => {
    let av = a[f]; let bv = b[f]
    if (typeof av === 'string') { av = av.toLowerCase(); bv = String(bv||'').toLowerCase() }
    if (av < bv) return dir === 'asc' ? -1 : 1
    if (av > bv) return dir === 'asc' ? 1 : -1
    return 0
  })
}

/* delete */
const programToDelete = ref(null)
function askDelete(row) { programToDelete.value = row?.id; confirmDeleteProgram() }
async function confirmDeleteProgram() {
  const id = programToDelete.value
  if (!id) return
  try { await apiDeleteProgram(id); await applyFiltersToList() }
  catch (err) { alert(err?.response?.data?.message || err?.message || 'Delete failed') }
  finally { programToDelete.value = null }
}

/* create / edit */
function onCreated() { openCreate.value = false; applyFiltersToList() }
function openEditFor(p) { editingProgram.value = { ...p }; openEdit.value = true }
async function onUpdated() { openEdit.value = false; await applyFiltersToList() }

/* debounce search */
let t; function debouncedFetch(){ clearTimeout(t); t = setTimeout(() => applyFiltersToList(), 300) }

/* pagination handlers (events from Pagination.vue) */
function handlePageChange() { /* no-op, slicing done in computed */ }
function handlePageSizeChange() { page.value = 1 }

/* keep page valid when list length or size changes */
watch(() => programs.value.length, () => {
  if ((page.value - 1) * pageSize.value >= programs.value.length) page.value = 1
})
watch(pageSize, () => { page.value = 1 })

/* media query watcher */
function attachMQ() {
  const mqPhone = window.matchMedia('(max-width: 768px)')
  const update = () => { isPhone.value = !!mqPhone.matches }
  update()
  mqPhone.addEventListener?.('change', update) || mqPhone.addListener?.(update)
  return () => mqPhone.removeEventListener?.('change', update) || mqPhone.removeListener?.(update)
}
let detachMQ = null
onMounted(async () => {
  await fetchCatalog()
  detachMQ = attachMQ()
})
onUnmounted(() => { if (detachMQ) detachMQ() })
</script>

<style scoped>
.overflow-x-auto { -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }
:deep(table) { table-layout: auto; }

/* Phones (≤768px) */
@media (max-width: 768px) {
  :deep(table) { min-width: 900px; }

  :deep(thead th:first-child),
  :deep(tbody td:first-child) {
    position: sticky; left: 0; background: #fff; z-index: 2;
    width: 56px; min-width: 56px; box-shadow: 2px 0 0 rgba(0,0,0,.04);
  }
  :deep(thead th:last-child),
  :deep(tbody td:last-child) {
    position: sticky; right: 0; background: #fff; z-index: 2;
    width: 78px; min-width: 78px; box-shadow: -2px 0 0 rgba(0,0,0,.04);
  }
  :deep(thead th:nth-child(2)),
  :deep(tbody td:nth-child(2)) {
    white-space: normal; word-break: break-word; line-height: 1.25;
  }
  :deep(thead th:nth-child(3)),
  :deep(tbody td:nth-child(3)) {
    white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
  }
}

/* Tablets (769px–1180px) */
@media (min-width: 769px) and (max-width: 1180px) {
  :deep(table) { min-width: 1080px; }
  :deep(thead th:first-child),
  :deep(tbody td:first-child) {
    position: sticky; left: 0; background: #fff; z-index: 2;
    width: 64px; min-width: 64px; box-shadow: 2px 0 0 rgba(0,0,0,.04);
  }
  :deep(thead th:last-child),
  :deep(tbody td:last-child) {
    position: sticky; right: 0; background: #fff; z-index: 2;
    width: 84px; min-width: 84px; box-shadow: -2px 0 0 rgba(0,0,0,.04);
  }
  :deep(thead th:nth-child(2)),
  :deep(tbody td:nth-child(2)) {
    white-space: normal; word-break: break-word;
  }
}
</style>
