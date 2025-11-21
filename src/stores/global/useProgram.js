import { ref, computed } from 'vue'
import api from '@/stores/apis/axios'

// Global state for programs
const programs = ref([])
const loading = ref(false)
const error = ref(null)

export function useProgram() {
  // UI-friendly option list
  const programOptions = computed(() =>
    programs.value.map(p => ({
      id: p.id,
      name: p.program_name,
      value: p.program_name,
      label: p.program_name,
      degree_level: p.degree_level,
      duration_years: p.duration_years,
      department_id: p.department_id,
      sub_department_id: p.sub_department_id,
    }))
  )

  const programNames = computed(() => programs.value.map(p => p.program_name))

  // Display helpers
  const programListForUI = computed(() =>
    programs.value.map(p => ({
      ...p,
      department_name: p.department?.department_name ?? null,
      label: p.sub_department_id
        ? `${p.program_name} — ${p.department?.department_name ?? 'Dept'} / Sub #${p.sub_department_id}`
        : `${p.program_name} — ${p.department?.department_name ?? 'Dept'}`
    }))
  )

  // Common grouped view
  const programsGroupedByDepartment = computed(() => {
    const g = {}
    for (const p of programs.value) {
      const key = String(p.department_id ?? 'null')
      if (!g[key]) g[key] = []
      g[key].push(p)
    }
    return g
  })

  // Server fetch
  const getAllPrograms = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/managements/get_all_program')
      if (response.data.programs) programs.value = response.data.programs
      else if (response.data.all_program) programs.value = response.data.all_program
      else if (Array.isArray(response.data)) programs.value = response.data
      else { programs.value = []; console.warn('⚠️ Unexpected API response structure:', response.data) }
      return { success: true, data: programs.value, count: programs.value.length }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch programs'
      return { success: false, error: error.value, data: [] }
    } finally {
      loading.value = false
    }
  }

  // Finders
  const getProgramById = (id) =>
    programs.value.find(p => String(p.id) === String(id)) || null

  const getProgramByName = (name) =>
    programs.value.find(p => p.program_name === name) || null

  const getProgramId = (programName) => {
    const p = programs.value.find(p => p.program_name === programName)
    return p ? p.id : null
  }

  // Filters (string-safe compares)
  const getProgramsByDepartmentId = (departmentId) =>
    programs.value.filter(p => String(p.department_id) === String(departmentId))

  const getProgramsBySubDepartmentId = (subDepartmentId) =>
    programs.value.filter(p => String(p.sub_department_id) === String(subDepartmentId))

  const programsByDepartment = computed(() => (departmentId) =>
    programs.value.filter(p => String(p.department_id) === String(departmentId))
  )

  const programsByDegreeLevel = computed(() => (degreeLevel) =>
    programs.value.filter(p => p.degree_level === degreeLevel)
  )

  // Extra handy helpers
  const getProgramsByDepartmentName = (deptName) =>
    programs.value.filter(p => (p.department?.department_name ?? '') === deptName)

  const getProgramsByDegreeAndDepartment = (degree, deptId) =>
    programs.value.filter(p =>
      String(p.department_id) === String(deptId) && p.degree_level === degree
    )

  // Unique sets for filters
  const getDegreeLevels = computed(() =>
    [...new Set(programs.value.map(p => p.degree_level))].filter(Boolean)
  )

  const getDurationYears = computed(() =>
    [...new Set(programs.value.map(p => p.duration_years))].filter(Boolean)
  )

  const clearPrograms = () => { programs.value = []; error.value = null }
  const refreshPrograms = async () => { clearPrograms(); return await getAllPrograms() }

  return {
    // state
    programs: computed(() => programs.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // computed
    programOptions,
    programNames,
    programsByDepartment,
    programsByDegreeLevel,
    programListForUI,
    programsGroupedByDepartment,
    getDegreeLevels,
    getDurationYears,

    // methods
    getAllPrograms,
    getProgramById,
    getProgramByName,
    getProgramId,
    getProgramsByDepartmentId,
    getProgramsBySubDepartmentId,
    getProgramsByDepartmentName,
    getProgramsByDegreeAndDepartment,
    clearPrograms,
    refreshPrograms
  }
}
