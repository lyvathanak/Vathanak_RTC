import { useAuthStore } from '@/stores/Authentication/authStore.js'

// Route guard to check authentication
export const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    // Redirect to login page with current language
    const lang = to.params.lang || 'en'
    next(`/${lang}/login`)
  } else {
    next()
  }
}

// Route guard to check specific role
export const requireRole = (role) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    console.log('🔒 Route guard checking:', {
      userRole: authStore.user?.role,
      requiredRole: role,
      isAuthenticated: authStore.isAuthenticated
    })
    
    if (!authStore.isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login')
      const currentLang = to.params.lang || 'en'
      next(`/${currentLang}/login`)
      return
    }
    
    // Use exact string comparison for roles
    const userRole = authStore.user?.role
    console.log('🔍 Comparing roles:', { userRole, requiredRole: role })
    
    if (userRole === role) {
      console.log('✅ Access granted - exact match')
      next()
    } else {
      // Check for role variations
      const lowerUserRole = userRole?.toLowerCase()?.trim()
      const lowerRequiredRole = role?.toLowerCase()?.trim()
      
      if (lowerUserRole === lowerRequiredRole) {
        console.log('✅ Access granted - case insensitive match')
        next()
      } else {
        console.log('❌ Access denied - Wrong role')
        console.log('User role:', userRole, 'Required role:', role)
        
        // Redirect to user's own dashboard
        const currentLang = to.params.lang || 'en'
        if (userRole === 'Admin' || lowerUserRole === 'admin') {
          next(`/${currentLang}/admin/overview`)
        } else if (userRole === 'Teacher' || lowerUserRole === 'teacher') {
          next(`/${currentLang}/teacher/overview`)
        } else if (userRole === 'Head_Department' || lowerUserRole?.includes('head') || lowerUserRole?.includes('department')) {
          next(`/${currentLang}/hod/overview`)
        } else if (userRole === 'Student' || lowerUserRole === 'student') {
          next(`/${currentLang}/student/overview`)
        } else {
          next(`/${currentLang}/login`)
        }
      }
    }
  }
}

// Route guard to check permission
export const requirePermission = (permission) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      const lang = to.params.lang || 'en'
      next(`/${lang}/login`)
    } else if (!authStore.hasPermission(permission)) {
      // Redirect to dashboard if user doesn't have required permission
      const lang = to.params.lang || 'en'
      next(`/${lang}/dashboard`)
    } else {
      next()
    }
  } 
}

// Route guard to check multiple permissions
export const requireAnyPermission = (permissions) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      const lang = to.params.lang || 'en'
      next(`/${lang}/login`)
    } else if (!authStore.hasAnyPermission(permissions)) {
      // Redirect to dashboard if user doesn't have any of the required permissions
      const lang = to.params.lang || 'en'
      next(`/${lang}/dashboard`)
    } else {
      next()
    }
  }
}

// Route guard to prevent authenticated users from accessing login page
export const redirectIfAuthenticated = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    const lang = to.params.lang || 'en'
    // Redirect to appropriate dashboard based on user role
    switch (authStore.userRole) {
      case authStore.USER_ROLES.ADMIN:
        next(`/${lang}/admin/overview`)
        break
      case authStore.USER_ROLES.HEAD_OF_DEPARTMENT:
        next(`/${lang}/hod/overview`)
        break
      case authStore.USER_ROLES.TEACHER:
        next(`/${lang}/teacher/overview`)
        break
      case authStore.USER_ROLES.STUDENT:
        next(`/${lang}/student/overview`)
        break
      default:
        next(`/${lang}/login`)
    }
  } else {
    next()
  }
}

