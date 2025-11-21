import { reactive, computed } from 'vue'

const baseDefaults = {
  profile_picture: '', // Changed from photo_url to profile_picture
  file: null,
  khmer_name: '',
  latin_name: '',
  gender: '',
  date_of_birth: '',
  phone: '',
  phone_number: '', // Add phone_number field
  email: '',
  active: true,
}

function getCurrentAcademicYear() {
  const now = new Date()
  const y = now.getFullYear()
  const start = now.getMonth() >= 7 ? y : y - 1 // Aug–Jul
  return `${start}-${start + 1}`
}

function defaultsFor(type) {
  if (type === 'student') {
    return {
      ...baseDefaults,
      academic_year: getCurrentAcademicYear(),
      program: 'Bachelor', // Changed from promotion
      department: '',
      department_id: '', // Add department_id field
      section: '',
      sub_department_id: '', // Add sub_department_id field  
      program_id: '', // Add program_id field
      degree: 'Bachelor',
      branch: 'Battambang',
      origin: 'Local',
      grade: 'A',
      start_year: new Date().getFullYear(), // Add start_year field
      is_radie: false,
    }
  }
  if (type === 'teacher') {
    return { ...baseDefaults, department: '', position: '' }
  }
  return { ...baseDefaults, department: '', tenure_start: '' }
}

function deriveNames(latin_name) {
  const parts = (latin_name || '').trim().split(/\s+/)
  const last_name = parts[0] || ''
  const first_name = parts.slice(1).join(' ')
  return { first_name, last_name }
}

export function useAddUser(type, options = {}) {
  const state = reactive(defaultsFor(type))

  const nameParts = computed(() => deriveNames(state.latin_name))

  function setPhotoFile(file) {
    // Validate file type and size
    if (!file) return
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type. Please select an image file.')
      return
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('File too large. Please select an image smaller than 5MB.')
      return
    }
    
    state.file = file
    const reader = new FileReader()
    reader.onload = () => {
      state.profile_picture = String(reader.result || '') // Changed from photo_url to profile_picture
    }
    reader.onerror = () => {
      console.error('Error reading file')
      state.file = null
      state.profile_picture = '' // Changed from photo_url to profile_picture
    }
    reader.readAsDataURL(file)
  }

  function validate() {
    const errors = []
    if (!String(state.latin_name || '').trim()) errors.push('Latin name is required')
    if (!String(state.khmer_name || '').trim()) errors.push('Khmer name is required')
    if (!state.gender) errors.push('Gender is required')
    if (!state.date_of_birth) errors.push('Date of birth is required')
    if (type === 'student' && !state.academic_year) errors.push('Academic year is required')
    if (type === 'student' && !state.program) errors.push('Program is required')
    // Fix: Check for department_id instead of department for students
    if (type === 'student' && !state.department_id && !state.department) errors.push('Department is required')
    // Fix: Check for both section and sub_department_id
    if (type === 'student' && !state.section && !state.sub_department_id) errors.push('Section is required')
    return errors
  }

  function buildPayload() {
    const { first_name, last_name } = nameParts.value
    const base = {
      khmer_name: state.khmer_name,
      latin_name: state.latin_name,
      full_name:
        type === 'student' && options.studentFullNameFromKhmer !== false
          ? state.khmer_name
          : `${first_name} ${last_name}`.trim(),
      first_name,
      last_name,
      gender: state.gender,
      date_of_birth: state.date_of_birth,
      // Fix: Use phone_number to match API expectations
      phone_number: state.phone_number || state.phone,
      email: state.email, // leave empty unless user types it
      active: state.active,
      // Include both file and preview URL for profile picture
      ...(state.file && { file: state.file }), // Changed from photo to file
      ...(state.profile_picture && { profile_picture: state.profile_picture }) // Changed from photo_url
    }

    if (type === 'student') {
      return { 
        ...base, 
        academic_year: state.academic_year, 
        program: state.program, 
        // Fix: Use department_id if available, fallback to department
        department_id: state.department_id,
        department: state.department_id || state.department, 
        section: state.section, 
        degree: state.degree, 
        branch: state.branch, 
        origin: state.origin, 
        grade: state.grade, 
        is_radie: state.is_radie,
        // Add required ID fields
        sub_department_id: state.sub_department_id,
        program_id: state.program_id
      }
    }
    if (type === 'teacher') {
      return { ...base, department: state.department, position: state.position }
    }
    return { ...base, department: state.department, tenure_start: state.tenure_start }
  }

  // async function submit() {
  //   const errors = validate()
  //   if (errors.length) return { ok: false, errors }

  //   const payload = buildPayload()
  //   if (options.createFn) {
  //     const res = await options.createFn(payload)
  //     if (!res.success) return { ok: false, errors: [String(res.error || 'Create failed')] }
  //     return { ok: true, data: res.data, payload }
  //   }
  //   return { ok: true, payload }
  // }

  async function submit() {
    const errors = validate()
    if (errors.length) return { ok: false, errors }

    const payload = buildPayload()
    if (options.createFn) {
      const res = await options.createFn(payload)

      if (!res.success) {
        // ✅ Use parsed messages from StudentCRUD
        const errs = Array.isArray(res.errors) && res.errors.length
          ? res.errors
          : [res.message || 'Create failed']

        return { ok: false, errors: errs }
      }

      return { ok: true, data: res.data, payload }
    }
    return { ok: true, payload }
  }


  function reset() {
    Object.assign(state, defaultsFor(type))
  }

  return {
    type,
    state: state, // 🔧 REMOVE readonly() to allow form updates
    setPhotoFile,
    nameParts,
    submit,
    reset,
  }
}
