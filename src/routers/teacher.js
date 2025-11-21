import TeacherDashboard from '@/views/teachers/Overview.vue';
import { requireRole } from './guards.js';

export const teacherRoutes = [
  {
    path: '/:lang(en|fr|kh)/teacher',
    // name: 'TeacherLayout',
    meta: { requiresAuth: true, role: 'Teacher' },
    beforeEnter: requireRole('Teacher'),
    component: () => import('@/views/teachers/Dashboard.vue'),
    children: [
      // Redirect teacher root to overview
      {
        path: '',
        redirect: to => `${to.path}/overview`
      },
      {
        path: 'overview',
        name: 'TeacherOverview',
        component: TeacherDashboard,
        meta: { title: 'Teacher Overview' }
      },
      {
        path: 'student-info',
        name: 'TeacherStudentInformation',
        component: () => import('@/views/teachers/StudentInformation.vue'),
      },
      {
        path: 'teacher-info',
        name: 'TeacherTeacherInformation',
        component: () => import('@/views/teachers/TeacherInformation.vue'),
      },
      {
        path: 'timetable',
        name: 'TeacherTimeTable',
        component: () => import('@/views/teachers/TimeTable.vue'),
      },
      {
        path: 'exam-scoring',
        name: 'TeacherExamScoring',
        component: () => import('@/views/teachers/ExamScoring.vue'),
      },
      {
        path: 'leave-request',
        name: 'TeacherLeaveRequest',
        component: () => import('@/views/teachers/LeaveRequest.vue'),
      },
      {
        path: 'teacher-profile',
        name: 'TeacherProfile',
        component: () => import('@/views/teachers/TeacherProfile.vue'),
        meta: { title: 'Teacher Profile' }
      },
      {
        path: 'change-password',
        name: 'TeacherChangePassword',
        component: () => import('@/views/Authentication/ChangePassword.vue'),
        meta: { title: 'Change Password' }
      },
      // Catch-all route for invalid teacher paths
      {
        path: ':pathMatch(.*)*',
        redirect: to => `/${to.params.lang}/teacher/overview` 
      }
    ]
  }
];