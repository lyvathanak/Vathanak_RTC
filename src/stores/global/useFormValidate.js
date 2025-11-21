import { reactive } from 'vue'

/**
 * Reusable form validation composable
 * Provides common validation rules and error handling
 */
export function useFormValidate() {
  // Reactive errors object
  const errors = reactive({})

  // Clear all errors
  const clearErrors = () => {
    for (const k of Object.keys(errors)) delete errors[k]
  }

  // Clear specific field error
  const clearError = (field) => {
    delete errors[field]
  }

  // Set error for a field
  const setError = (field, message) => {
    errors[field] = message
  }

  // Check if form has any errors
  const hasErrors = () => Object.keys(errors).length > 0

  // Field name mappings for user-friendly display
  const fieldDisplayNames = {
    latin_name: 'Latin Name',
    khmer_name: 'Khmer Name',
    phone_number: 'Phone Number',
    date_of_birth: 'Date of Birth',
    department_id: 'Department',
    program_id: 'Program',
    sub_department_id: 'Section',
    position: 'Position',
    gender: 'Gender',
    id_card: 'ID Card',
    address: 'Address',
    grade: 'Grade',
    promotion: 'Promotion',
    academic_year: 'Academic Year',
    full_name: 'Full Name',
    phone: 'Phone Number',
    profile_picture: 'Profile Picture',
    photo_url: 'Photo',
    hire_date: 'Hire Date',
    join_rtc: 'Join Date',
    experience_years: 'Experience Years'
  }

  // Helper function to get display name for a field
  const getFieldDisplayName = (fieldName) => {
    return fieldDisplayNames[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Individual validation rules
  const validationRules = {
    // Required field validation
    required: (value, fieldName = 'This field') => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const displayName = getFieldDisplayName(fieldName)
        return `${displayName} is required`
      }
      return null
    },

    // Phone number validation (Cambodia format: starts with 0, 9-11 digits total)
    phone: (value) => {
      if (!value) return null // Skip if empty (use required separately)
      if (!/^0[0-9]{8,10}$/.test(value)) {
        return 'Phone number must start with 0 and contain 9-11 digits'
      }
      return null
    },

    // Khmer text validation (Khmer characters and spaces only)
    khmer: (value) => {
      if (!value) return null // Skip if empty (use required separately)
      const v = String(value).normalize('NFC').replace(/\u00A0/g, ' ').trim()
      // Simple “Khmer block + spaces” check (matches your requested behavior)
      const simple = /^[\u1780-\u17FF\s]+$/
      if (!simple.test(v)) {
        return 'This field must contain Khmer characters and spaces only'
      }
      return null
      // If you later want full Unicode script coverage, swap with:
      // if (!/^[\p{Script=Khmer}\s]+$/u.test(v)) return 'Use Khmer characters and spaces only'
    },

    // Latin text validation (no Khmer characters)
    latin: (value) => {
      if (!value) return null // Skip if empty (use required separately)
      if (/[\u1780-\u17FF]/.test(value)) {
        return 'This field should not contain Khmer characters'
      }
      return null
    },

    // Date of birth validation
    dateOfBirth: (value) => {
      if (!value) return null // Skip if empty (use required separately)

      const birthDate = new Date(value)
      if (isNaN(birthDate.getTime())) {
        return 'Please enter a valid date'
      }

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      if (birthDate > todayStart) {
        return 'Date of birth cannot be in the future'
      }

      const age = (now - birthDate) / (1000 * 60 * 60 * 24 * 365.25)
      if (age < 16 || age > 100) {
        return 'Please enter a valid age (16-100 years)'
      }
      return null
    },

    // Generic string length validation
    minLength: (minLength) => (value) => {
      if (!value) return null // Skip if empty (use required separately)
      if (String(value).length < minLength) {
        return `This field must be at least ${minLength} characters long`
      }
      return null
    },

    maxLength: (maxLength) => (value) => {
      if (!value) return null // Skip if empty (use required separately)
      if (String(value).length > maxLength) {
        return `This field must not exceed ${maxLength} characters`
      }
      return null
    },

    // Custom regex validation (defuse /g flag)
    pattern: (regex, message) => (value) => {
      if (!value) return null // Skip if empty (use required separately)
      if (!(regex instanceof RegExp)) return message || 'Invalid format'
      // Rebuild without global flag to avoid lastIndex issues
      const flags = regex.flags.replace('g', '')
      const safe = new RegExp(regex.source, flags)
      if (!safe.test(String(value))) {
        return message || 'Invalid format'
      }
      return null
    },

    // Number range validation
    numberRange: (min, max) => (value) => {
      if (value === undefined || value === null || value === '') return null
      const num = Number(value)
      if (isNaN(num)) {
        return 'Please enter a valid number'
      }
      if (num < min || num > max) {
        return `Value must be between ${min} and ${max}`
      }
      return null
    }
  }

  /**
   * Validate multiple fields with their rules
   * @param {Object} formData - The form data object
   * @param {Object} validationSchema - Schema defining validation rules for each field
   * @returns {boolean} - True if valid, false if there are errors
   *
   * Example validationSchema:
   * {
   *   email: ['required', 'email'],
   *   phone: ['required', 'phone'],
   *   name: ['required', { rule: 'minLength', params: [2] }]
   * }
   */
  const validateFields = (formData, validationSchema) => {
    clearErrors()

    for (const [fieldName, rules] of Object.entries(validationSchema)) {
      const value = formData[fieldName]

      for (const rule of rules) {
        let validationResult = null

        if (typeof rule === 'string') {
          if (validationRules[rule]) {
            validationResult = validationRules[rule](value, fieldName)
          }
        } else if (typeof rule === 'object' && rule.rule) {
          if (validationRules[rule.rule]) {
            if (rule.params) {
              validationResult = validationRules[rule.rule](...rule.params)(value)
            } else {
              validationResult = validationRules[rule.rule](value, fieldName)
            }
          }
        } else if (typeof rule === 'function') {
          validationResult = rule(value, fieldName, formData)
        }

        if (validationResult) {
          setError(fieldName, validationResult)
          break
        }
      }
    }

    return !hasErrors()
  }

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field
   * @param {any} value - Value to validate
   * @param {Array} rules - Array of validation rules
   * @returns {boolean} - True if valid, false if error
   */
  const validateField = (fieldName, value, rules) => {
    clearError(fieldName)

    for (const rule of rules) {
      let validationResult = null

      if (typeof rule === 'string') {
        if (validationRules[rule]) {
          validationResult = validationRules[rule](value, fieldName)
        }
      } else if (typeof rule === 'object' && rule.rule) {
        if (validationRules[rule.rule]) {
          if (rule.params) {
            validationResult = validationRules[rule.rule](...rule.params)(value)
          } else {
            validationResult = validationRules[rule.rule](value, fieldName)
          }
        }
      } else if (typeof rule === 'function') {
        validationResult = rule(value, fieldName)
      }

      if (validationResult) {
        setError(fieldName, validationResult)
        return false
      }
    }

    return true
  }

  /**
   * Student-specific validation schema
   * (Use field names that actually exist in your form model)
   */
  const studentValidationSchema = {
    latin_name: ['required', 'latin'],
    khmer_name: ['required', 'khmer'],
    phone_number: ['required', 'phone'],
    gender: ['required'],
    date_of_birth: ['required', 'dateOfBirth'],
    department_id: ['required'],
    program_id: ['required'],        // ✅ align with your real form keys
    sub_department_id: ['required']  // ✅ align with your real form keys
  }

  /**
   * Teacher-specific validation schema
   * NOTE: Email is excluded because it's auto-generated by the backend
   */
  const teacherValidationSchema = {
    latin_name: ['required', 'latin'],
    khmer_name: ['required', 'khmer'],
    // email: ['required', 'email'], // intentionally omitted
    phone_number: ['required', 'phone'],
    gender: ['required'],
    date_of_birth: ['required', 'dateOfBirth'],
    department_id: ['required'],
    position: ['required']
  }

  /**
   * Parse server errors and map them to form fields
   * @param {Object} result - Server response result
   */
  const mapServerErrors = (result) => {
    clearErrors()

    // Handle array of errors
    const msgs = Array.isArray(result.errors) ? result.errors : []
    if (msgs.length) {
      for (const e of msgs) {
        if (typeof e === 'string' && e.trim()) {
          const idx = e.indexOf(':')
          if (idx > -1) {
            const field = e.slice(0, idx).trim()
            const message = e.slice(idx + 1).trim()
            if (field && message) {
              setError(field, message)
            }
          } else {
            setError('global', e) // non-field message
          }
        }
      }
    } 
    // Handle object-style errors
    else if (result.errors && typeof result.errors === 'object') {
      Object.entries(result.errors).forEach(([field, message]) => {
        if (field && message && typeof message === 'string' && message.trim()) {
          setError(field, message.trim())
        }
      })
    }
    // Handle validation errors
    else if (result.validation && typeof result.validation === 'object') {
      Object.entries(result.validation).forEach(([field, message]) => {
        if (field && message && typeof message === 'string' && message.trim()) {
          setError(field, message.trim())
        }
      })
    }
    // Fallback to general message
    else {
      const fallbackMsg =
        (typeof result.message === 'string' && result.message.trim())
          ? result.message.trim()
          : (typeof result.error === 'string' && result.error.trim() 
              ? result.error.trim() 
              : 'Operation failed')

      // Try to detect field-specific errors from message
      if (/email/i.test(fallbackMsg)) {
        setError('email', fallbackMsg)
      } else if (/phone/i.test(fallbackMsg)) {
        setError('phone_number', fallbackMsg)
      } else if (/name/i.test(fallbackMsg)) {
        setError('latin_name', fallbackMsg)
      } else {
        setError('global', fallbackMsg)
      }
    }
  }

  return {
    // State
    errors,

    // Methods
    clearErrors,
    clearError,
    setError,
    hasErrors,

    // Validation
    validateFields,
    validateField,
    validationRules,

    // Pre-configured schemas
    studentValidationSchema,
    teacherValidationSchema,

    // Server error handling
    mapServerErrors
  }
}

/**
 * Convenience hook for student form validation
 */
export function useStudentFormValidate() {
  const validation = useFormValidate()
  const validateStudent = (studentData) => {
    return validation.validateFields(studentData, validation.studentValidationSchema)
  }
  return { ...validation, validateStudent }
}

/**
 * Convenience hook for teacher form validation
 */
export function useTeacherFormValidate() {
  const validation = useFormValidate()
  const validateTeacher = (teacherData) => {
    return validation.validateFields(teacherData, validation.teacherValidationSchema)
  }
  return { ...validation, validateTeacher }
}
