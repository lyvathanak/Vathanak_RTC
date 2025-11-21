import api from '@/stores/apis/axios'

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.current_password - Current password
 * @param {string} passwordData.new_password - New password
 * @param {string} passwordData.new_password_confirmation - New password confirmation
 * @returns {Promise<Object>} Response from API
 */
export async function changePassword(passwordData) {
  try {
    const response = await api.put('/auth/change_password', {
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
      new_password_confirmation: passwordData.new_password_confirmation
    })

    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Password changed successfully'
    }
  } catch (error) {
    console.error('❌ Error changing password:', error)
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to change password',
      errors: error.response?.data?.errors || {}
    }
  }
}
