import AdminDashboard from '@/views/admins/Overview.vue';
import { requireRole } from './guards.js';

export const adminRoutes = [
  {
    path: '/:lang(en|fr|kh)/admin',
    // name: 'AdminLayout',
    meta: { requiresAuth: true, role: 'Admin' },
    beforeEnter: requireRole('Admin'),
    component: () => import('@/views/admins/Dashboard.vue'),
    children: [
      // Redirect admin root to overview
      {
        path: '',
        redirect: to => `${to.path}/overview`
      },
      {
        path: 'overview',
        name: 'AdminOverview',
        component: () => import('@/views/admins/Overview.vue'),
      },
      {
        path: 'students',
        name: 'AdminStudentManagement',
        component: () => import('@/views/admins/StudentManagement.vue'),
      },
      {
        path: 'teachers',
        name: 'AdminTeacherManagement',
        component: () => import('@/views/admins/TeacherManagement.vue'),
      },
      {
        path: 'hod',
        name: 'AdminHODManagement',
        component: () => import('@/views/admins/HODManagement.vue'),
      },
      {
        path: 'programs',
        name: 'AdminProgramManagement',
        component: () => import('@/views/admins/ProgramManagement.vue'),
      },
      {
        path: 'departments',
        name: 'AdminDepartmentManagement',
        component: () => import('@/views/admins/DepartmentManagement.vue'),
      },
       {
        path: 'departments/:deptId',
        name: 'AdminDepartmentDetails',
        component: () => import('@/views/admins/DepartmentManagement.vue'),
        props: true, // exposes route.params.deptId to the page if you want
      },
      {
        path: 'subjects',
        name: 'AdminSubjectManagement',
        component: () => import('@/views/admins/SubjectManagement.vue'),
      },
      {
        path: 'groups',
        name: 'AdminGroupManagement',
        component: () => import('@/views/admins/GroupManagement.vue'),
      },
      {
        path: 'location',
        name: 'AdminLocationManagement',
        component: () => import('@/views/admins/LocationManagement.vue'),
      },
      {
        path: 'timetable',
        name: 'AdminTimeTable',
        component: () => import('@/views/admins/TimeTable.vue'),
      },
      {
        path: 'leave-requests',
        name: 'AdminLeaveRequestManagement',
        component: () => import('@/views/admins/LeaveRequestManagement.vue'),
      },
      {
        path: 'feedback',
        name: 'AdminFeedbackManagement',
        component: () => import('@/views/admins/Feedback.vue'),
      },
      {
        path: 'admin-profile',
        name: 'AdminProfile',
        component: () => import('@/views/admins/AdminProfile.vue'),
      },
      {
        path: 'change-password',
        name: 'AdminChangePassword',
        component: () => import('@/views/Authentication/ChangePassword.vue'),
      },
      // Catch-all route for invalid admin paths
      {
        path: ':pathMatch(.*)*',
        redirect: to => `/${to.params.lang}/admin/overview`
      }
    ]
  }
];