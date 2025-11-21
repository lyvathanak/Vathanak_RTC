<template>
  <div class="flex flex-col gap-4 py-5">
    <!-- Top bar -->
    <div class="px-3 sm:px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!-- Search -->
      <div class="relative w-full md:w-[28rem]">
        <input
          v-model="search"
          type="text"
          placeholder="Search departments…"
          class="w-full h-10 rounded-xl border px-10 pr-3 outline-none focus:ring-2 focus:ring-[#235AA6]"
        />
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="onAdd"
          class="h-10 inline-flex items-center gap-2 rounded-xl bg-[#235AA6] text-white px-4 font-semibold hover:bg-[#1f4f93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#235AA6]"
        >
          <Plus class="w-4 h-4" /><span class="text-sm">Add Department</span>
        </button>

        <button
          :disabled="exporting || loading"
          @click="onExport"
          class="h-10 inline-flex items-center gap-2 rounded-xl border bg-white text-gray-700 px-4 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
        >
          <Download class="w-4 h-4" /><span class="text-sm">{{ exporting ? 'Exporting…' : 'Export' }}</span>
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="error" class="px-3 sm:px-5">
      <div class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>
    </div>

    <!-- Listing -->
    <div class="px-3 sm:px-5">
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table class="w-full dept-table">
          <thead class="bg-gray-50 border-b">
            <tr class="text-xs font-medium text-gray-500 uppercase">
              <th class="px-4 py-3 sticky-left text-left w-[70px]">ID</th>
              <th class="px-6 py-3 text-left col-name">Department</th>
              <th class="px-4 py-3 text-left sticky-right w-[88px]">Actions</th>
            </tr>
          </thead>

          <tbody v-if="!loading && pagedRows.length" class="divide-y">
            <tr v-for="d in pagedRows" :key="d.id" class="hover:bg-gray-50">
              <!-- ID -->
              <td class="px-4 py-4 sticky-left bg-white text-sm whitespace-nowrap">{{ d.id }}</td>

              <!-- Department -->
              <td class="px-6 py-4 text-sm col-name">
                <div class="name-3lines font-semibold text-gray-900">
                  {{ d.name }}
                </div>
                <div class="desc-ellipsis text-gray-500 text-xs md:text-sm" :title="d.description">
                  {{ d.description }}
                </div>
              </td>

              <!-- Actions -->
              <td class="px-4 py-4 sticky-right bg-white">
                <div class="flex items-center gap-2">
                  <button
                    class="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 px-2.5 py-1.5 transition-colors"
                    title="View"
                    @click="onView(d)"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    class="inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 transition-colors"
                    title="Delete"
                    @click="requestDelete(d)"
                    :disabled="deletingId === d.id"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="loading">
            <tr><td colspan="3" class="px-6 py-10 text-center text-gray-500">Loading…</td></tr>
          </tbody>
          <tbody v-else>
            <tr><td colspan="3" class="px-6 py-10 text-center text-gray-500">No departments found.</td></tr>
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
        :total-items="pagedTotal"
        :page-size-options="[5,10,25,50,100]"
        item-label="Departments"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>

    <!-- Delete dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @keydown.esc.prevent="closeDeleteDialog"
    >
      <div class="bg-white w/full max-w-sm rounded-xl shadow-xl p-6" role="dialog" aria-modal="true">
        <div class="flex items-center gap-3 mb-3">
          <h3 class="text-lg font-semibold text-gray-900">Confirm Delete</h3>
        </div>
        <p class="text-sm text-gray-600 mb-6">
          Are you sure you want to delete
          <span class="font-medium">{{ deletingItem?.name }}</span>?
          This action cannot be undone.
        </p>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                  @click="closeDeleteDialog" :disabled="deletingId === deletingItem?.id">
            Cancel
          </button>
          <button class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  @click="confirmDelete" :disabled="deletingId === deletingItem?.id">
            {{ deletingId === deletingItem?.id ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddDepartmentModal v-model="showAdd" @saved="handleDeptSaved" />
    <EditDepartmentModal v-model="showEdit" :department="editRow" @saved="loadAll" />
    <ViewDepartmentModal
      :model-value="isViewOpen"
      :department="viewRow"
      @update:modelValue="val => { if (!val) closeView() }"
      @saved="handleViewSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/stores/apis/axios'
import { showNotification } from '@/lib/notifications.js'
import { Plus, Download, Search, Eye, Trash2 } from 'lucide-vue-next'
import Pagination from '@/components/features/Pagination.vue'
import AddDepartmentModal from '@/components/admins/department/AddDepartmentModal.vue'
import ViewDepartmentModal from '@/components/admins/department/ViewDepartmentModal.vue'
import EditDepartmentModal from '@/components/admins/department/EditDepartmentModal.vue'

/* Router */
const route = useRoute()
const router = useRouter()

/* State */
const loading = ref(false)
const error = ref(null)
const raw = ref([])

const search = ref('')
const page = ref(1)
const pageSize = ref(25)
const deletingId = ref(null)
const exporting = ref(false)

const showAdd = ref(false)
const showEdit = ref(false)
const editRow  = ref(null)

const showDeleteDialog = ref(false)
const deletingItem = ref(null)

/* View modal (route-driven) */
const isViewOpen = computed(() => !!route.params.deptId)
const viewRow = ref(null)
function onView(d){
  router.push({ name: 'AdminDepartmentDetails', params: { lang: route.params.lang, deptId: d.id } })
}
function closeView(){
  router.push({ name: 'AdminDepartmentManagement', params: { lang: route.params.lang } })
}
watchEffect(() => {
  const id = route.params.deptId
  if (!id) { viewRow.value = null; return }
  viewRow.value = raw.value.find(r => String(r.id) === String(id)) || null
})

/* Normalizer */
function toRow(it) {
  return {
    id: it.id,
    code: it.code ?? '',
    name: it.department_name ?? it.name ?? '',
    description: it.description ?? '',
    __program: '—',
    __hod: it.head_of_department ?? 'Not Assigned',
    __status: 'Active',
    active: true,
    _raw: it,
  }
}

/* Loaders */
async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/managements/get_all_department')
    const arr = Array.isArray(data?.all_department) ? data.all_department : []
    raw.value = arr.map(toRow)
    if (!raw.value.length) {
      error.value = 'No departments found.'
    }
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Load failed'
    error.value = msg
    raw.value = []
  } finally { loading.value = false }
}

