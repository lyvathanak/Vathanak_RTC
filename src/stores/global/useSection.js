import { ref, computed } from 'vue'
import api from '@/stores/apis/axios'

const sections = ref([])
const loading = ref(false)
const error = ref(null)

/** Normalize and keep sections as array always */
function setSectionsSafe(value) {
  if (!Array.isArray(value)) { sections.value = []; return }
  sections.value = value.map(s => ({
    id: s.id ?? s.sub_department_id ?? s.section_id ?? null,
    name: s.name ?? s.sub_department_name ?? s.section_name ?? '',
    department_id: s.department_id ?? s.parent_department_id ?? s.dept_id ?? null,
    description: s.description ?? '',
    department: s.department ?? null,
    __raw: s,
  }))
}

/** Pull an array from many possible API shapes (flat or paginated) */
function pickArrayFromResponse(d) {
  if (Array.isArray(d)) return d
  const keys = ['sub_department', 'all_sub_department', 'sections']
  for (const k of keys) {
    const v = d?.[k]
    if (Array.isArray(v)) return v
    if (v && typeof v === 'object' && Array.isArray(v.data)) return v.data
  }
  return null
}

export function useSection() {
  const sectionOptions = computed(() =>
    Array.isArray(sections.value)
      ? sections.value.map(s => ({
          id: s.id,
          name: s.name,
          value: s.name,
          label: s.name,
          department_id: s.department_id,
          description: s.description,
          department: s.department,
        }))
      : []
  )

  const sectionNames = computed(() =>
    Array.isArray(sections.value) ? sections.value.map(s => s.name) : []
  )

  const sectionsByDepartment = computed(() => (departmentId) =>
    Array.isArray(sections.value)
      ? sections.value.filter(s => String(s.department_id) === String(departmentId))
      : []
  )

  const sectionsGroupedByDepartment = computed(() => {
    const grouped = {}
    if (!Array.isArray(sections.value)) return grouped
    sections.value.forEach(s => {
      const deptId = s.department_id ?? 'unknown'
      if (!grouped[deptId]) grouped[deptId] = { department: s.department ?? null, sections: [] }
      grouped[deptId].sections.push(s)
    })
    return grouped
  })

  const getAllSections = async () => {
    loading.value = true
    error.value = null
    
    try {
      const res = await api.get('/managements/get_all_sub_department')
      const arr = pickArrayFromResponse(res.data)
      
      setSectionsSafe(arr || [])
      
      return { 
        success: true, 
        data: sections.value, 
        count: sections.value.length 
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch sections'
      error.value = errorMessage
      setSectionsSafe([])
      
      return { 
        success: false, 
        error: errorMessage, 
        data: [] 
      }
    } finally {
      loading.value = false
    }
  }

  const getSectionById = (id) =>
    Array.isArray(sections.value)
      ? sections.value.find(s => String(s.id) === String(id)) ?? null
      : null

  const getSectionByName = (name) =>
    Array.isArray(sections.value)
      ? sections.value.find(s => s.name === name) ?? null
      : null

  const getSectionId = (name) => {
    const s = getSectionByName(name)
    return s ? s.id : null
  }

  const getSectionsByDepartmentId = (departmentId) =>
    Array.isArray(sections.value)
      ? sections.value.filter(s => String(s.department_id) === String(departmentId))
      : []

  const getSectionsByDepartmentName = (departmentName) =>
    Array.isArray(sections.value)
      ? sections.value.filter(s => s.department?.department_name === departmentName)
      : []

  const getDepartmentsFromSections = computed(() => {
    const m = new Map()
    if (!Array.isArray(sections.value)) return []
    sections.value.forEach(s => {
      if (s.department && s.department_id != null) m.set(s.department_id, s.department)
    })
    return Array.from(m.values())
  })

  const clearSections = () => { setSectionsSafe([]); error.value = null }
  const refreshSections = async () => { clearSections(); return await getAllSections() }

  const getSectionWithDepartment = (sectionId) => {
    const s = getSectionById(sectionId)
    return s ? { ...s, departmentInfo: s.department ?? null } : null
  }

  return {
    sections: computed(() => sections.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    sectionOptions,
    sectionNames,
    sectionsByDepartment,
    sectionsGroupedByDepartment,
    getDepartmentsFromSections,

    getAllSections,
    getSectionById,
    getSectionByName,
    getSectionId,
    getSectionsByDepartmentId,
    getSectionsByDepartmentName,
    getSectionWithDepartment,
    clearSections,
    refreshSections,
  }
}
