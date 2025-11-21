import api from './axios.js'

// Use the backend API endpoint for teachers (adjust as needed for your backend)
const TEACHERS_ENDPOINT = '/teachers';
const AUTH_ENDPOINT = '/auth';

// generate a temporary password if your backend requires it
function randomTempPassword() {
  return 'Temp@' + Math.random().toString(36).slice(2, 8)
}

// Small helper
function resolveUserId(target) {
  if (typeof target === 'object' && target !== null) {
    return target.user_id ?? target.id ?? null
  }
  return target ?? null
}

const normBool = (v) => v === true || v === 1 || v === '1' || v === 'true';

// --- date helpers (exported for reuse across modals) ---
export function normalizeDateToYMD(value) {
  if (!value) return null;

  // already yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // dd-mm-yyyy or dd/mm/yyyy
  const dmy = /^(\d{2})[/-](\d{2})[/-](\d{4})$/.exec(value);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  // yyyy/mm/dd or yyyy.mm.dd
  const ymdAlt = /^(\d{4})[/.](\d{2})[/.](\d{2})$/.exec(value);
  if (ymdAlt) return `${ymdAlt[1]}-${ymdAlt[2]}-${ymdAlt[3]}`;

  // last resort: Date parse
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return null; // keep API clean if we can't understand it
}

/**
 * Map the UI form model (newTeacher) to the backend /auth/register schema.
 * Anything your UI doesn't collect is set to null / sensible defaults.
 */
function buildTeacherRegisterPayload(t) {
  console.log('🔍 Input teacher data:', t);
  
  // Helper to safely convert to string and handle null/undefined
  const safeString = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'object') {
      console.warn('⚠️ Received object when expecting string:', value);
      return null;
    }
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
  };

  // Helper to safely convert to number
  const safeNumber = (value) => {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // Ensure required fields have proper defaults
  const payload = {
    // make sure "name" is always present (backend requires it)
    name: safeString(t?.latin_name) 
          || safeString(t?.khmer_name) 
          || safeString(t?.full_name) 
          || safeString(t?.name),

    latin_name: safeString(t?.latin_name),
    khmer_name: safeString(t?.khmer_name),
    full_name: safeString(t?.full_name) 
            || safeString(t?.khmer_name) 
            || safeString(t?.latin_name),

    gender: safeString(t?.gender),
    date_of_birth: t?.date_of_birth || null,

    // backend autogenerates email
    email: null,

    // accept either `phone` or `phone_number`
    phone_number: safeString(t?.phone) ?? safeString(t?.phone_number),

    // accept id or nested {id}, coerce to number
    department_id: safeNumber(t?.department_id ?? t?.department?.id),
    program_id: safeNumber(t?.program_id ?? t?.program?.id),

    file: t?.file || null,
    profile_picture: safeString(t?.photo_url || t?.profile_picture),

    degree: safeString(t?.degree),
    graduated_from: safeString(t?.graduated_from),
    graduated_at: safeString(t?.graduated_at),
    join_at: t?.join_at || null,
    start_year: t?.start_year || null,
    end_year: t?.end_year || null,
    experience_years: safeNumber(t?.experience_years) || 0,
    position: safeString(t?.position),
    department: safeString(t?.department),
    academic_year: safeString(t?.academic_year) || '2024-2025',

    password: randomTempPassword(),
    address: safeString(t?.address),
    current_address: safeString(t?.current_address || t?.address),
    origin: safeString(t?.origin),
    bio: safeString(t?.bio),
    place_of_birth: safeString(t?.place_of_birth),

    hire_date: t?.join_rtc || new Date().toISOString().split('T')[0],
    status: 'Active',
    special: Boolean(t?.special || false),
    is_radie: Boolean(t?.radie || t?.is_radie || false),
    is_active: t?.active === undefined ? true : Boolean(t.active),

    id_prefix: 't',
    role_key: 'Staff',
  };

  Object.keys(payload).forEach(k => {
    const v = payload[k];
    if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) {
      delete payload[k];
    }
  });
  
  console.log('📋 Built payload:', payload);
  
  return payload
}

/**
 * Teacher CRUD Operations API
 */
