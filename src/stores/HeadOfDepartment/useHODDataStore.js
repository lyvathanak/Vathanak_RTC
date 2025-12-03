import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/Authentication/authStore';
import api from '@/stores/apis/axios';

// ✅ IMPORT THE NEW SERVICE
import HODDataService from '@/services/HODDataServices';

export const useHODDataStore = defineStore('hodData', () => {
  const authStore = useAuthStore();

  const students = ref([]);
  const teachers = ref([]);
  const leaveRequests = ref([]);
  const timeSlots = ref([]);
  
  const kpiStats = ref({
    students: 0,
    teachers: 0,
    leavePending: 0,
    leaveApproved: 0,
    leaveRejected: 0,
    leaveTotal: 0
  });
  
  const isLoading = ref(false);
  const error = ref(null);

  const currentDepartment = computed(() => {
    const user = authStore.user || {};
    const detail = user.user_detail || user.profile || {};
    const headDept = user.head_department || {}; 

    // Priority: HOD relation -> User Detail -> Root User
    const id = headDept.id || detail.department_id || user.department_id || null;
    const name = headDept.department_name || detail.department || user.department || null;

    return { id, name };
  });

  const ensureDepartmentId = async () => {
    if (currentDepartment.value.id) return currentDepartment.value.id;
    try {
      const res = await api.get('/auth/get_detail_user');
      if (res.data?.user) {
        authStore.user = res.data.user;
        const user = res.data.user;
        return user.head_department?.id || user.user_detail?.department_id || user.department_id;
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
    }
    return null;
  };

  /**
   * Actions using the new Service
   */
  const loadDashboardData = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const deptId = await ensureDepartmentId();
      
      if (!deptId) {
        console.warn("⚠️ HOD Store: Could not identify department ID.");
        // Stop here to prevent 403 calls with null ID
        return;
      }

      // 1. Fetch Teachers
      const teacherRes = await HODDataService.getTeachers(deptId);
      if (teacherRes.success) {
        teachers.value = teacherRes.data;
        kpiStats.value.teachers = teacherRes.total;
      }

      // 2. Fetch Students
      const studentRes = await HODDataService.getStudents(deptId);
      if (studentRes.success) {
        students.value = studentRes.data;
        kpiStats.value.students = studentRes.total;
      }

      // 3. Fetch Leave Requests
      const leaveRes = await HODDataService.getLeaveRequests(deptId);
      if (leaveRes.success) {
        leaveRequests.value = leaveRes.data;
        kpiStats.value.leaveTotal = leaveRes.total;
        kpiStats.value.leavePending = leaveRequests.value.filter(r => r.status?.toLowerCase() === 'pending').length;
      }

      // 4. Fetch TimeTable
      const timeRes = await HODDataService.getTimeTable(deptId);
      if (timeRes.success) {
        timeSlots.value = timeRes.data;
      }

    } catch (err) {
      console.error("Global HOD Load Error:", err);
      error.value = "Some data failed to load.";
    } finally {
      isLoading.value = false;
    }
  };

  // Wrapper actions for individual pages
  const fetchTeachers = async () => {
    const id = await ensureDepartmentId();
    if(id) {
      const res = await HODDataService.getTeachers(id);
      if(res.success) teachers.value = res.data;
    }
  };

  const fetchStudents = async () => {
    const id = await ensureDepartmentId();
    if(id) {
      const res = await HODDataService.getStudents(id);
      if(res.success) students.value = res.data;
    }
  };

  return {
    students,
    teachers,
    leaveRequests,
    timeSlots,
    kpiStats,
    isLoading,
    error,
    currentDepartment,
    loadDashboardData,
    fetchTeachers,
    fetchStudents
  };
});