import HeadOfDepartmentDashboard from '@/views/head-of-departments/Overview.vue';
import { requireRole } from './guards.js';

export const hodRoutes = [
  {
    path: '/:lang(en|fr|kh)/hod',
    // name: 'HodLayout',
    meta: { requiresAuth: true, role: 'Head_Department' },
    beforeEnter: requireRole('Head_Department'),
    component: () => import('@/views/head-of-departments/Dashboard.vue'),
    children: [
      // Redirect hod root to overview
      {
        path: '',
        redirect: to => `${to.path}/overview`
      },
      {
        path: 'overview',
        name: 'HeadOfDepartmentOverview',
        component: HeadOfDepartmentDashboard,
        meta: { title: 'Department Overview' }
      },
      {
        path: 'student-management',
        name: 'HODStudentManagement',
        component: () => import('@/views/head-of-departments/StudentManagement.vue'),
      },
      {
        path: 'teacher-management',
        name: 'HODTeacherManagement',
        component: () => import('@/views/head-of-departments/TeacherManagement.vue'),
      },
      {
        path: 'timetable',
        name: 'HODTimeTable',
        component: () => import('@/views/head-of-departments/TimeTable.vue'),
      },
      {
        path: 'leave-requests',
        name: 'HODLeaveRequest',
        component: () => import('@/views/head-of-departments/LeaveRequest.vue'),
      },
      {
        path: 'change-password',
        name: 'HODChangePassword',
        component: () => import('@/views/Authentication/ChangePassword.vue'),
        meta: { title: 'Change Password' }
      },
      // Catch-all route for invalid HOD paths
      {
        path: ':pathMatch(.*)*',
        redirect: to => `/${to.params.lang}/hod/overview`
      }
    ]
  }
];