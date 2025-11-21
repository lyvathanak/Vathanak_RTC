import api from '@/stores/apis/axios'

export async function getStudentProfile(studentId) {
  try {
    const response = studentId
      ? await api.get(`/auth/get_detail_user/${studentId}`) // path param
      : await api.get('/auth/get_detail_user');             // token-based

    return response.data;
  } catch (error) { 
    console.error('❌ Error fetching student profile:', error);
    throw error;
  }
}
