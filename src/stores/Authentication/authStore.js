import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/stores/apis/axios.js'

export const useAuthStore = defineStore('auth', () => {
  // Cookie utilities for cross-subdomain authentication (defined first)
  const setCookie = (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    // Set cookie for all subdomains under rtc-bb.camai.kh
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.rtc-bb.camai.kh;SameSite=Lax;Secure`;
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        return value;
      }
    }
    return null;
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.rtc-bb.camai.kh`;
  };

  // Helper function to get token from storage (now includes cookies)
  function getStoredToken() {
    // Priority 1: Check cookie (cross-subdomain)
    let storedToken = getCookie('auth_token');
    if (storedToken) {
      return storedToken;
    }
    
    // Priority 2: Check localStorage (remember me)
    storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      // Migrate to cookie for cross-subdomain support
      setCookie('auth_token', storedToken, 30);
      return storedToken;
    }
    
    // Priority 3: Check sessionStorage (session only)
    storedToken = sessionStorage.getItem('auth_token')
    if (storedToken) {
      // Set as session cookie (expires when browser closes)
      setCookie('auth_token', storedToken, 0.04); // ~1 hour
      return storedToken;
    }
    
    return null
  }

  // State
  const user = ref(null)
  const token = ref(getStoredToken())
  const isLoading = ref(false)
  const error = ref(null)
  const lastTokenCheck = ref(Date.now())
  const syncInterval = ref(null)

  // User roles enum - Updated to match API response
  const USER_ROLES = {
    ADMIN: 'Admin',
    HEAD_OF_DEPARTMENT: 'Head_Department',  // Updated to match API response
    TEACHER: 'Teacher',
    STUDENT: 'Student'
  }

  // Permissions for each role
  const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
      'manage_users',
      'manage_courses',
      'view_reports',
      'manage_system',
      'edit_content',
      'delete_content',
      'view_all_data',
      'manage_departments',
      'approve_budgets'
    ],
    [USER_ROLES.HEAD_OF_DEPARTMENT]: [
      'manage_department_courses',
      'manage_department_teachers',
      'view_department_reports',
      'edit_department_content',
      'approve_department_requests',
      'view_department_data',
      'schedule_classes'
    ],
    [USER_ROLES.TEACHER]: [
      'manage_courses',
      'edit_content',
      'view_students',
      'grade_assignments',
      'create_assignments'
    ],
    [USER_ROLES.STUDENT]: [
      'view_courses',
      'submit_assignments',
      'view_grades',
      'view_profile'
    ]
  }

  // Computed properties
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const userRole = computed(() => user.value?.role || USER_ROLES.STUDENT)
  
  const userPermissions = computed(() => ROLE_PERMISSIONS[userRole.value] || [])
  
  const isAdmin = computed(() => userRole.value === USER_ROLES.ADMIN)
  
  const isHeadOfDepartment = computed(() => userRole.value === USER_ROLES.HEAD_OF_DEPARTMENT)
  
  const isTeacher = computed(() => userRole.value === USER_ROLES.TEACHER)
  
  const isStudent = computed(() => userRole.value === USER_ROLES.STUDENT)

  // Actions
  const login = async (credentials, rememberMe = false) => {
    try {
      isLoading.value = true
      error.value = null

      // Call real API
      const response = await loginAPI(credentials)
      
      if (response.success) {
        // Better role handling - handle different possible role formats
        let userRole = USER_ROLES.STUDENT // Default to student
        
        if (response.roles && response.roles.length > 0) {
          const apiRole = response.roles[0] // Get the exact role from API
          
          // Map API roles to our internal roles (exact match first)
          if (apiRole === 'Admin') userRole = USER_ROLES.ADMIN
          else if (apiRole === 'Teacher') userRole = USER_ROLES.TEACHER
          else if (apiRole === 'Head_Department') userRole = USER_ROLES.HEAD_OF_DEPARTMENT
          else if (apiRole === 'Student') userRole = USER_ROLES.STUDENT
          else {
            // Fallback for case-insensitive and variation matching
            const lowerApiRole = apiRole.toLowerCase().trim()
            
            if (lowerApiRole === 'admin' || lowerApiRole === 'administrator') userRole = USER_ROLES.ADMIN
            else if (lowerApiRole === 'teacher' || lowerApiRole === 'teachers' || lowerApiRole === 'instructor') userRole = USER_ROLES.TEACHER
            else if (lowerApiRole.includes('head') || lowerApiRole.includes('department') || lowerApiRole === 'hod') userRole = USER_ROLES.HEAD_OF_DEPARTMENT
            else if (lowerApiRole === 'student' || lowerApiRole === 'students' || lowerApiRole === 'learner') userRole = USER_ROLES.STUDENT
            else {
              // Force teacher role if email contains teacher and role doesn't match
              if (credentials.email.includes('teacher')) {
                userRole = USER_ROLES.TEACHER
              }
            }
          }
        }
        
        // Set user data based on actual API response structure
        user.value = {
          id: response.user?.id || Math.random().toString(36).substr(2, 9),
          email: credentials.email,
          name: response.user?.name || response.user?.full_name || 'User',
          role: userRole,
          permissions: ROLE_PERMISSIONS[userRole] || [],
          profile: response.user?.profile || {},
          rawRoles: response.roles // Keep original roles for debugging
        }
        
        // Additional teacher verification
        if (credentials.email.includes('teacher')) {
          // Force role to teacher if email indicates teacher
          if (userRole !== USER_ROLES.TEACHER) {
            user.value.role = USER_ROLES.TEACHER
            userRole = USER_ROLES.TEACHER
          }
        }
        
        // Set token from API response
        token.value = response.token
        
        // Store token in cookie for cross-subdomain access + localStorage/sessionStorage as backup
        if (rememberMe) {
          // Store for 30 days (remember me)
          setCookie('auth_token', response.token, 30);
          localStorage.setItem('auth_token', response.token)
          localStorage.setItem('remember_me', 'true')
          localStorage.setItem('remember_me_preference', 'true')
          localStorage.setItem('user_data', JSON.stringify(user.value))
          localStorage.setItem('saved_email', credentials.email)
          localStorage.setItem('saved_password', credentials.password)
        } else {
          // Store as session cookie (expires when browser closes)
          setCookie('auth_token', response.token, 0.04); // ~1 hour
          sessionStorage.setItem('auth_token', response.token)
          sessionStorage.setItem('user_data', JSON.stringify(user.value))
          localStorage.removeItem('remember_me')
        }
        
        // Broadcast login to all tabs/windows including cross-domain
        broadcastAuthChange('login', user.value);
        
        // Start token sync interval
        startTokenSync();
        
        return { success: true, user: user.value }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    error.value = null
    
    // Clear auth tokens from all storage locations (including cookie)
    deleteCookie('auth_token');
    localStorage.removeItem('auth_token')
    localStorage.removeItem('remember_me')
    localStorage.removeItem('user_data')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user_data')
    
    // Broadcast logout to all tabs/windows including cross-domain
    broadcastAuthChange('logout');
    
    // Stop sync interval
    if (syncInterval.value) {
      clearInterval(syncInterval.value);
      syncInterval.value = null;
    }
    
    // Note: We keep 'remember_me_preference' and 'saved_email' in localStorage so they persist after logout
  }

  const checkAuth = async () => {
    if (!token.value) {
      return false
    }

    try {
      isLoading.value = true
      // Call real API to verify token
      const response = await verifyTokenAPI(token.value)
      
      if (response.success) {
        user.value = response.user
        return true
      } else {
        logout()
        return false
      }
    } catch (err) {
      logout()
      return false
    } finally {
      isLoading.value = false
    }
  }

  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => userPermissions.value.includes(permission))
  }

  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => userPermissions.value.includes(permission))
  }

  const canAccess = (requiredRole) => {
    const roleHierarchy = {
      [USER_ROLES.STUDENT]: 1,
      [USER_ROLES.TEACHER]: 2,
      [USER_ROLES.HEAD_OF_DEPARTMENT]: 3,
      [USER_ROLES.ADMIN]: 4
    }
    
    return roleHierarchy[userRole.value] >= roleHierarchy[requiredRole]
  }

  const updateUserProfile = (profileData) => {
    if (user.value) {
      user.value.profile = { ...user.value.profile, ...profileData }
      
      // Update user data in storage based on remember me preference
      if (isRememberMeEnabled()) {
        localStorage.setItem('user_data', JSON.stringify(user.value))
      } else {
        sessionStorage.setItem('user_data', JSON.stringify(user.value))
      }
    }
  }

  // Load user data from localStorage or sessionStorage
  const loadUserFromStorage = () => {
    // Try localStorage first (remember me)
    let userData = localStorage.getItem('user_data')
    if (userData) {
      try {
        user.value = JSON.parse(userData)
        return true
      } catch (err) {
        console.error('Error parsing user data from localStorage:', err)
      }
    }
    
    // Try sessionStorage
    userData = sessionStorage.getItem('user_data')
    if (userData) {
      try {
        user.value = JSON.parse(userData)
        return true
      } catch (err) {
        console.error('Error parsing user data from sessionStorage:', err)
      }
    }
    
    return false
  }

  // Helper function to check if remember me is enabled
  const isRememberMeEnabled = () => {
    // Check localStorage preference (more reliable than cookies in development)
    const localPreference = localStorage.getItem('remember_me_preference')
    if (localPreference === 'true') return true
    
    // Fallback to current session remember state
    return localStorage.getItem('remember_me') === 'true'
  }

  // Helper function to clear remember me preference
  const clearRememberMePreference = () => {
    localStorage.removeItem('remember_me')
    localStorage.removeItem('remember_me_preference')
    localStorage.removeItem('saved_email')
    localStorage.removeItem('saved_password')
  }

  // Helper function to get saved email
  const getSavedEmail = () => {
    return localStorage.getItem('saved_email') || ''
  }

  // Helper function to get saved password
  const getSavedPassword = () => {
    return localStorage.getItem('saved_password') || ''
  }

  // Helper function to redirect to library with token
  const redirectToLibrary = () => {
    if (token.value) {
      // URL encode the token to handle special characters
      const encodedToken = encodeURIComponent(token.value)
      const libraryUrl = `https://library.rtc-bb.camai.kh/index.php?token=${encodedToken}`
      // Open in new tab instead of replacing current tab
      window.open(libraryUrl, '_blank')
    } else {
      console.error('❌ No token available for library access')
      throw new Error('No authentication token available. Please login first.')
    }
  }

  // Initialize user data from storage on store creation
  if (token.value && !user.value) {
    loadUserFromStorage()
  }

  // Cross-domain authentication synchronization
  const broadcastAuthChange = (action, userData = null) => {
    try {
      // Store the auth state change timestamp
      const authState = {
        action,
        userData,
        timestamp: Date.now(),
        source: window.location.hostname
      };
      
      // Store in localStorage to trigger storage event in other tabs
      localStorage.setItem('auth_sync', JSON.stringify(authState));
      
      // Remove immediately to allow repeated events
      setTimeout(() => {
        localStorage.removeItem('auth_sync');
      }, 100);
    } catch (err) {
      console.error('Error broadcasting auth change:', err);
    }
  };

  // Listen for auth changes from other tabs/windows
  const setupAuthSync = () => {
    // Listen for storage events (cross-tab communication)
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_sync' && event.newValue) {
        try {
          const authState = JSON.parse(event.newValue);
          
          // Don't process our own events
          if (authState.source === window.location.hostname) {
            return;
          }
          
          if (authState.action === 'logout') {
            // Perform local logout without broadcasting again
            user.value = null;
            token.value = null;
            error.value = null;
            
            // Stop sync interval
            if (syncInterval.value) {
              clearInterval(syncInterval.value);
              syncInterval.value = null;
            }
            
            // Redirect to login page
            window.location.href = '/login';
          } else if (authState.action === 'login' && authState.userData) {
            // Update local user data
            user.value = authState.userData;
            token.value = getStoredToken();
            
            // Start token sync
            startTokenSync();
            
            // Reload page to update UI
            window.location.reload();
          }
        } catch (err) {
          console.error('Error processing auth sync:', err);
        }
      }
    });
  };

  // Periodically check if token has changed (for cross-domain sync)
  const startTokenSync = () => {
    // Clear any existing interval
    if (syncInterval.value) {
      clearInterval(syncInterval.value);
    }
    
    // Check every 5 seconds
    syncInterval.value = setInterval(() => {
      const currentToken = getStoredToken();
      
      // If token changed (different or removed)
      if (currentToken !== token.value) {
        if (!currentToken) {
          // Token was removed (logged out)
          user.value = null;
          token.value = null;
          error.value = null;
          
          if (syncInterval.value) {
            clearInterval(syncInterval.value);
            syncInterval.value = null;
          }
          
          // Redirect to login
          window.location.href = '/login';
        } else {
          // Token changed (account switched)
          token.value = currentToken;
          
          // Reload user data from storage or verify with API
          if (!loadUserFromStorage()) {
            // If no user data in storage, verify token with API
            checkAuth().then((isValid) => {
              if (isValid) {
                window.location.reload();
              } else {
                logout();
              }
            });
          } else {
            window.location.reload();
          }
        }
      }
    }, 5000); // Check every 5 seconds
  };

  // Initialize sync on store creation
  setupAuthSync();
  
  // Start token sync if already authenticated
  if (token.value && user.value) {
    startTokenSync();
  }

  // Real API functions - Enhanced with debugging for the real API
  const loginAPI = async (credentials) => {
    try {
      // Use axios instead of fetch
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      const data = response.data

      if (response.status === 200 && data.message === "Login successful") {
        return {
          success: true,
          user: data.user || {},
          token: data.token,
          roles: data.roles || [],
          message: data.message
        }
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        }
      }
    } catch (error) {
      console.error('🔥 Login API error:', error)
      
      // Handle axios error response
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Login failed'
        }
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      }
    }
  }

  const verifyTokenAPI = async (token) => {
    try {
      // Use axios instead of fetch
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = response.data

      if (response.status === 200) {
        return {
          success: true,
          user: data.user || data.data?.user
        }
      } else {
        return {
          success: false,
          message: data.message || 'Token verification failed'
        }
      }
    } catch (error) {
      console.error('Token verification error:', error)
      return {
        success: false,
        message: 'Network error during token verification'
      }
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    USER_ROLES,
    ROLE_PERMISSIONS,
    
    // Computed
    isAuthenticated,
    userRole,
    userPermissions,
    isAdmin,
    isHeadOfDepartment,
    isTeacher,
    isStudent,
    
    // Constants
    USER_ROLES,
    
    // Actions
    login,
    logout,
    checkAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    updateUserProfile,
    isRememberMeEnabled,
    clearRememberMePreference,
    getSavedEmail,
    getSavedPassword,
    loadUserFromStorage,
    redirectToLibrary,
    
    // Sync functions
    startTokenSync,
    broadcastAuthChange
  }
})
