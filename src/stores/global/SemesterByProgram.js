// src/stores/apis/semester.js
import api from '@/stores/apis/axios'

/**
 * Fetch semesters by program ID
 * @param {number|string} programId - Program ID to fetch semesters for
 * @returns {Promise<Object[]>} - List of semester objects
 */
export async function getSemestersByProgram(programId) {
  try {
    const response = await api.get(`/managements/get_semesters_by_program/${programId}`)
    // assuming your backend returns { semesters: [...] }
    return response.data.semesters || []
  } catch (error) {
    console.error('❌ Error fetching semesters:', error)
    throw error
  }
}
