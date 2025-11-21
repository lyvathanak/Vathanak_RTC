import api from '@/stores/apis/axios'

export async function getAdminProfile(adminId) {
  try {
    const response = adminId
      ? await api.get(`/auth/get_detail_user/${adminId}`) // path param
      : await api.get('/auth/get_detail_user');             // token-based

    return response.data;
  } catch (error) { 
    console.error('❌ Error fetching admin profile:', error);
    throw error;
  }
}