async function loadSearch(q) {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/managements/search_department', { params: { search: q } })
    const arr = Array.isArray(data?.departments?.data) ? data.departments.data : []
    raw.value = arr.map(toRow)
    if (!raw.value.length) {
      error.value = `No results for "${q}".`
    }
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || 'Search failed'
    error.value = msg
    raw.value = []
  } finally { loading.value = false }
}

/* Choose endpoint */
async function load() {
  const q = search.value.trim()
  page.value = 1
  if (q) return loadSearch(q)
  return loadAll()
}
onMounted(load)

/* Debounce search */
let searchTimer
watch(search, () => { clearTimeout(searchTimer); searchTimer = setTimeout(load, 300) })

/* Pagination */
const pagedTotal = computed(() => raw.value.length)
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return raw.value.slice(start, start + pageSize.value)
})
function handlePageChange() { /* slicing handled by computed */ }
function handlePageSizeChange(){ page.value = 1 }

/* keep page valid if data shrinks or size changes */
watch(() => raw.value.length, () => {
  if ((page.value - 1) * pageSize.value >= raw.value.length) page.value = 1
})
watch(pageSize, () => { page.value = 1 })

/* Create */
function onAdd(){ showAdd.value = true }
async function handleDeptSaved (payload) {
  // close modal
  showAdd.value = false
  // optimistic insert to top if payload provided
  if (payload?.id) raw.value.unshift(toRow(payload))
  page.value = 1
  // single success toast (child stays silent)
  showNotification('Department created successfully!', 'success')
  // sync with server
  await loadAll()
}

/* If View modal edits & emits "saved" */
async function handleViewSaved () {
  await loadAll()
  showNotification('Department updated successfully!', 'success')
}

/* Delete */
function requestDelete(d) { deletingItem.value = d; showDeleteDialog.value = true }
function closeDeleteDialog() { showDeleteDialog.value = false; deletingItem.value = null }

async function confirmDelete() {
  const d = deletingItem.value
  if (!d) return
  deletingId.value = d.id
  error.value = null
  try {
    await api.delete(`/managements/delete_department/${d.id}`)
    raw.value = raw.value.filter(row => row.id !== d.id)
    closeDeleteDialog()
    showNotification('Department deleted successfully!', 'success')
  } catch (e) {
    const msg = `Delete failed: ${e?.response?.data?.message || e?.message || 'Unknown error'}`
    error.value = msg
    showNotification(msg, 'error')
  } finally { deletingId.value = null }
}

/* Export */
function onExport() {
  try {
    exporting.value = true
    const rows = pagedRows.value
    if (!rows.length) {
      showNotification('Nothing to export.', 'warning')
      return
    }
    const headers = ['Department ID','Code','Department','Description','Program','Head of Department','Status']
    const csvRows = [headers]
    for (const r of rows) {
      csvRows.push([
        r.id,
        r.code ?? '',
        sanitizeCSV(r.name),
        sanitizeCSV(r.description),
        sanitizeCSV(r.__program),
        sanitizeCSV(r.__hod?.name || r.__hod),
        r.__status,
      ])
    }
    const csv = csvRows.map(r => r.map(fieldToCSV).join(',')).join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dt = new Date()
    const ts = `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}_${String(dt.getHours()).padStart(2,'0')}${String(dt.getMinutes()).padStart(2,'0')}`
    a.href = url
    a.download = `departments_${ts}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotification(`Exported ${rows.length} department${rows.length>1?'s':''}.`, 'success')
  } finally { exporting.value = false }
}
function sanitizeCSV(v){ return v == null ? '' : String(v) }
function fieldToCSV(v){ const s = String(v ?? ''); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s }

/* Misc */
const openChip = ref(null)
function handleClickOutside(e) {
  const inMenuOrChip = e.target.closest('.rounded-lg.shadow-lg, .rounded-full')
  if (!inMenuOrChip) openChip.value = null
}
onMounted(() => document.addEventListener('click', handleClickOutside, true))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside, true))
</script>

<style scoped>
.table-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }
.dept-table { table-layout: auto; }

/* Sticky edges */
.sticky-left  { position: sticky; left: 0;  z-index: 2; background:#fff; box-shadow: 2px 0 0 rgba(0,0,0,.04); }
.sticky-right { position: sticky; right: 0; z-index: 2; background:#fff; box-shadow: -2px 0 0 rgba(0,0,0,.04); }

/* Column helpers */
.col-name { white-space: normal; word-break: break-word; }

/* Multi-line name (max 3 lines, then ellipsis) */
.name-3lines{
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.25;
}

/* Description: single-line ellipsis */
.desc-ellipsis{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Phones / narrow */
@media (max-width: 768px) {
  .dept-table th, .dept-table td { padding-top: 10px; padding-bottom: 10px; }
  .col-name { min-width: 320px; }
}

/* Very small */
@media (max-width: 380px) {
  .dept-table { min-width: 0; }
  .col-name { min-width: 0; }
  .dept-table th, .dept-table td { padding-left: 10px; padding-right: 10px; }
}
</style>
