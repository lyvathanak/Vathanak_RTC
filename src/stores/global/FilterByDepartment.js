// src/composables/useFilteredByDepartment.js
import { ref, computed, watch } from 'vue'
import { useDepartment } from '@/stores/global/useDepartment.js'
import { useProgram } from '@/stores/global/useProgram.js'
import { useSection } from '@/stores/global/useSection.js'

/**
 * Generic, source-agnostic department filter.
 *
 * Works with any array of items that carries a department id in one of:
 *   - item.department_id
 *   - item.parent_department_id
 *   - item.dept_id
 *   - item.department?.id
 *
 * You can:
 *   • Pass your own list (items) and it will only filter.
 *   • Or use built-in providers: "programs" | "sections" (it will fetch & filter).
 *
 * @param {Object} opts
 * @param {'programs'|'sections'|null} [opts.provider]  If set, composable will fetch from that store.
 * @param {Array} [opts.items]                           If set, composable filters this array instead of fetching.
 * @param {string|null|number} [opts.defaultDepartmentId] Preselect a department.
 * @param {Function} [opts.customGetDeptId]              Map item -> department id (if your shape is custom).
 * @param {boolean} [opts.immediate=true]                Auto-load when provider is used.
 */
export function useFilteredByDepartment(opts = {}) {
  const {
    provider = null,
    items = null,
    defaultDepartmentId = null,
    customGetDeptId = null,
    immediate = true,
  } = opts

  const selectedDepartmentId = ref(
    defaultDepartmentId != null ? String(defaultDepartmentId) : ''
  )

  // Wire up data providers (optional)
  const { departments, getAllDepartments, loading: deptLoading } = useDepartment()
  const {
    programs, getAllPrograms, loading: progLoading, error: progError
  } = useProgram()
  const {
    sections, getAllSections, loading: secLoading, error: secError
  } = useSection()

  // Unified loading/error
  const loading = computed(() => {
    if (provider === 'programs') return progLoading.value
    if (provider === 'sections') return secLoading.value
    return false || deptLoading.value
  })
  const error = computed(() => {
    if (provider === 'programs') return progError.value
    if (provider === 'sections') return secError.value
    return null
  })

  // Choose the raw source list
  const rawList = computed(() => {
    if (Array.isArray(items)) return items
    if (provider === 'programs') return programs.value
    if (provider === 'sections') return sections.value
    return []
  })

  // Item -> department id resolver (string-safe)
  const getDeptId = (item) => {
    if (typeof customGetDeptId === 'function') return customGetDeptId(item)
    return (
      item?.department_id ??
      item?.parent_department_id ??
      item?.dept_id ??
      item?.department?.id ??
      null
    )
  }

  // Filtered output
  const filtered = computed(() => {
    const deptId = selectedDepartmentId.value
    if (!deptId) return rawList.value
    return (rawList.value || []).filter(
      (it) => String(getDeptId(it)) === String(deptId)
    )
  })

  // Department options (for selects)
  const departmentOptions = computed(() =>
    (departments.value || []).map((d) => ({
      id: d.id,
      value: d.id,
      label: d.department_name,
      name: d.department_name,
    }))
  )

  // API: set/change department
  const setDepartment = (id) => {
    selectedDepartmentId.value = id != null && id !== '' ? String(id) : ''
  }

  // Loader (only needed when using a provider)
  const load = async () => {
    // Always make sure departments exist for the dropdown
    await getAllDepartments()
    if (provider === 'programs') return await getAllPrograms()
    if (provider === 'sections') return await getAllSections()
    return { success: true }
  }

  if (immediate && (provider || !departments.value?.length)) {
    // Fire and forget; caller can also await load()
    load()
  }

  return {
    // state
    selectedDepartmentId,
    loading,
    error,

    // data
    rawList,
    filtered,
    departments,
    departmentOptions,

    // methods
    setDepartment,
    load,
  }
}

/**
 * Small convenience wrappers if you prefer explicit hooks:
 */
export function useProgramsFilteredByDepartment(opts = {}) {
  return useFilteredByDepartment({ provider: 'programs', ...opts })
}
export function useSectionsFilteredByDepartment(opts = {}) {
  return useFilteredByDepartment({ provider: 'sections', ...opts })
}