export const TeacherCRUD = {

  /**
   * GET ALL TEACHERS
   * Fetches all teachers from the database with complete information
   * @param {Object} params - Query parameters for filtering, sorting, pagination
   * @returns {Promise<Array>} Array of teacher objects with full details
   */
  async getAllTeachers(params = {}) {
    try {
      const response = await api.get('/users/get_all_users?role=staff', { params })
      
      // Extract users from the actual backend structure
      const usersData = response.data.users || {};
      const teachers = usersData.data || [];
      
      console.log('🎯 Backend response structure (teachers):', {
        hasUsers: !!response.data.users,
        hasData: !!usersData.data,
        teachersCount: teachers.length,
        firstTeacher: teachers[0]
      });
      
      // Transform the data to a rich "teacher" shape, staying resilient if backend lacks details
      const transformedTeachers = teachers.map((teacher) => {
        // Nested detail
        const userDetail = teacher.user_detail || {};
        
        // Extract role information for better display
        const teacherRole = teacher.roles?.find(role => role.role_key === 'Staff') || teacher.roles?.[0];
        
        return {
          // Core user fields
          user_id: teacher.user_id ?? teacher.id ?? userDetail.user_id ?? null,
          id: teacher.id,
          name: teacher.name || userDetail.name || "",
          email: teacher.email || "",
          created_at: teacher.created_at || userDetail.created_at || null,
          updated_at: teacher.updated_at || userDetail.updated_at || null,
          roles: teacher.roles || [],
          groups: teacher.groups || [],
          
          // Teacher identification
          id_card: userDetail.id_card || teacher.id_card || "",
          latin_name: userDetail.latin_name || teacher.latin_name || teacher.name || "",
          khmer_name: userDetail.khmer_name || teacher.khmer_name || `${userDetail.khmer_first_name || ""} ${userDetail.khmer_last_name || ""}`.trim(),
          khmer_first_name: userDetail.khmer_first_name || null,
          khmer_last_name: userDetail.khmer_last_name || null,
          full_name: userDetail.full_name || teacher.full_name || userDetail.khmer_name || userDetail.latin_name || teacher.name || "",
          
          // Personal info
          gender: userDetail.gender || teacher.gender || null,
          date_of_birth: userDetail.date_of_birth || teacher.date_of_birth || null,
          phone_number: userDetail.phone_number || teacher.phone_number || "",
          phone: userDetail.phone || teacher.phone || userDetail.phone_number || teacher.phone_number || "",
          
          // Professional info
          department_id: userDetail.department_id ?? teacher.department_id ?? null,
          sub_department_id: userDetail.sub_department_id ?? teacher.sub_department_id ?? null,
          department: userDetail.department || teacher.department || 'Staff',
          section: userDetail.section || teacher.section || "",
          position: userDetail.position || teacher.position || teacherRole?.description || 'Teacher',
          degree: userDetail.degree || teacher.degree || "",
          graduated_from: userDetail.graduated_from || teacher.graduated_from || "",
          join_at: userDetail.join_at || teacher.join_at || null,
          graduated_at: userDetail.graduated_at || teacher.graduated_at || null,
          start_year: userDetail.start_year || teacher.start_year || null,
          end_year: userDetail.end_year || teacher.end_year || null,
          experience_years: userDetail.experience_years || teacher.experience_years || 0,
          academic_year: userDetail.academic_year || teacher.academic_year || "2024-2025",
          
          // Contact info
          address: userDetail.address || teacher.address || "",
          current_address: userDetail.current_address || teacher.current_address || "",
          origin: userDetail.origin || teacher.origin || "",
          place_of_birth: userDetail.place_of_birth || teacher.place_of_birth || "",
          
          // Additional info
          bio: userDetail.bio || teacher.bio || "",
          
          // Status fields
          is_radie: userDetail.is_radie ?? teacher.is_radie ?? teacher.radie ?? false,
          radie: userDetail.is_radie ?? teacher.is_radie ?? teacher.radie ?? false,
          is_active: userDetail.is_active !== undefined ? userDetail.is_active
                  : (teacher.is_active !== undefined ? teacher.is_active : teacher.active !== undefined ? teacher.active : true),
          active: userDetail.is_active !== undefined ? userDetail.is_active
               : (teacher.is_active !== undefined ? teacher.is_active : teacher.active !== undefined ? teacher.active : true),
          status: teacher.status || (teacher.is_active || teacher.active ? 'Active' : 'Inactive'),
          
          // Media
          profile_picture: userDetail.profile_picture || teacher.profile_picture || teacher.photo_url || "",
          photo_url: userDetail.profile_picture || teacher.profile_picture || teacher.photo_url || "",
          file: userDetail.file || teacher.file || "",
          
          // Keep original nested structure for compatibility
          user_detail: userDetail,
        };
      });

      return {
        success: true,
        data: transformedTeachers,
        total: transformedTeachers.length,
        pagination: {
          current_page: usersData.current_page || 1,
          total: usersData.total ?? transformedTeachers.length,
          per_page: usersData.per_page ?? transformedTeachers.length,
          last_page: usersData.last_page ?? 1,
        },
        message: response.data.message || 'Teachers fetched successfully',
      };
    } catch (error) {
      console.error('❌ Get all teachers error:', error.response?.data || error.message);
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: 'Failed to fetch teachers'
      }
    }
  },

  /**
   * GET TEACHER BY ID
   * Fetches a single teacher by their ID with complete information
   * @param {string} teacherId - The teacher's ID
   * @returns {Promise<Object>} Teacher object with full details
   */
  async getTeacherById(teacherId) {
    try {
      const response = await api.get(`/users/get_user_by_id/${teacherId}`)

      // The API returns { user: { ... } }
      const teacher = response.data.user || response.data.data || response.data;

      // Nested detail
      const userDetail = teacher.user_detail || {};

      const transformedTeacher = {
        // Core user fields
        user_id: teacher.user_id ?? teacher.id ?? userDetail.user_id ?? null,
        id: teacher.id,
        name: teacher.name || userDetail.name || "",
        email: teacher.email || "",
        created_at: teacher.created_at || userDetail.created_at || null,
        updated_at: teacher.updated_at || userDetail.updated_at || null,
        roles: teacher.roles || [],
        groups: teacher.groups || [],
        
        // Teacher identification
        id_card: userDetail.id_card || teacher.id_card || "",
        latin_name: userDetail.latin_name || teacher.latin_name || teacher.name || "",
        khmer_name: userDetail.khmer_name || teacher.khmer_name || `${userDetail.khmer_first_name || ""} ${userDetail.khmer_last_name || ""}`.trim(),
        khmer_first_name: userDetail.khmer_first_name || null,
        khmer_last_name: userDetail.khmer_last_name || null,
        full_name: userDetail.full_name || teacher.full_name || userDetail.khmer_name || userDetail.latin_name || teacher.name || "",
        
        // Personal info
        gender: userDetail.gender || teacher.gender || null,
        date_of_birth: userDetail.date_of_birth || teacher.date_of_birth || null,
        phone_number: userDetail.phone_number || teacher.phone_number || "",
        phone: userDetail.phone || teacher.phone || userDetail.phone_number || teacher.phone_number || "",
        
        // Professional info
        department_id: userDetail.department_id ?? teacher.department_id ?? null,
        sub_department_id: userDetail.sub_department_id ?? teacher.sub_department_id ?? null,
        department: userDetail.department || teacher.department || "",
        section: userDetail.section || teacher.section || "",
        position: userDetail.position || teacher.position || "",
        degree: userDetail.degree || teacher.degree || "",
        graduated_from: userDetail.graduated_from || teacher.graduated_from || "",
        join_at: userDetail.join_at || teacher.join_at || null,
        graduated_at: userDetail.graduated_at || teacher.graduated_at || null,
        start_year: userDetail.start_year || teacher.start_year || null,
        end_year: userDetail.end_year || teacher.end_year || null,
        experience_years: userDetail.experience_years || teacher.experience_years || 0,
        academic_year: userDetail.academic_year || teacher.academic_year || "2024-2025",
        
        // Contact info
        address: userDetail.address || teacher.address || "",
        current_address: userDetail.current_address || teacher.current_address || "",
        origin: userDetail.origin || teacher.origin || "",
        place_of_birth: userDetail.place_of_birth || teacher.place_of_birth || "",
        
        // Additional info
        bio: userDetail.bio || teacher.bio || "",
        
        // Status fields
        is_radie: userDetail.is_radie ?? teacher.is_radie ?? teacher.radie ?? false,
        radie: userDetail.is_radie ?? teacher.is_radie ?? teacher.radie ?? false,
        is_active: userDetail.is_active !== undefined ? userDetail.is_active
                : (teacher.is_active !== undefined ? teacher.is_active : teacher.active !== undefined ? teacher.active : true),
        active: userDetail.is_active !== undefined ? userDetail.is_active
             : (teacher.is_active !== undefined ? teacher.is_active : teacher.active !== undefined ? teacher.active : true),
        status: teacher.status || (teacher.is_active || teacher.active ? 'Active' : 'Inactive'),
        
        // Media
        profile_picture: userDetail.profile_picture || teacher.profile_picture || teacher.photo_url || "",
        photo_url: userDetail.profile_picture || teacher.profile_picture || teacher.photo_url || "",
        file: userDetail.file || teacher.file || "",
        
        // Keep original nested structure for compatibility
        user_detail: userDetail,
      };

      return {
        success: true,
        data: transformedTeacher,
        message: 'Teacher fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to fetch teacher with ID: ${teacherId}`
      }
    }
  },

  /**
   * CREATE NEW TEACHER
   * Creates a new teacher record
   * @param {Object} teacherData - Teacher data object
   * @returns {Promise<Object>} Created teacher object
   */
  async createTeacher(formModel) {
    try {
      console.log("📋 Input form model (Teacher):", formModel);

      const payload = buildTeacherRegisterPayload(formModel);

      // ⛔ Block empty/duplicate submits (avoids bogus 500s & console noise)
      const depIdNum =
        payload.department_id === undefined || payload.department_id === null
          ? null
          : Number(payload.department_id);

      if (!payload.name || !Number.isFinite(depIdNum)) {
        console.log("⏭️ Skipping createTeacher: missing required fields after prune", {
          name: payload.name,
          department_id: payload.department_id,
        });
        // Return a benign success so UI doesn't show an error banner
        return { success: true, data: null, message: "Skipped empty submit" };
      }

      // Normalize some values before sending
      payload.department_id = depIdNum;

      console.log("🚀 Sending teacher payload to backend:", payload);
      console.log("  - name:", payload.name);
      console.log("  - email: auto-generated by backend");
      console.log("  - phone_number:", payload.phone_number);
      console.log("  - gender:", payload.gender);
      console.log("  - department_id:", payload.department_id, typeof payload.department_id);
      console.log("  - join_rtc:", payload.join_rtc);
      console.log("  - graduate_from:", payload.graduate_from);
      console.log("  - role_key:", payload.role_key);
      console.log("  - has file:", !!payload.file);

      // ── With file: multipart/form-data
      if (payload.file && payload.file instanceof File) {
        console.log("🧰 Creating FormData for file upload...");
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          if (key === "file") {
            console.log("Adding file as profile_picture:", payload.file.name);
            formData.append("profile_picture", payload.file);
            return;
          }
          if (key === "profile_picture") return; // avoid duplicating key
          const val = payload[key];
          if (val === null || val === undefined) return;

          // Coerce for FormData
          if (typeof val === "boolean") formData.append(key, val ? "1" : "0");
          else formData.append(key, String(val));
        });

        // (Optional) debug log formData
        // for (const [k, v] of formData.entries()) console.log("  •", k, v);

        const response = await api.post(`${AUTH_ENDPOINT}/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        return {
          success: true,
          data: response.data,
          message: "Teacher created successfully with photo",
        };
      }

      // ── No file: JSON
      const { file, profile_picture, email, ...jsonPayload } = payload;

      // Prune null/undefined/empty strings
      Object.keys(jsonPayload).forEach((k) => {
        const v = jsonPayload[k];
        if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) {
          delete jsonPayload[k];
        }
      });

      // Ensure numeric types where needed
      if (jsonPayload.department_id !== undefined) {
        jsonPayload.department_id = Number(jsonPayload.department_id);
      }

      console.log("📝 Sending JSON payload (no file):", jsonPayload);

      const response = await api.post(`${AUTH_ENDPOINT}/register`, jsonPayload, {
        headers: { "Content-Type": "application/json" },
      });

      return {
        success: true,
        data: response.data,
        message: "Teacher created successfully",
      };
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      console.error("❌ Create Teacher Error:", data || error.message);
      if (error.response) {
        console.error("❌ Full error response:", error.response);
        console.error("❌ Error status:", status);
        try {
          console.error("❌ Error data details:", JSON.stringify(data, null, 2));
        } catch (_) {
          /* ignore stringify issues */
        }
      }

      let errorMessage = "Failed to create teacher";
      if (data) {
        if (typeof data === "string") errorMessage = data;
        else if (data.message) errorMessage = data.message;
        else if (data.error) errorMessage = data.error;
      }

      const errorsOut = data?.errors || data?.validation || [];

      return {
        success: false,
        data: null,
        error: data || error.message,
        message: errorMessage,
        errors: errorsOut,
        validation: errorsOut,
        status,
      };
    }
  },

  /**
   * UPDATE TEACHER
   * Updates an existing teacher record
   * @param {string|Object} teacherTarget - user_id, id, or teacher object
   * @param {Object} updateData - data to update
   * @returns {Promise<Object>}
   */
  async updateTeacher(teacherTarget, updateData) {
    let teacherId;
    try {
      const base = (typeof teacherTarget === 'object' && teacherTarget) ? teacherTarget : {};
      teacherId = resolveUserId(teacherTarget);
      if (!teacherId) {
        return { success: false, data: null, message: 'Teacher ID is required', error: 'Missing ID' };
      }

      const isFileLike = v => v && typeof v === 'object' && (v instanceof File || v instanceof Blob);
      const wantsFile = isFileLike(updateData?.file) || isFileLike(updateData?.profile_picture);

      // Build normalized scalar payload
      const payload = {
        // Backend routing hints
        role_key: 'Staff',
        id_prefix: 't',

        // Required name (robust fallbacks)
        name: (updateData?.name || '').trim()
          || (updateData?.latin_name || '').trim()
          || (updateData?.full_name || '').trim()
          || (updateData?.khmer_name || '').trim()
          || `${(updateData?.khmer_first_name || '').trim()} ${(updateData?.khmer_last_name || '').trim()}`.trim()
          || (base.name || base.latin_name || base.full_name || base.khmer_name || '').trim(),

        latin_name: (updateData?.latin_name || updateData?.name || '').trim() || null,
        khmer_name: (updateData?.khmer_name || '').trim() || null,
        full_name: (updateData?.full_name || updateData?.khmer_name || updateData?.latin_name || '').trim() || null,
        gender: (updateData?.gender || '').trim() || null,

        // Normalize to yyyy-mm-dd
        date_of_birth: normalizeDateToYMD(updateData?.date_of_birth) || null,

        phone_number: (updateData?.phone_number || updateData?.phone || '').trim() || null,
        email: (updateData?.email || '').trim() || null,

        department_id:
          updateData?.department_id !== undefined && updateData?.department_id !== null
            ? Number(updateData.department_id)
            : (updateData?.department?.id ? Number(updateData.department.id) : null),
        program_id:
         updateData?.program_id !== undefined && updateData?.program_id !== null
           ? Number(updateData.program_id)
           : (updateData?.program?.id ? Number(updateData.program.id) : (base.program_id ?? base.program?.id ?? null)),

        department: (updateData?.department || '').toString().trim() || null,
        position: (updateData?.position || '').trim() || null,
        degree: (updateData?.degree || '').trim() || null,
        graduated_from: (updateData?.graduated_from || '').trim() || null,
        join_at: normalizeDateToYMD(updateData?.join_at) || null,
        graduated_at: updateData?.graduated_at !== undefined && updateData?.graduated_at !== null
          ? Number(updateData.graduated_at)
          : null,
        start_year: (updateData?.start_year || '').toString().trim() || null,
        end_year: (updateData?.end_year || '').toString().trim() || null,
        experience_years:
          updateData?.experience_years !== undefined && updateData?.experience_years !== null
            ? Number(updateData.experience_years)
            : null,
        academic_year: (updateData?.academic_year || '').trim() || null,

        current_address: (updateData?.current_address || updateData?.address || '').trim() || null,
        address: (updateData?.address || '').trim() || null,
        origin: (updateData?.origin || '').trim() || null,
        place_of_birth: (updateData?.place_of_birth || '').trim() || null,
        bio: (updateData?.bio || '').trim() || null,

        is_radie:
          updateData?.radie !== undefined
            ? Boolean(updateData.radie)
            : (updateData?.is_radie !== undefined ? Boolean(updateData.is_radie) : null),
        is_active:
          updateData?.active !== undefined
            ? Boolean(updateData.active)
            : (updateData?.is_active !== undefined ? Boolean(updateData.is_active) : null),
      };

      // prune null/undefined/empty string
      Object.keys(payload).forEach(k => {
        const v = payload[k];
        if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) {
          delete payload[k];
        }
      });

      // final guards
      if (!payload.name) {
        return { success: false, data: null, message: 'Validation failed', error: 'Name is required' };
      }
      if (payload.program_id !== undefined && !Number.isFinite(payload.program_id)) {
        delete payload.program_id;
      }
      if (payload.department_id !== undefined && !Number.isFinite(payload.department_id)) {
        delete payload.department_id; // don’t send bad number
      }

      console.log('📤 Teacher update payload:', payload, 'file?', wantsFile);

      // ── with file: use multipart + _method=PUT (Laravel)
      if (wantsFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined) return;
          if (typeof v === 'boolean') formData.append(k, v ? '1' : '0');
          else formData.append(k, String(v));
        });

        const fileToUpload = isFileLike(updateData.file) ? updateData.file :
                            (isFileLike(updateData.profile_picture) ? updateData.profile_picture : null);
        if (fileToUpload) formData.append('profile_picture', fileToUpload);

        formData.append('_method', 'PUT');

        const response = await api.post(`/auth/update_user/${teacherId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return {
          success: true,
          data: response.data.user || response.data.data || response.data,
          message: response.data.message || 'Teacher updated successfully',
        };
      }

      // ── JSON PUT
      const response = await api.put(`/auth/update_user/${teacherId}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      return {
        success: true,
        data: response.data.user || response.data.data || response.data,
        message: response.data.message || 'Teacher updated successfully',
      };
    } catch (error) {
      console.error('❌ Update Teacher Error:', error?.response?.data || error.message);
      return {
        success: false,
        data: null,
        error: error?.response?.data || error.message,
        message: 'User update failed',
      };
    }
  },

  /**
   * PATCH TEACHER
   * Partially updates a teacher record
   * @param {string|Object} teacherTarget - The teacher's user_id, id, or teacher object
   * @param {Object} patchData - Partial data to update
   * @returns {Promise<Object>} Updated teacher object
   */
  async patchTeacher(teacherTarget, patchData) {
    try {
      const teacherId = resolveUserId(teacherTarget);
      if (!teacherId) {
        throw new Error('Teacher ID (user_id) is required for patch');
      }

      const response = await api.patch(`/teachers/user/${teacherId}`, patchData)
      return {
        success: true,
        data: response.data.user || response.data,
        message: response.data.message || 'Teacher updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to update teacher with ID: ${teacherId}`
      }
    }
  },

  /**
   * DELETE TEACHER
   * Deletes a teacher record
   * @param {string|Object} teacherTarget - The teacher's user_id, id, or teacher object
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteTeacher(teacherTarget) {
    let teacherId;
    try {
      teacherId = resolveUserId(teacherTarget);
      if (!teacherId) {
        throw new Error('Teacher ID (user_id) is required for deletion');
      }

      await api.delete(`/users/remove_user/${teacherId}`)
      return {
        success: true,
        data: null,
        message: 'Teacher deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to delete teacher with ID: ${teacherId}`
      }
    }
  },

  /**
   * SEARCH TEACHERS
   * Searches teachers by various criteria - client-side filtering since API might not support query params
   * @param {Object} searchCriteria - Search parameters
   * @returns {Promise<Array>} Array of matching teachers
   */
  async searchTeachers(searchCriteria) {
    try {
      // Get all teachers first, then filter client-side
      const allTeachersResponse = await this.getAllTeachers()
      if (!allTeachersResponse.success) {
        return allTeachersResponse
      }
      
      const teachers = allTeachersResponse.data || []
      
      // Apply filters
      const filteredTeachers = teachers.filter(teacher => {
        const userDetail = teacher.user_detail || {}
        
        // Text search in name fields
        if (searchCriteria.q) {
          const searchTerm = searchCriteria.q.toLowerCase()
          const latinName = (userDetail.latin_name || teacher.latin_name || '').toLowerCase()
          const khmerName = (userDetail.khmer_name || teacher.khmer_name || '').toLowerCase()
          const username = (teacher.username || '').toLowerCase()
          const email = (teacher.email || '').toLowerCase()
          
          if (!(latinName.includes(searchTerm) || khmerName.includes(searchTerm) || 
                username.includes(searchTerm) || email.includes(searchTerm))) {
            return false
          }
        }
        
        // Department filter
        if (searchCriteria.department && 
            (userDetail.department || teacher.department) !== searchCriteria.department) {
          return false
        }
        
        // Program filter
        if (searchCriteria.program && 
            (userDetail.program || teacher.program) !== searchCriteria.program) {
          return false
        }
        
        // Gender filter
        if (searchCriteria.gender && 
            (userDetail.gender || teacher.gender) !== searchCriteria.gender) {
          return false
        }
        
        // Status filter
        if (searchCriteria.status) {
          const status = (userDetail.status || teacher.status || '').toLowerCase()
          if (status !== searchCriteria.status.toLowerCase()) {
            return false
          }
        }
        
        // Academic year filter
        if (searchCriteria.academic_year && 
            (userDetail.academic_year || teacher.academic_year) !== searchCriteria.academic_year) {
          return false
        }
        
        return true
      })

      return {
        success: true,
        data: filteredTeachers,
        total: filteredTeachers.length,
        message: 'Search completed successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: 'Search failed'
      }
    }
  },

  /**
   * GET TEACHERS BY DEPARTMENT
   * Fetches teachers filtered by department using client-side filtering
   * @param {string} department - Department name
   * @returns {Promise<Array>} Array of teachers in the department
   */
  async getTeachersByDepartment(department) {
    try {
      // Use search functionality with department filter
      return await this.searchTeachers({ department })
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: `Failed to fetch teachers from ${department} department`
      }
    }
  },

  /**
   * BULK DELETE TEACHERS
   * Deletes multiple teachers by their IDs using real API
   * @param {Array<string>} teacherIds - Array of teacher user_ids
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkDeleteTeachers(teacherIds) {
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const deletePromises = teacherIds.map(async (teacherId) => {
        try {
          await api.delete(`/teachers/user/${teacherId}`)
          return { success: true, teacherId }
        } catch (error) {
          return { success: false, teacherId, error: error.response?.data || error.message }
        }
      })
      
      const results = await Promise.allSettled(deletePromises)
      const successes = results.filter(result => result.status === 'fulfilled' && result.value.success)
      const failures = results.filter(result => result.status === 'rejected' || !result.value.success)
      
      return {
        success: failures.length === 0,
        data: {
          successful: successes.map(s => s.value.teacherId),
          failed: failures.map(f => ({
            teacherId: f.value?.teacherId || 'unknown',
            error: f.value?.error || f.reason
          }))
        },
        deletedCount: successes.length,
        message: failures.length === 0 
          ? `Successfully deleted ${successes.length} teachers`
          : `Deleted ${successes.length}/${teacherIds.length} teachers. ${failures.length} failed.`
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: 'Failed to delete some or all teachers'
      }
    }
  },

  /**
   * UPDATE TEACHER STATUS
   * Updates teacher active status using real API
   * @param {string|Object} teacherTarget - The teacher's user_id, id, or teacher object
   * @param {boolean} active - Active status
   * @returns {Promise<Object>} Updated teacher object
   */
  async updateTeacherStatus(teacherTarget, active) {
    try {
      const teacherId = resolveUserId(teacherTarget);
      if (!teacherId) {
        throw new Error('Teacher ID (user_id) is required for status update');
      }

      const response = await api.patch(`/teachers/user/${teacherId}`, { 
        is_active: active,
        active: active,
        status: active ? 'Active' : 'Inactive'
      })
      
      return {
        success: true,
        data: response.data.user || response.data,
        message: `Teacher status updated to ${active ? 'active' : 'inactive'}`
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: 'Failed to update teacher status'
      }
    }
  },

  /**
   * GET ACTIVE TEACHERS COUNT
   * Retrieves the count of active teachers using client-side filtering
   * @returns {Promise<number>} Count of active teachers
   */
  async getActiveTeachersCount() {
    try {
      // Get all teachers and filter active ones on client-side since API might not have specific count endpoint
      const teachers = await this.getAllTeachers()
      if (teachers.success && Array.isArray(teachers.data)) {
        return teachers.data.filter(teacher => {
          const userDetail = teacher.user_detail || {}
          const isActive = userDetail.is_active !== undefined ? userDetail.is_active
                         : (teacher.is_active !== undefined ? teacher.is_active 
                           : (teacher.active !== undefined ? teacher.active : true))
          return isActive
        }).length
      }
      return 0
    } catch (error) {
      console.error('Failed to get active teachers count:', error)
      return 0
    }
  }
}

// Export individual functions for convenience
export const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  patchTeacher,
  deleteTeacher,
  searchTeachers,
  getTeachersPaginated,
  getTeachersByDepartment,
  bulkDeleteTeachers,
  updateTeacherStatus
} = TeacherCRUD

// Export default
export default TeacherCRUD
