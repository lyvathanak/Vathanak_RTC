import api from '@/stores/apis/axios';

/**
 * Specialized Service for Head of Department Data Fetching
 * Bypasses generic CRUD wrappers to prevent 403 Forbidden errors
 */
export const HODDataService = {

    /**
     * Fetch Students by Department
     * Uses '/users/get_all_users' instead of '/students' to align with role-based filtering
     */
    async getStudents(departmentId) {
        if (!departmentId) return { success: false, message: 'No Dept ID' };

        try {
            // Direct call to users endpoint with role & department filters
            const response = await api.get('/users/get_all_users', {
                params: {
                    role: 'student',
                    department_id: departmentId
                }
            });

            // Map the response to a clean list (handling API variations)
            const users = response.data?.users?.data || response.data?.data || [];
            return { success: true, data: users, total: response.data?.users?.total || users.length };
        } catch (error) {
            console.error('HOD Service: Student Fetch Error', error);
            return { success: false, error: error };
        }
    },

    /**
     * Fetch Teachers by Department
     * Bypasses TeacherCRUD.searchTeachers which incorrectly fetches "All" first
     */
    async getTeachers(departmentId) {
        if (!departmentId) return { success: false, message: 'No Dept ID' };

        try {
            const response = await api.get('/users/get_all_users', {
                params: {
                    role: 'staff',
                    department_id: departmentId
                }
            });

            const users = response.data?.users?.data || response.data?.data || [];
            return { success: true, data: users, total: response.data?.users?.total || users.length };
        } catch (error) {
            console.error('HOD Service: Teacher Fetch Error', error);
            return { success: false, error: error };
        }
    },

    /**
     * Fetch Leave Requests
     */
    async getLeaveRequests(departmentId) {
        if (!departmentId) return { success: false, message: 'No Dept ID' };

        try {
            const response = await api.get('/request/get_all_leave_request', {
                params: { department_id: departmentId }
            });

            const requests = response.data?.requests?.data || response.data?.data || [];
            return { success: true, data: requests, total: response.data?.requests?.total || requests.length };
        } catch (error) {
            console.error('HOD Service: Leave Request Error', error);
            // Return empty on 403 so UI doesn't crash
            return { success: false, data: [], error };
        }
    },

    /**
     * Fetch TimeTable
     */
    async getTimeTable(departmentId) {
        if (!departmentId) return { success: false, message: 'No Dept ID' };

        try {
            const response = await api.get('/time_table/get_all_time_slots', {
                params: { department_id: departmentId }
            });

            const slots = response.data?.time_slots?.data || response.data?.slots || [];
            return { success: true, data: slots };
        } catch (error) {
            console.error('HOD Service: TimeTable Error', error);
            return { success: false, data: [], error };
        }
    }
};

export default HODDataService;