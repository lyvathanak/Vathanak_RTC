import api from './axios.js';

// Import the date normalization helper from TeacherCRUD
import { normalizeDateToYMD } from './TeacherCRUD.js';

// Use the backend API endpoint for HODs (adjust as needed for your backend)
const HODS_ENDPOINT = '/head-of-departments';
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

const toYearInt = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number' && Number.isInteger(v)) return v;
  const s = String(v).trim();
  if (/^\d{4}$/.test(s)) return Number(s);
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const normGender = (g) => {
  if (g === null || g === undefined) return null;
  const s = String(g).trim().toLowerCase();
  if (['m', 'male', '1'].includes(s)) return 'Male';
  if (['f', 'female', '0'].includes(s)) return 'Female';
  // default to a valid value instead of returning '' or unknown
  return null;
};

/**
 * Map the UI form model (newHOD) to the backend /auth/register schema.
 * Anything your UI doesn't collect is set to null / sensible defaults.
 */
function buildHODRegisterPayload(h) {
  const isFile = v => v && typeof v === 'object' && (v instanceof File || v instanceof Blob);
  const incomingFile = isFile(h?.file) ? h.file : (isFile(h?.profile_picture) ? h.profile_picture : null);

  const payload = {
    // Name (fallbacks)
    name:
      String(h?.name || '').trim() ||
      String(h?.latin_name || '').trim() ||
      String(h?.full_name || '').trim() ||
      String(h?.khmer_name || '').trim() ||
      composedKhmer || '',

    latin_name: h?.latin_name || null,
    khmer_name: h?.khmer_name || composedKhmer || null,
    full_name: h?.full_name || h?.khmer_name || h?.latin_name || null,

    gender: normGender(h?.gender),
    date_of_birth: h?.date_of_birth || null,
    email: String(h?.email || '').trim() || null,
    phone_number: String(h?.phone || h?.phone_number || '').trim() || null,

    department_id: h?.department_id ? Number(h.department_id) : null,

    // media
    file: incomingFile,                                             // <— actual File here
    profile_picture: incomingFile ? null : (h?.photo_url || null),  // string/URL if any

    degree: String(h?.degree || '').trim() || null,
    graduated_from: String(h?.graduated_from || '').trim() || null,
    graduated_at: h?.graduated_at || null,
    join_at: h?.join_at || null,
    experience_years: h?.experience_years ? Number(h.experience_years) : 0,
    position: String(h?.position || 'Head of Department').trim(),
    department: String(h?.department || '').trim() || null,
    academic_year: String(h?.academic_year || '2024-2025').trim(),

    password: randomTempPassword(),
    address: String(h?.address || '').trim() || null,
    current_address: String(h?.current_address || '').trim() || null,
    origin: String(h?.origin || '').trim() || null,
    bio: String(h?.bio || '').trim() || null,
    place_of_birth: String(h?.place_of_birth || '').trim() || null,
    special: Boolean(h?.special || false),

    hire_date: h?.join_rtc || new Date().toISOString().split('T')[0],
    status: 'Active',

    is_radie: !!(h?.radie || h?.is_radie),
    is_active: h?.active === undefined ? true : !!h.active,

    id_prefix: 'h',
    role_key: 'Head Department',
  };

  if (!payload.latin_name) throw new Error('Name (latin_name) is required');
  if (!payload.khmer_name) throw new Error('Name (khmer_name) is required');
  if (!payload.phone_number) throw new Error('Phone number is required');
  if (!payload.gender) throw new Error('Gender is required');

  return payload;
}

/**
 * HOD CRUD Operations API
 */
