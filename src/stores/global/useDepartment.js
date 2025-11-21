import { ref, computed } from 'vue'
import api from '@/stores/apis/axios'

// Global state for departments
const departments = ref([])
const loading = ref(false)
const error = ref(null)

export function useDepartment() {
  const departmentOptions = computed(() =>
    departments.value.map(dept => ({
      id: dept.id,
      name: dept.department_name,
      value: dept.department_name,
      label: dept.department_name
    }))
  )

  const departmentNames = computed(() =>
    departments.value.map(dept => dept.department_name)
  )

  const getAllDepartments = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/managements/get_all_department')
      const data = response.data
      
      // Extract departments array from various possible response structures
      departments.value = data.all_department || data.departments || (Array.isArray(data) ? data : [])
      
      return { 
        success: true, 
        data: departments.value, 
        count: departments.value.length 
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch departments'
      error.value = errorMessage
      departments.value = []
      
      return { 
        success: false, 
        error: errorMessage, 
        data: [] 
      }
    } finally {
      loading.value = false
    }
  }

  const getDepartmentById = (id) =>
    departments.value.find(dept => String(dept.id) === String(id)) || null

  const getDepartmentByName = (name) =>
    departments.value.find(dept => dept.department_name === name) || null

  const getDepartmentId = (departmentName) => {
    const dept = departments.value.find(d => d.department_name === departmentName)
    return dept ? dept.id : null
  }

  const clearDepartments = () => {
    departments.value = []
    error.value = null
  }

  const refreshDepartments = async () => {
    clearDepartments()
    return await getAllDepartments()
  }

  return {
    // state
    departments: computed(() => departments.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // computed
    departmentOptions,
    departmentNames,

    // methods
    getAllDepartments,
    getDepartmentById,
    getDepartmentByName,
    getDepartmentId,
    clearDepartments,
    refreshDepartments
  }
}
