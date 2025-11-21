import StudentDashboard from '@/views/students/Overview.vue';
import { requireRole } from './guards.js';

export const studentRoutes = [
  {
    path: '/:lang(en|fr|kh)/student',
    // name: 'StudentLayout',
    meta: { requiresAuth: true, role: 'Student' },
    beforeEnter: requireRole('Student'),
    component: () => import('@/views/students/Dashboard.vue'),
    children: [
      // Redirect student root to overview
      {
        path: '',
        redirect: to => `${to.path}/overview`
      },
      {
        path: 'overview',
        name: 'StudentOverview',
        component: StudentDashboard,
        meta: { title: 'Student Overview' }
      },
      {
        path: 'academic-info',
        name: 'StudentAcademicInformation',
        component: () => import('@/views/students/AcademicInformation.vue'),
      },
      {
        path: 'leave-request',
        name: 'StudentLeaveRequest',
        component: () => import('@/views/students/LeaveRequest.vue'),
        meta: { title: 'Leave Request' }
      },
      {
        path: 'student-profile',
        name: 'StudentProfile',
        component: () => import('@/views/students/StudentProfile.vue'),
        meta: { title: 'Student Profile' }
      }, 
      {
        path: 'change-password',
        name: 'StudentChangePassword',
        component: () => import('@/views/Authentication/ChangePassword.vue'),
        meta: { title: 'Change Password' }
      },
      // Catch-all route for invalid student paths
      {
        path: ':pathMatch(.*)*',
        redirect: to => `/${to.params.lang}/student/overview`
      }
    ]
  }
];