export const HODCRUD = {

  /**
   * GET ALL HODS
   * Fetches all HODs from the database with complete information
   * @param {Object} params - Query parameters for filtering, sorting, pagination
   * @returns {Promise<Array>} Array of HOD objects with full details
   */
  async getAllHODs(params = {}) {
    try {
      const response = await api.get('/users/get_all_users?role=headdepartment', { params });

      const usersData = response?.data?.users || {};
      const allStaff = usersData?.data || [];

      // include: role contains "head", position contains "head", OR has head_department
      const hods = allStaff.filter((staff) => {
        const hasHODRole = (staff.roles || []).some((role) => {
          const s = (role.role_key || role.name || role.description || '').toLowerCase();
          return s.includes('head');
        });
        const pos = (staff.position || staff.user_detail?.position || '').toLowerCase();
        const hasHODPosition = pos.includes('head');
        return hasHODRole || hasHODPosition || !!staff.head_department;
      });

      const transformedHODs = hods.map((hod) => {
        const userDetail = hod.user_detail || {};
        const hd = hod.head_department || {};
        const hodRole =
          (hod.roles || []).find((r) =>
            String(r.role_key || r.name || r.description || '').toLowerCase().includes('head')
          ) || (hod.roles || [])[0];

        // derive department from head_department when available
        const depId =
          userDetail.department_id ??
          hod.department_id ??
          hd.id ??
          hod.department?.id ??
          null;

        const depName =
          userDetail.department?.department_name ??
          hod.department?.department_name ??
          hd.department_name ??
          userDetail.department ??
          hod.department ??
          null; // Changed from 'Head Department' to null

        return {
          // Core user fields
          user_id: hod.user_id ?? hod.id ?? userDetail.user_id ?? null,
          id: hod.id,
          name: hod.name || userDetail.name || '',
          email: hod.email || userDetail.email || '',
          created_at: hod.created_at || userDetail.created_at || null,
          updated_at: hod.updated_at || userDetail.updated_at || null,
          roles: hod.roles || [],

          // Identification
          id_card: userDetail.id_card || hod.id_card || null,
          latin_name: userDetail.latin_name || hod.latin_name || hod.name || '',
          khmer_name:
            userDetail.khmer_name ||
            hod.khmer_name ||
            `${userDetail.khmer_first_name || ''} ${userDetail.khmer_last_name || ''}`.trim(),
          khmer_first_name: userDetail.khmer_first_name || null,
          khmer_last_name: userDetail.khmer_last_name || null,
          full_name:
            userDetail.full_name ||
            hod.full_name ||
            userDetail.khmer_name ||
            userDetail.latin_name ||
            hod.name ||
            '',

          // Personal / contact
          gender: userDetail.gender || hod.gender || null,
          date_of_birth: userDetail.date_of_birth || hod.date_of_birth || null,
          phone_number: userDetail.phone_number || hod.phone_number || '',
          phone:
            userDetail.phone ||
            hod.phone ||
            userDetail.phone_number ||
            hod.phone_number ||
            '',

          // Professional (fixed)
          department_id: depId != null ? Number(depId) : null,
          sub_department_id: userDetail.sub_department_id ?? hod.sub_department_id ?? null,
          department: depName || '', // Convert null to empty string
          department_name: depName || '', // Also set department_name for consistency
          section: userDetail.section || hod.section || '',
          position: userDetail.position || hod.position || hodRole?.description || 'Head of Department',
          degree: userDetail.degree || hod.degree || '',
          graduated_from: userDetail.graduated_from || hod.graduated_from || '',
          graduated_at: userDetail.graduated_at || hod.graduated_at || null,
          join_at: userDetail.join_at || hod.join_at || null,
          experience_years: userDetail.experience_years ?? hod.experience_years ?? 0,
          academic_year: userDetail.academic_year || hod.academic_year || '2024-2025',

          // Addresses
          address: userDetail.address || hod.address || '',
          current_address: userDetail.current_address || hod.current_address || '',
          origin: userDetail.origin || hod.origin || '',
          place_of_birth: userDetail.place_of_birth || hod.place_of_birth || '',

          // Extra
          bio: userDetail.bio || hod.bio || '',

          // Status
          is_radie: userDetail.is_radie ?? hod.is_radie ?? hod.radie ?? false,
          radie: userDetail.is_radie ?? hod.is_radie ?? hod.radie ?? false,
          is_active:
            userDetail.is_active !== undefined
              ? userDetail.is_active
              : hod.is_active !== undefined
              ? hod.is_active
              : hod.active !== undefined
              ? hod.active
              : true,
          active:
            userDetail.is_active !== undefined
              ? userDetail.is_active
              : hod.is_active !== undefined
              ? hod.is_active
              : hod.active !== undefined
              ? hod.active
              : true,
          status: hod.status || ((hod.is_active || hod.active) ? 'Active' : 'Inactive'),

          // Media
          profile_picture: userDetail.profile_picture || hod.profile_picture || hod.photo_url || '',
          photo_url: userDetail.profile_picture || hod.profile_picture || hod.photo_url || '',
          file: userDetail.file || hod.file || '',

          // Keep originals (useful for edit forms)
          user_detail: userDetail,
          head_department: hd,
        };
      });

      return {
        success: true,
        data: transformedHODs,
        total: transformedHODs.length,
        pagination: {
          current_page: usersData.current_page || 1,
          total: transformedHODs.length,
        },
        message: response.data.message || 'HODs fetched successfully',
      };
    } catch (error) {
      console.error('❌ Get all HODs error:', error.response?.data || error.message);
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: 'Failed to fetch HODs',
      };
    }
  },


  /**
   * GET HOD BY ID
   * Fetches a single HOD by their ID with complete information
   * @param {string} hodId - The HOD's ID
   * @returns {Promise<Object>} HOD object with full details
   */
  async getHODById(hodId) {
    try {
      const response = await api.get(`/users/get_user_by_id/${hodId}`)
      const hod = response.data.data || response.data;
      
      // Handle nested structure if present
      const userDetail = hod.user_detail || {};
      
      const transformedHOD = {
        // Core user fields
        user_id: hod.user_id,
        id: hod.id,
        name: hod.name || userDetail.name,
        email: hod.email,
        created_at: hod.created_at,
        updated_at: hod.updated_at,
        roles: hod.roles || [],
        
        // HOD specific fields from user_detail
        id_card: userDetail.id_card || hod.id_card,
        latin_name: userDetail.latin_name || hod.latin_name || hod.name,
        khmer_name: userDetail.khmer_name || hod.khmer_name,
        full_name: userDetail.full_name || hod.full_name || userDetail.khmer_name || userDetail.latin_name,
        gender: userDetail.gender || hod.gender,
        date_of_birth: userDetail.date_of_birth || hod.date_of_birth,
        phone_number: userDetail.phone_number || hod.phone_number || userDetail.phone,
        phone: userDetail.phone || hod.phone || userDetail.phone_number,
        
        // Professional info
        department_id: userDetail.department_id || hod.department_id,
        department: userDetail.department || hod.department,
        position: userDetail.position || hod.position || 'Head of Department',
        degree: userDetail.degree || hod.degree,
        graduated_from: userDetail.graduated_from || hod.graduated_from,
        graduated_at: userDetail.graduated_at || hod.graduated_at,
        join_at: userDetail.join_at || hod.join_at,
        experience_years: userDetail.experience_years || hod.experience_years || 0,
        academic_year: userDetail.academic_year || hod.academic_year,
        
        // Contact info
        current_address: userDetail.current_address || hod.current_address,
        address: userDetail.address || hod.address,
        origin: userDetail.origin || hod.origin,
        place_of_birth: userDetail.place_of_birth || hod.place_of_birth,
        
        // Additional info
        bio: userDetail.bio || hod.bio,
        
        // Status fields
        is_radie: userDetail.is_radie ?? hod.is_radie ?? hod.radie ?? false,
        radie: userDetail.is_radie ?? hod.is_radie ?? hod.radie ?? false,
        is_active: userDetail.is_active !== undefined ? userDetail.is_active
                : (hod.is_active !== undefined ? hod.is_active : hod.active !== undefined ? hod.active : true),
        active: userDetail.is_active !== undefined ? userDetail.is_active
             : (hod.is_active !== undefined ? hod.is_active : hod.active !== undefined ? hod.active : true),
        status: hod.status || (hod.is_active || hod.active ? 'Active' : 'Inactive'),
        
        // Media
        profile_picture: userDetail.profile_picture || hod.profile_picture || hod.photo_url || '',
        photo_url: userDetail.profile_picture || hod.profile_picture || hod.photo_url || '',
        file: userDetail.file || hod.file || '',
        
        // Keep original nested structure for compatibility
        user_detail: userDetail
      };
      
      return {
        success: true,
        data: transformedHOD,
        message: 'HOD fetched successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to fetch HOD with ID: ${hodId}`
      }
    }
  },

  /**
   * Create Head of Department (with or without profile picture).
   * Expects buildHODRegisterPayload(formModel) to return:
   *   { ..., file: File|Blob|null, profile_picture: string|null, department_id: number|string, ... }
   */
  async createHOD(formModel) {
    try {
      console.log('📋 Input form model (HOD):', formModel);

      const payload = buildHODRegisterPayload(formModel);
      console.log('🚀 Sending HOD payload to backend:', {
        name: payload.name,
        email: payload.email,
        phone_number: payload.phone_number,
        gender: payload.gender,
        department_id: payload.department_id,
        hasFile: payload.file instanceof File,
      });

      // ---- Branch A: multipart with image ----
      if (payload.file && (payload.file instanceof File || payload.file instanceof Blob)) {
        const formData = new FormData();

        // append scalars (skip file/profile_picture)
        Object.entries(payload).forEach(([k, v]) => {
          if (v == null) return;
          if (k === 'file' || k === 'profile_picture') return;
          formData.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
        });

        // append the binary once under backend field name
        formData.append('profile_picture', payload.file);

        const response = await api.post(`${AUTH_ENDPOINT}/register`, formData);
        return {
          success: true,
          data: response.data?.user ?? response.data,
          message: response.data?.message ?? 'HOD created successfully',
        };
      }

      // ---- Branch B: pure JSON (no image) ----
      const { file, profile_picture, ...jsonPayload } = payload;

      // Clean empties
      Object.keys(jsonPayload).forEach((k) => {
        const v = jsonPayload[k];
        if (v == null) delete jsonPayload[k];
        else if (typeof v === 'string' && v.trim() === '') delete jsonPayload[k];
      });

      // Ensure numeric where needed
      if (jsonPayload.department_id !== undefined) {
        jsonPayload.department_id = Number(jsonPayload.department_id);
      }

      const response = await api.post(
        `${AUTH_ENDPOINT}/register`,
        jsonPayload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      return {
        success: true,
        data: response.data?.user ?? response.data,
        message: response.data?.message ?? 'HOD created successfully',
      };

    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      console.error('❌ Create HOD Error:', data || error.message);
      console.error('❌ Full error response:', error.response);
      console.error('❌ Error status:', status);
      if (data) try { console.error('❌ Error data details:', JSON.stringify(data, null, 2)); } catch {}

      let message = 'Failed to create HOD';
      let errorsOut = [];

      if (data) {
        if (typeof data === 'string') message = data;
        else if (data.message) message = data.message;

        if (data.errors) errorsOut = data.errors;
        else if (data.error) errorsOut = [data.error];
      }

      return {
        success: false,
        data: null,
        error: data || error.message,
        message,
        errors: errorsOut,
        validation: errorsOut,
        status,
      };
    }
  },

  /**
   * UPDATE HOD
   * Updates an existing HOD record
   * @param {string|Object} hodTarget - The HOD's user_id, id, or HOD object
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated HOD object
   */
  async updateHOD(hodTarget, updateData) {
    let hodId;
    try {
      // Resolve HOD ID
      const base = (typeof hodTarget === 'object' && hodTarget !== null) ? hodTarget : {};
      if (typeof hodTarget === 'object' && hodTarget !== null) {
        hodId = hodTarget.user_id ?? hodTarget.id ?? hodTarget.user?.id ?? null;
      } else {
        hodId = hodTarget;
      }
      if (!hodId) {
        console.error('❌ No valid HOD ID found in target:', hodTarget);
        throw new Error('No HOD ID provided');
      }

      console.log('🔍 Resolved HOD ID:', hodId, 'from target:', hodTarget);

      const isFileLike = v => v && typeof v === 'object' && (v instanceof File || v instanceof Blob);
      const wantsFile = isFileLike(updateData?.file) || isFileLike(updateData?.profile_picture);

      // 👉 Build payload FIRST
      const payload = {
        role_key: 'Head Department',
        id_prefix: 'h',

        name: (updateData?.name || '').trim()
          || (updateData?.latin_name || '').trim()
          || (updateData?.full_name || '').trim()
          || (updateData?.khmer_name || '').trim()
          || (base.name || base.latin_name || base.full_name || base.khmer_name || '').trim(),

        latin_name: (updateData?.latin_name || '').trim() || null,
        khmer_name: (updateData?.khmer_name || '').trim() || null,
        full_name: (updateData?.full_name || updateData?.khmer_name || updateData?.latin_name || '').trim() || null,

        khmer_first_name: updateData?.khmer_first_name || (updateData?.khmer_name ? updateData.khmer_name.split(' ')[0] : null),
        khmer_last_name: updateData?.khmer_last_name || (updateData?.khmer_name ? updateData.khmer_name.split(' ').slice(1).join(' ') : null),

        gender: (updateData?.gender || '').trim() || null,
        date_of_birth: normalizeDateToYMD(updateData?.date_of_birth) || null,

        phone_number: (updateData?.phone_number || updateData?.phone || '').trim() || null,
        email: (updateData?.email || '').trim() || null,

        // Temporary placeholder, will set department_id below after we resolve it once
        department_id: null,

        position: (updateData?.position || 'Head of Department').trim(),
        degree: (updateData?.degree || '').trim() || null,
        graduated_from: (updateData?.graduated_from || '').trim() || null,
        graduated_at: updateData?.graduated_at !== undefined && updateData?.graduated_at !== null ? Number(updateData.graduated_at) : null,
        join_at: normalizeDateToYMD( updateData?.join_at) || null,

        academic_year: (updateData?.academic_year || '').trim() || null,

        address: ( updateData?.address || '').trim() || null,
        current_address: (updateData?.current_address || '').trim() || null,
        origin: (updateData?.origin || '').trim() || null,
        place_of_birth: (updateData?.place_of_birth || '').trim() || null,
        bio: (updateData?.bio || '').trim() || null,

        experience: updateData?.experience_years ? `${updateData.experience_years} years` : null,

        is_radie: updateData?.radie !== undefined ? Boolean(updateData.radie)
          : (updateData?.is_radie !== undefined ? Boolean(updateData.is_radie) : null),
        is_active: updateData?.active !== undefined ? Boolean(updateData.active)
          : (updateData?.is_active !== undefined ? Boolean(updateData.is_active) : null),
        special: Boolean(updateData?.special || false),
      };

      // 👉 Resolve department_id ONCE (number)
      const depIdRaw =
        updateData?.department_id ??
        base?.department_id ??
        base?.head_department?.id ??   // ✅ add this
        base?.head_department_id ??    // ✅ and this (in case your API returns it)
        base?.user_detail?.department_id ??
        base?.department?.id;

      if (depIdRaw !== undefined && depIdRaw !== null && depIdRaw !== '') {
        payload.department_id = Number(depIdRaw);
      } else {
        delete payload.department_id; // keep it out if truly empty
      }


      // Drop year fields if not real integers (prevents "must be an integer")
      ['graduated_at'].forEach((k) => {
        const v = payload[k];
        if (v === null || v === undefined || v === '' || Number.isNaN(v)) {
          delete payload[k];
        }
      });

      // 👉 Mirror into nested user_detail for backends that update related tables
      if (payload.department_id !== undefined) {
        payload.user_detail = { ...(payload.user_detail || {}), department_id: payload.department_id };
      }

      // (Optional) prune null/empty values
      // Object.keys(payload).forEach(k => {
      //   const v = payload[k];
      //   if (v === null || v === undefined || v === '') delete payload[k];
      // });

      console.log('🚀 HOD update payload (JSON):', payload);
      console.log('📋 Department ID being sent (as number):', payload.department_id, typeof payload.department_id);

      // 👉 File upload branch
      if (wantsFile) {
        const formData = new FormData();

        // Flatten scalars
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== null && v !== undefined) {
            formData.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
          }
        });

        // Ensure both flat and nested department_id exist in multipart
        if (typeof payload.department_id === 'number' && Number.isFinite(payload.department_id)) {
          formData.set('department_id', String(payload.department_id));
          formData.set('user_detail[department_id]', String(payload.department_id));
        }

        // File
        const file = isFileLike(updateData?.file) ? updateData.file : updateData.profile_picture;
        formData.set('profile_picture', file);
        formData.set('_method', 'PUT');

        console.log('📦 Sending HOD update with file (FormData)');
        const response = await api.post(`/auth/update_user/${hodId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }, // or omit and let Axios set boundary
        });

        return {
          success: true,
          data: response.data?.user ?? response.data,
          message: response.data?.message ?? 'HOD updated successfully',
        };
      }

      // 👉 JSON branch (no file)
      console.log('🧾 Sending HOD update as JSON');
      const response = await api.put(`/auth/update_user/${hodId}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('✅ HOD update response:', response.data);
      console.log('🔍 Response department_id:', response.data?.data?.user_detail?.department_id);

      return {
        success: true,
        data: response.data?.user ?? response.data,
        message: response.data?.message ?? 'HOD updated successfully',
      };

    } catch (error) {
      console.error('❌ Update HOD Error:', error?.response?.data || error.message);
      return {
        success: false,
        data: null,
        error: error?.response?.data || error.message,
        message: `Failed to update HOD with ID: ${hodId}`,
      };
    }
  },



  /**
   * PATCH HOD
   * Partially updates a HOD record
   * @param {string|Object} hodTarget - The HOD's user_id, id, or HOD object
   * @param {Object} patchData - Partial data to update
   * @returns {Promise<Object>} Updated HOD object
   */
  async patchHOD(hodTarget, patchData) {
    try {
      const hodId = resolveUserId(hodTarget);
      if (!hodId) {
        throw new Error('HOD ID (user_id) is required for patch');
      }

      const response = await api.patch(`/hods/user/${hodId}`, patchData)
      return {
        success: true,
        data: response.data.user || response.data,
        message: response.data.message || 'HOD updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to update HOD with ID: ${hodId}`
      }
    }
  },

  /**
   * DELETE HOD
   * Deletes a HOD record
   * @param {string|Object} hodTarget - The HOD's user_id, id, or HOD object
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteHOD(hodTarget) {
    let hodId;
    try {
      hodId = resolveUserId(hodTarget);
      if (!hodId) {
        throw new Error('HOD ID (user_id) is required for deletion');
      }

      await api.delete(`/users/remove_user/${hodId}`)
      return {
        success: true,
        data: null,
        message: 'HOD deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to delete HOD with ID: ${hodId}`
      }
    }
  },

  /**
   * SEARCH HODS
   * Searches HODs by various criteria - client-side filtering since API might not support query params
   * @param {Object} searchCriteria - Search parameters
   * @returns {Promise<Array>} Array of matching HODs
   */
  async searchHODs(searchCriteria) {
    try {
      // Get all HODs first, then filter client-side
      const allHODsResponse = await this.getAllHODs()
      if (!allHODsResponse.success) {
        return allHODsResponse
      }
      
      const hods = allHODsResponse.data || []
      
      // Apply filters
      const filteredHODs = hods.filter(hod => {
        const userDetail = hod.user_detail || {}
        
        // Text search in name fields
        if (searchCriteria.q) {
          const query = searchCriteria.q.toLowerCase()
          const searchableFields = [
            hod.name, hod.latin_name, hod.khmer_name, hod.full_name, hod.email,
            userDetail.name, userDetail.latin_name, userDetail.khmer_name, userDetail.full_name, userDetail.email
          ].filter(Boolean)
          
          if (!searchableFields.some(field => field.toLowerCase().includes(query))) {
            return false
          }
        }
        
        // Department filter
        if (searchCriteria.department && 
            (userDetail.department || hod.department) !== searchCriteria.department) {
          return false
        }
        
        // Program filter
        if (searchCriteria.program && 
            (userDetail.program || hod.program) !== searchCriteria.program) {
          return false
        }
        
        // Gender filter
        if (searchCriteria.gender && 
            (userDetail.gender || hod.gender) !== searchCriteria.gender) {
          return false
        }
        
        // Status filter
        if (searchCriteria.status) {
          const isActive = userDetail.is_active !== undefined ? userDetail.is_active : hod.is_active
          if ((searchCriteria.status === 'Active') !== isActive) {
            return false
          }
        }
        
        // Academic year filter
        if (searchCriteria.academic_year && 
            (userDetail.academic_year || hod.academic_year) !== searchCriteria.academic_year) {
          return false
        }
        
        return true
      })

      return {
        success: true,
        data: filteredHODs,
        total: filteredHODs.length,
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
   * GET HODS BY DEPARTMENT
   * Fetches HODs filtered by department using client-side filtering
   * @param {string} department - Department name
   * @returns {Promise<Array>} Array of HODs in the department
   */
  async getHODsByDepartment(department) {
    try {
      // Use search functionality with department filter
      return await this.searchHODs({ department })
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: `Failed to fetch HODs from ${department} department`
      }
    }
  },

  /**
   * BULK DELETE HODS
   * Deletes multiple HODs by their IDs using real API
   * @param {Array<string>} hodIds - Array of HOD user_ids
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkDeleteHODs(hodIds) {
    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const deletePromises = hodIds.map(async (hodId) => {
        const result = await this.deleteHOD(hodId)
        return { hodId, ...result }
      })
      
      const results = await Promise.allSettled(deletePromises)
      const successes = results.filter(result => result.status === 'fulfilled' && result.value.success)
      const failures = results.filter(result => result.status === 'rejected' || !result.value.success)
      
      return {
        success: failures.length === 0,
        data: {
          successful: successes.map(s => s.value.hodId),
          failed: failures.map(f => ({
            hodId: f.value?.hodId || 'unknown',
            error: f.value?.error || f.reason
          }))
        },
        deletedCount: successes.length,
        message: failures.length === 0 
          ? `Successfully deleted ${successes.length} HODs`
          : `Deleted ${successes.length}/${hodIds.length} HODs. ${failures.length} failed.`
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: 'Failed to delete some or all HODs'
      }
    }
  },

  /**
   * UPDATE HOD STATUS
   * Updates HOD active status using real API
   * @param {string|Object} hodTarget - The HOD's user_id, id, or HOD object
   * @param {boolean} active - Active status
   * @returns {Promise<Object>} Updated HOD object
   */
  async updateHODStatus(hodTarget, active) {
    try {
      const hodId = resolveUserId(hodTarget);
      if (!hodId) {
        throw new Error('HOD ID (user_id) is required for status update');
      }

      const response = await api.patch(`/hods/user/${hodId}`, { 
        is_active: active,
        active: active,
        status: active ? 'Active' : 'Inactive'
      })
      
      return {
        success: true,
        data: response.data.user || response.data,
        message: `HOD status updated to ${active ? 'active' : 'inactive'}`
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: 'Failed to update HOD status'
      }
    }
  },

  /**
   * GET ACTIVE HODS COUNT
   * Retrieves the count of active HODs using client-side filtering
   * @returns {Promise<number>} Count of active HODs
   */
  async getActiveHODsCount() {
    try {
      // Get all HODs and filter active ones on client-side since API might not have specific count endpoint
      const hods = await this.getAllHODs()
      if (hods.success && Array.isArray(hods.data)) {
        const activeCount = hods.data.filter(hod => {
          const userDetail = hod.user_detail || {}
          return userDetail.is_active !== undefined ? userDetail.is_active : hod.is_active
        }).length
        return activeCount
      }
      return 0
    } catch (error) {
      console.error('Failed to get active HODs count:', error)
      return 0
    }
  }
}

// Export individual functions for convenience
export const {
  getAllHODs,
  getHODById,
  createHOD,
  updateHOD,
  patchHOD,
  deleteHOD,
  searchHODs,
  getHODsByDepartment,
  bulkDeleteHODs,
  updateHODStatus
} = HODCRUD

// Export default
export default HODCRUD
