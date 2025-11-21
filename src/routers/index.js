
// import Login from '@/views/Authentication/Login.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { requireAuth, redirectIfAuthenticated } from './guards.js';

// Import role-specific routes
import { adminRoutes } from './admin.js';
import { hodRoutes } from './head_of_department.js';
import { teacherRoutes } from './teacher.js';
import { studentRoutes } from './student.js';


const routes = [
    // Redirect root to default language login
    {
        path: '/',
        redirect: '/en/login',
    },
    
    // Login route with redirect guard for authenticated users
    {
        path: '/:lang(en|fr|kh)/login',
        name: 'Login',
        component: () => import('@/views/Authentication/Login.vue'),
        beforeEnter: redirectIfAuthenticated
    },
    {
        path: '/:lang(en|fr|kh)/forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/Authentication/ForgotPassword.vue'),
        beforeEnter: redirectIfAuthenticated,
    },
    {
        path: '/:lang(en|fr|kh)/otp',
        name: 'OTP',
        component: () => import('@/views/Authentication/OTP.vue'),
        beforeEnter: redirectIfAuthenticated,
    },
    
    // Testing route (for development/testing only)
    {
        path: '/:lang(en|fr|kh)/test-student-management',
        name: 'TestStudentManagement',
        component: () => import('@/views/TestStudentManagement.vue'),
        meta: { requiresAuth: false } // Remove this in production
    },
    
    // Role-specific routes
    ...adminRoutes,
    ...hodRoutes,
    ...teacherRoutes,
    ...studentRoutes,

    // Global catch-all route for any invalid paths
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/404.vue')
    },

    

];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// Navigation guard to sync route language with i18n locale
router.beforeEach(async (to, from, next) => {
    const locale = to.params.lang;
    
    if (locale) {
        try {
            const { i18n } = await import('@/main.js');
            if (i18n.global.locale.value !== locale) {
                i18n.global.locale.value = locale;
                console.log('Route changed locale to:', locale);
            }
        } catch (error) {
            console.error('Error setting locale:', error);
        }
    }
    
    next();
});

export default router;