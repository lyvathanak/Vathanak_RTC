import api from "./axios.js";

// Use the backend API endpoint for students (adjust as needed for your backend)
const STUDENTS_ENDPOINT = "/students";
const AUTH_ENDPOINT = "/auth";

// generate a temporary password if your backend requires it
function randomTempPassword() {
  return "Temp@" + Math.random().toString(36).slice(2, 8);
}

// Small helper
function resolveUserId(target) {
  if (typeof target === "object" && target !== null) {
    return target.user_id ?? target.id ?? null;
  }
  return target ?? null;
}

// --- helpers to ensure start_year is present ---
function toYear(v) {
  if (v === undefined || v === null) return null;
  const m = String(v).match(/\b(19|20)\d{2}\b/);
  const y = m ? parseInt(m[0], 10) : null;
  return Number.isFinite(y) ? y : null;
}

function inferStartYear(s) {
  // Try several sources in order
  const candidates = [
    s?.start_year,                 // exact field if present
    s?.startYear,                  // camelCase variant
    s?.current_program?.start_year,
    s?.current_program?.year_started,
    s?.academic_year,              // "2024-2025" or "2025"
    s?.bac_from,                   // sometimes a single year
  ];
  for (const c of candidates) {
    const y = toYear(c);
    if (y) return y;
  }
  // Last-resort default: current academic intake (this year)
  return new Date().getFullYear();
}

const normBool = (v) => v === true || v === 1 || v === "1" || v === "true";

/**
 * Map the UI form model (newStudent) to the backend /auth/register schema.
 * Anything your UI doesn't collect is set to null / sensible defaults.
 */
function buildRegisterPayload(s) {
  // Ensure required fields have proper defaults
  const payload = {
    // collected by UI - ensure non-null strings
    name: String(s?.latin_name || s?.name || "").trim() || null,
    latin_name: String(s?.latin_name || "").trim() || null,
    khmer_name: String(s?.khmer_name || "").trim() || null,
    khmer_first_name: String(s?.khmer_first_name || "").trim() || null,
    khmer_last_name: String(s?.khmer_last_name || "").trim() || null,
    gender: String(s?.gender || "").trim() || null,
    date_of_birth: s?.date_of_birth || null,
    email: String(s?.email || "").trim() || null,
    phone_number: String(s?.phone_number || s?.phone || "").trim() || null,

    // IDs as numbers or null
    department_id: s?.department_id ? Number(s.department_id) : null,
    sub_department_id: s?.sub_department_id
      ? Number(s.sub_department_id)
      : null,
    program_id: s?.program_id ? Number(s.program_id) : null,

    // media (handle file separately in createStudent)
    file: s?.file || null,
    profile_picture: s?.profile_picture || null,

    // academic
    degree: String(s?.program || s?.degree || "").trim() || null,
    branch: String(s?.branch || "Battambang").trim(),
    academic_year: String(s?.academic_year || "").trim() || null,

    // required by backend but not in UI → safe defaults with proper types
    password: randomTempPassword(),
    address: String(s?.current_address || s?.address || "").trim() || null,
    origin: String(s?.origin || "").trim() || null,
    special: Boolean(s?.special || false), // Ensure boolean type
    bio: String(s?.bio || "").trim() || null,
    guardian: String(s?.guardian || "").trim() || null,
    high_school: String(s?.high_school || "").trim() || null,
    mcs_no: String(s?.mcs_no || "").trim() || null,
    can_id: String(s?.can_id || "").trim() || null,
    bac_grade: String(s?.bac_grade || "").trim() || null,
    bac_from: String(s?.bac_from || "").trim() || null,
    bac_program: String(s?.bac_program || "").trim() || null,
    option: s?.option || null,
    history: String(s?.history || "").trim() || null,
    redoubles: Array.isArray(s?.redoubles) ? s.redoubles : [],
    scholarships: String(s?.scholarships || "").trim() || null,
    grade: String(s?.grade || "").trim() || null,
    is_radie: Boolean(s?.is_radie || false), // Ensure boolean type
    is_active: s?.is_active === undefined ? true : Boolean(s.is_active), // Default true
    current_address:
      String(s?.current_address || s?.address || "").trim() || null,
    father_name: String(s?.father_name || "").trim() || null,
    father_phone: String(s?.father_phone || "").trim() || null,
    mother_name: String(s?.mother_name || "").trim() || null,
    mother_phone: String(s?.mother_phone || "").trim() || null,
    guardian_name: String(s?.guardian_name || "").trim() || null,
    guardian_phone: String(s?.guardian_phone || "").trim() || null,
    place_of_birth: String(s?.place_of_birth || "").trim() || null,
    start_year: inferStartYear(s),

    // fixed keys expected by backend
    id_prefix: "e",
    role_key: (s?.role_key?.toString().toLowerCase() === "student") ? "Student" : "Student",
  };

  // Validate required fields
  if (!payload.name) {
    throw new Error("Name (latin_name) is required");
  }
  // if (!payload.email) {
  //   throw new Error("Email is required");
  // }
  if (!payload.phone_number) {
    throw new Error("Phone number is required");
  }
  if (!payload.gender) {
    throw new Error("Gender is required");
  }
  if (!payload.department_id) {
    throw new Error("Department is required");
  }
  if (!payload.academic_year) {
    throw new Error("Academic year is required");
  }

  return payload;
}

/**
 * Student CRUD Operations API
 */
export const StudentCRUD = {
  /**
   * GET ALL STUDENTS
   * Fetches all students from the database with complete information
   * @param {Object} params - Query parameters for filtering, sorting, pagination
   * @returns {Promise<Array>} Array of student objects with full details
   */
  // ✅ Fixed: reads from response.data.users.data like the Teachers function
  async getAllStudents(params = {}) {
    try {
      const response = await api.get("/users/get_all_users?role=student", {
        params,
      });

      // Extract users from the actual backend structure
      const usersData = response.data.users || {};
      const students = usersData.data || [];

      // Transform the data to a rich "student" shape, but stay resilient if backend lacks details
      const transformedStudents = students.map((student) => {
        // Roles: pick something sensible for department/label
        const studentRole =
          student.roles?.find((r) => r.role_key?.toLowerCase() === "student") ||
          student.roles?.[0];

        // If the backend later adds nested detail, keep this pattern (fallbacks will keep things stable)
        const userDetail = student.user_detail || {};

        // --- extract current/active program from backend shape ---
        const currentProgram =
          student.current_program ||
          (Array.isArray(student.user_programs) && student.user_programs.length
            ? student.user_programs[student.user_programs.length - 1] // fallback: last known program
            : null);

        const derivedProgramId =
          currentProgram?.program_id ??
          currentProgram?.program?.id ??
          null;

        const derivedProgramName =
          currentProgram?.program?.program_name ??
          null;

        const derivedDegreeLevel =
          currentProgram?.program?.degree_level ??
          null;
          
        return {
          // Core user fields from backend
          user_id: student.id, // backend uses 'id' as user identifier
          id: student.id,
          name: student.name || userDetail.name || "",
          email: student.email || "",

          // Relations
          roles: student.roles || [],
          groups: student.groups || [],

          // IDs & names
          id_card: userDetail.id_card || student.id_card || "",
          latin_name:
            userDetail.latin_name || student.latin_name || student.name || "",
          khmer_name:
            userDetail.khmer_name ||
            student.khmer_name ||
            `${userDetail.khmer_first_name || ""} ${userDetail.khmer_last_name || ""}`.trim(),
          khmer_first_name: userDetail.khmer_first_name || null,
          khmer_last_name: userDetail.khmer_last_name || null,

          // Demographics
          gender: userDetail.gender || student.gender || null,
          date_of_birth: userDetail.date_of_birth || student.date_of_birth || null,
          phone_number: userDetail.phone_number || student.phone_number || "",

          // Academic
          department_id:
            userDetail.department_id ?? student.department_id ?? null,
          sub_department_id:
            userDetail.sub_department_id ?? student.sub_department_id ?? null,

          // prefer current_program / user_programs if top-level missing
          program_id:
            userDetail.program_id ??
            student.program_id ??
            derivedProgramId,

          // handy for UI without extra lookup
          program_name:
            student.program_name ??
            userDetail.program_name ??
            derivedProgramName ?? "",

          degree:
            userDetail.degree ??
            student.degree ??
            derivedDegreeLevel ?? "",

          academic_year:
            userDetail.academic_year ?? student.academic_year ?? "",

          grade: userDetail.grade ?? student.grade ?? "",
          branch: userDetail.branch ?? student.branch ?? "",

          // (optional but useful) keep raw program relations for future features
          user_programs: Array.isArray(student.user_programs) ? student.user_programs : [],
          current_program: student.current_program || null,
          current_generation_id: currentProgram?.generation_id ?? null,
          current_academic_year_id: currentProgram?.academic_year_id ?? null,

          // Address/contact
          address:
            userDetail.address ||
            student.address ||
            userDetail.current_address ||
            student.current_address ||
            "",
          current_address:
            userDetail.current_address ||
            student.current_address ||
            userDetail.address ||
            student.address ||
            "",
          origin: userDetail.origin || student.origin || "",

          // Personal/guardian info
          bio: userDetail.bio || student.bio || "",
          guardian: userDetail.guardian || student.guardian || "",
          guardian_name:
            userDetail.guardian_name ?? student.guardian_name ?? null,
          guardian_phone:
            userDetail.guardian_phone ?? student.guardian_phone ?? null,
          father_name: userDetail.father_name || student.father_name || "",
          father_phone: userDetail.father_phone || student.father_phone || "",
          mother_name: userDetail.mother_name || student.mother_name || "",
          mother_phone: userDetail.mother_phone || student.mother_phone || "",
          place_of_birth:
            userDetail.place_of_birth || student.place_of_birth || "",

          // Educational background
          high_school: userDetail.high_school || student.high_school || "",
          mcs_no: userDetail.mcs_no || student.mcs_no || "",
          can_id: userDetail.can_id || student.can_id || "",
          bac_grade: userDetail.bac_grade || student.bac_grade || "",
          bac_from: userDetail.bac_from || student.bac_from || "",
          bac_program: userDetail.bac_program || student.bac_program || "",

          // Additional fields
          option: userDetail.option || student.option || "",
          history: userDetail.history || student.history || "",
          redoubles: userDetail.redoubles || student.redoubles || [],
          scholarships: userDetail.scholarships || student.scholarships || "",
          special: userDetail.special ?? student.special ?? false,
          is_radie: userDetail.is_radie ?? student.is_radie ?? false,
          is_active:
            userDetail.is_active !== undefined
              ? userDetail.is_active
              : student.is_active !== undefined
              ? student.is_active
              : true,

          // Media
          profile_picture:
            userDetail.profile_picture || student.profile_picture || "",
          file: userDetail.file || student.file || "",

          // System fields
          created_at: student.created_at || userDetail.created_at || null,
          updated_at: student.updated_at || userDetail.updated_at || null,

          // Keep the nested structure for compatibility
          user_detail: userDetail,
        };

      });

      return {
        success: true,
        data: transformedStudents,
        total: transformedStudents.length,
        pagination: {
          current_page: usersData.current_page || 1,
          total: usersData.total ?? transformedStudents.length,
          per_page: usersData.per_page ?? transformedStudents.length,
          last_page: usersData.last_page ?? 1,
        },
        message: response.data.message || "Students fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: "Failed to fetch students",
      };
    }
  },

  /**
   * GET STUDENT BY ID
   * Fetches a single student by their ID with complete information
   * @param {string} studentId - The student's ID
   * @returns {Promise<Object>} Student object with full details
   */
  async getStudentById(studentId) {
    try {
      const response = await api.get(`/users/get_user_by_id/${studentId}`);

      // The API returns { user: { ... } }
      const student = response.data.user || response.data.data || response.data;

      // Nested detail
      const userDetail = student.user_detail || {};

      // --- derive current/active program from user_detail.user_programs ---
      const programsList =
        (Array.isArray(userDetail.user_programs) && userDetail.user_programs) ||
        (Array.isArray(student.user_programs) && student.user_programs) ||
        [];

      // pick the last item as a reasonable "current" fallback
      const activeProg = programsList.length
        ? programsList[programsList.length - 1]
        : null;

      const derivedProgramId = activeProg?.program_id ?? null;
      const derivedGenerationId = activeProg?.generation_id ?? null;
      const derivedAcademicYearId = activeProg?.academic_year_id ?? null;

      const transformedStudent = {
        // Main user fields
        user_id: student.user_id ?? student.id ?? userDetail.user_id ?? null,
        id: student.id,
        name: student.name || userDetail.name || "",
        email: student.email || "",

        // Relations
        roles: student.roles || [],
        groups: student.groups || [],

        // IDs & names
        id_card: userDetail.id_card || student.id_card || "",
        latin_name:
          userDetail.latin_name || student.latin_name || student.name || "",
        khmer_name:
          userDetail.khmer_name ||
          student.khmer_name ||
          `${userDetail.khmer_first_name || ""} ${
            userDetail.khmer_last_name || ""
          }`.trim(),
        khmer_first_name: userDetail.khmer_first_name || null,
        khmer_last_name: userDetail.khmer_last_name || null,

        // Demographics
        gender: userDetail.gender || student.gender || null,
        date_of_birth: userDetail.date_of_birth || student.date_of_birth || null,
        phone_number: userDetail.phone_number || student.phone_number || "",

        // Academic
        department_id:
          userDetail.department_id ?? student.department_id ?? null,
        sub_department_id:
          userDetail.sub_department_id ?? student.sub_department_id ?? null,

        // prefer derived id from user_programs when top-level missing
        program_id:
          userDetail.program_id ??
          student.program_id ??
          derivedProgramId,

        // (your endpoint doesn’t return program_name here; keep empty for now
        // or fill it later on the UI by looking up programs list)
        program_name: userDetail.program_name || student.program_name || "",

        degree: userDetail.degree ?? student.degree ?? "",
        academic_year: userDetail.academic_year ?? student.academic_year ?? "",
        grade: userDetail.grade ?? student.grade ?? "",
        branch: userDetail.branch ?? student.branch ?? "",

        // expose these for convenience
        user_programs: programsList,
        current_generation_id: derivedGenerationId,
        current_academic_year_id: derivedAcademicYearId,

        // Address/contact
        address:
          userDetail.address ||
          student.address ||
          userDetail.current_address ||
          student.current_address ||
          "",
        current_address:
          userDetail.current_address ||
          student.current_address ||
          userDetail.address ||
          student.address ||
          "",
        origin: userDetail.origin || student.origin || "",

        // Personal info
        bio: userDetail.bio || student.bio || "",
        guardian: userDetail.guardian || student.guardian || "",
        guardian_name:
          userDetail.guardian_name ?? student.guardian_name ?? null,
        guardian_phone:
          userDetail.guardian_phone ?? student.guardian_phone ?? null,
        father_name: userDetail.father_name || student.father_name || "",
        father_phone: userDetail.father_phone || student.father_phone || "",
        mother_name: userDetail.mother_name || student.mother_name || "",
        mother_phone: userDetail.mother_phone || student.mother_phone || "",
        place_of_birth:
          userDetail.place_of_birth || student.place_of_birth || "",

        // Educational background
        high_school: userDetail.high_school || student.high_school || "",
        mcs_no: userDetail.mcs_no || student.mcs_no || "",
        can_id: userDetail.can_id || student.can_id || "",
        bac_grade: userDetail.bac_grade || student.bac_grade || "",
        bac_from: userDetail.bac_from || student.bac_from || "",
        bac_program: userDetail.bac_program || student.bac_program || "",

        // Additional fields
        option: userDetail.option || student.option || "",
        history: userDetail.history || student.history || "",
        redoubles: userDetail.redoubles || student.redoubles || [],
        scholarships: userDetail.scholarships || student.scholarships || "",
        special: userDetail.special ?? student.special ?? false,
        is_radie: userDetail.is_radie ?? student.is_radie ?? false,
        is_active:
          userDetail.is_active !== undefined
            ? userDetail.is_active
            : student.is_active !== undefined
            ? student.is_active
            : true,

        // Media
        profile_picture:
          userDetail.profile_picture || student.profile_picture || "",
        file: userDetail.file || student.file || "",

        // System fields
        created_at: student.created_at || userDetail.created_at || null,
        updated_at: student.updated_at || userDetail.updated_at || null,

        // Keep nested
        user_detail: userDetail,
      };

      return {
        success: true,
        data: transformedStudent,
        message: "Student fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to fetch student with ID: ${studentId}`,
      };
    }
  },


  /**
   * CREATE NEW STUDENT
   * Creates a new student record
   * @param {Object} studentData - Student data object
   * @returns {Promise<Object>} Created student object
   */
  async createStudent(formModel) {
    try {
      const payload = buildRegisterPayload(formModel);

      // If there's a file, use FormData for multipart upload
      if (payload.file && payload.file instanceof File) {
        const formData = new FormData();

        // Add all fields to FormData (except file which gets special handling)
        Object.keys(payload).forEach((key) => {
          if (key === "file") {
            // Add file as profile_picture (backend expects this field name)
            formData.append("profile_picture", payload.file);
          } else if (
            payload[key] !== null &&
            payload[key] !== undefined &&
            key !== "profile_picture"
          ) {
            // Convert values to strings for FormData, but preserve type info
            const value = payload[key];
            if (typeof value === "boolean") {
              formData.append(key, value ? "1" : "0"); // Convert boolean to 1/0 for FormData
            } else {
              formData.append(key, String(value));
            }
          }
        });

        const response = await api.post(`${AUTH_ENDPOINT}/register`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return {
          success: true,
          data: response.data,
          message: "Student created successfully with photo",
        };
      } else {
        // No file, send JSON (remove file, profile_picture, and omit email if backend generates it)
        const { file, profile_picture, email, ...jsonPayload } = payload;
        if (email) { jsonPayload.email = email; }

        const response = await api.post(
          `${AUTH_ENDPOINT}/register`,
          jsonPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        return {
          success: true,
          data: response.data,
          message: "Student created successfully",
        };
      }
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      let errorMessage = "Failed to create student";
      let errorsOut = [];

      if (data) {
        // Laravel-style validation { errors: { field: ["msg"] } }
        if (data.errors && typeof data.errors === "object") {
          errorsOut = Object.entries(data.errors).map(
            ([field, msgs]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          );
          errorMessage = "Validation failed";
        }

        // Fallback shapes — e.g. { message: "...", error: "The email has already been taken." }
        if (
          !errorsOut.length &&
          typeof data.error === "string" &&
          data.error.trim()
        ) {
          // If error mentions email, tag it to the email field for inline UI
          if (/email/i.test(data.error)) {
            errorsOut.push(`email: ${data.error}`);
          } else {
            errorsOut.push(data.error);
          }
          errorMessage = data.message || errorMessage;
        } else if (!errorsOut.length && typeof data === "string") {
          errorsOut.push(data);
        } else if (data.message && !errorsOut.length) {
          errorMessage = data.message;
        }
      }

      return {
        success: false,
        data: null,
        error: data || error.message,
        message: errorMessage,
        errors: errorsOut, // <<—— IMPORTANT for the UI
        status,
      };
    }
  },

  /**
   * UPDATE STUDENT
   * Updates an existing student record
   * @param {string|Object} studentTarget - The student's user_id, id, or student object
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated student object
   */
  async updateStudent(studentTarget, updateData) {
    let studentId;
    try {
      // Resolve user id
      const base =
        typeof studentTarget === "object" && studentTarget ? studentTarget : {};
      studentId = resolveUserId(studentTarget);
      if (!studentId) {
        return {
          success: false,
          data: null,
          error: "Invalid student identifier",
          message: "Could not resolve user ID",
        };
      }

      // Is there a real File selected?
      // const wantsFile =
      //   updateData?.file instanceof File ||
      //   updateData?.profile_picture instanceof File;

      const isFileLike = (v) =>
        v && typeof v === "object" && (v instanceof File || v instanceof Blob);
      const wantsFile =
        isFileLike(updateData?.file) || isFileLike(updateData?.profile_picture);

      const startYearCandidate =
        toYear(updateData.start_year) ??
        toYear((updateData.academic_year || "").split("-")[0]) ??
        toYear((base?.user_detail?.start_year ?? base?.start_year)) ??
        inferStartYear({ ...base, ...updateData }); // falls back to current year

      // Build JSON payload (NO image fields here)
      const payload = {
        start_year: startYearCandidate,
        role_key: updateData.role_key || "Student",
        id_prefix: updateData.id_prefix || "e",
        name:
          updateData.name ||
          updateData.latin_name ||
          `${updateData.khmer_first_name || ""} ${
            updateData.khmer_last_name || ""
          }`.trim(),
        email: updateData.email || "",
        latin_name: updateData.latin_name || updateData.name || "",
        khmer_name: updateData.khmer_name || "",
        khmer_first_name: updateData.khmer_first_name || "",
        khmer_last_name: updateData.khmer_last_name || "",
        gender: updateData.gender || "",
        date_of_birth: updateData.date_of_birth || "",
        phone_number: updateData.phone_number || updateData.phone || "",
        department_id: updateData.department_id || updateData.department || "",
        sub_department_id:
          updateData.sub_department_id || updateData.section || "",
        program_id: updateData.program_id || "",
        degree: updateData.degree || updateData.program || "",
        academic_year: updateData.academic_year || "",
        address: updateData.address || updateData.current_address || "",
        origin: updateData.origin || "",
        bio: updateData.bio || "",
        guardian: updateData.guardian || "",
        high_school: updateData.high_school || "",
        mcs_no: updateData.mcs_no || "",
        can_id: updateData.can_id || "",
        bac_grade: updateData.bac_grade || "",
        bac_from: updateData.bac_from || "",
        bac_program: updateData.bac_program || "",
        option: updateData.option || "",
        history: updateData.history || "",
        scholarships: updateData.scholarships || "",
        branch: updateData.branch || "",
        grade: updateData.grade || "",
        is_radie: updateData.is_radie || false,
        current_address: updateData.current_address || updateData.address || "",
        father_name: updateData.father_name || "",
        father_phone: updateData.father_phone || "",
        mother_name: updateData.mother_name || "",
        mother_phone: updateData.mother_phone || "",
        guardian_name: updateData.guardian_name || "",
        guardian_phone: updateData.guardian_phone || "",
        place_of_birth: updateData.place_of_birth || "",

        // special: updateData.special || false,
        // is_active: updateData.is_active !== undefined ? updateData.is_active : true,
        // redoubles: Array.isArray(updateData.redoubles) ? updateData.redoubles : []
        special: normBool(updateData.special),
        is_radie: normBool(updateData.is_radie),
        is_active:
          updateData.is_active === undefined
            ? true
            : normBool(updateData.is_active),
      };

      // Only include profile_picture for JSON update when it's NOT a base64 image and we're not uploading a file
      // if (!wantsFile && updateData.profile_picture && !updateData.profile_picture.startsWith('data:')) {
      //   payload.profile_picture = updateData.profile_picture;
      // }

      // Hard guard: never include profile_picture in JSON updates
      if ("profile_picture" in payload) delete payload.profile_picture;

      // Ensure required fields aren’t blank (fallback to base object)
      payload.name =
        (payload.name || "").trim() ||
        base.name ||
        base.latin_name ||
        base.khmer_name ||
        "";
      payload.email = (payload.email || "").trim() || base.email || "";

      // ---- Branch 1: File selected → multipart (POST + _method=PUT) ----
      if (wantsFile) {
        const formData = new FormData();

        // Append scalar fields
        // for (const [k, v] of Object.entries(payload)) {
        //   if (v === undefined || v === null) continue;
        //   formData.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
        //   const val = Array.isArray(v) ? JSON.stringify(v) : (typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
        //   formData.append(k, val);
        // }

        for (const [k, v] of Object.entries(payload)) {
          if (v === undefined || v === null) continue;

          if (typeof v === "boolean") {
            formData.append(k, v ? "1" : "0"); // ← Laravel-friendly
          } else if (Array.isArray(v)) {
            formData.append(k, JSON.stringify(v));
          } else {
            formData.append(k, String(v));
          }
        }

        // Attach the file as `profile_picture`
        // const fileToUpload = updateData.file instanceof File ? updateData.file : updateData.profile_picture;
        let fileToUpload = null;
        if (isFileLike(updateData.file)) {
          fileToUpload = updateData.file;
        } else if (isFileLike(updateData.profile_picture)) {
          fileToUpload = updateData.profile_picture;
        }

        if (fileToUpload) {
          formData.append("profile_picture", fileToUpload);
        }

        // Spoof PUT for Laravel and LET AXIOS SET THE CONTENT-TYPE
        formData.append("_method", "PUT");

        // const response = await api.post(`/auth/update_user/${studentId}`, formData);

        // IMPORTANT: send as multipart (override any default JSON header)
        const response = await api.post(
          `/auth/update_user/${studentId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // Transform the response data to match getStudentById format
        const student = response.data.data || response.data;
        const userDetail = student.user_detail || {};

        const transformedStudent = {
          // Main user fields
          user_id: student.user_id,
          id: student.id,
          name: student.name || userDetail.name,
          email: student.email,

          // Complete user_detail fields (all information like in getStudentById)
          id_card: userDetail.id_card || student.id_card,
          latin_name:
            userDetail.latin_name || student.latin_name || student.name,
          khmer_name:
            userDetail.khmer_name ||
            student.khmer_name ||
            `${userDetail.khmer_first_name || ""} ${
              userDetail.khmer_last_name || ""
            }`.trim(),
          khmer_first_name: userDetail.khmer_first_name,
          khmer_last_name: userDetail.khmer_last_name,
          gender: userDetail.gender || student.gender,
          date_of_birth: userDetail.date_of_birth || student.date_of_birth,
          phone_number: userDetail.phone_number || student.phone_number,

          // Academic information
          department_id: userDetail.department_id || student.department_id,
          sub_department_id:
            userDetail.sub_department_id || student.sub_department_id,
          program_id: userDetail.program_id || student.program_id,
          degree: userDetail.degree || student.degree,
          academic_year: userDetail.academic_year || student.academic_year,
          grade: userDetail.grade || student.grade,
          branch: userDetail.branch || student.branch,

          // Address and contact information
          address: userDetail.address || userDetail.current_address,
          current_address: userDetail.current_address || userDetail.address,
          origin: userDetail.origin,

          // Personal information
          bio: userDetail.bio,
          guardian: userDetail.guardian,
          father_name: userDetail.father_name,
          father_phone: userDetail.father_phone,
          mother_name: userDetail.mother_name,
          mother_phone: userDetail.mother_phone,

          // Educational background
          high_school: userDetail.high_school,
          mcs_no: userDetail.mcs_no,
          can_id: userDetail.can_id,
          bac_grade: userDetail.bac_grade,
          bac_from: userDetail.bac_from,
          bac_program: userDetail.bac_program,

          // Additional fields
          option: userDetail.option,
          history: userDetail.history,
          redoubles: userDetail.redoubles || [],
          scholarships: userDetail.scholarships,
          special: userDetail.special || false,
          is_radie: userDetail.is_radie || false,
          is_active:
            userDetail.is_active !== undefined
              ? userDetail.is_active
              : student.is_active !== undefined
              ? student.is_active
              : true,

          // Groups - include groups data
          groups: student.groups || [],

          // Media
          profile_picture:
            userDetail.profile_picture || student.profile_picture,
          file: userDetail.file,

          // System fields
          created_at: student.created_at || userDetail.created_at,
          updated_at: student.updated_at || userDetail.updated_at,

          // Keep the full nested structure for compatibility
          user_detail: userDetail,
          roles: student.roles || [],
        };

        return {
          success: true,
          data: transformedStudent,
          message: "Student updated successfully with file upload",
        };
      }

      // ---- Branch 2: No file → JSON (do NOT send profile_picture) ----
      const response = await api.put(
        `/auth/update_user/${studentId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Transform the response data to match getStudentById format
      const student = response.data.data || response.data;
      const userDetail = student.user_detail || {};

      const transformedStudent = {
        // Main user fields
        user_id: student.user_id,
        id: student.id,
        name: student.name || userDetail.name,
        email: student.email,

        // Complete user_detail fields (all information like in getStudentById)
        id_card: userDetail.id_card || student.id_card,
        latin_name: userDetail.latin_name || student.latin_name || student.name,
        khmer_name:
          userDetail.khmer_name ||
          student.khmer_name ||
          `${userDetail.khmer_first_name || ""} ${
            userDetail.khmer_last_name || ""
          }`.trim(),
        khmer_first_name: userDetail.khmer_first_name,
        khmer_last_name: userDetail.khmer_last_name,
        gender: userDetail.gender || student.gender,
        date_of_birth: userDetail.date_of_birth || student.date_of_birth,
        phone_number: userDetail.phone_number || student.phone_number,

        // Academic information
        department_id: userDetail.department_id || student.department_id,
        sub_department_id:
          userDetail.sub_department_id || student.sub_department_id,
        program_id: userDetail.program_id || student.program_id,
        degree: userDetail.degree || student.degree,
        academic_year: userDetail.academic_year || student.academic_year,
        grade: userDetail.grade || student.grade,
        branch: userDetail.branch || student.branch,

        // Address and contact information
        address: userDetail.address || userDetail.current_address,
        current_address: userDetail.current_address || userDetail.address,
        origin: userDetail.origin,

        // Personal information
        bio: userDetail.bio,
        guardian: userDetail.guardian,
        father_name: userDetail.father_name,
        father_phone: userDetail.father_phone,
        mother_name: userDetail.mother_name,
        mother_phone: userDetail.mother_phone,

        // Educational background
        high_school: userDetail.high_school,
        mcs_no: userDetail.mcs_no,
        can_id: userDetail.can_id,
        bac_grade: userDetail.bac_grade,
        bac_from: userDetail.bac_from,
        bac_program: userDetail.bac_program,

        // Additional fields
        option: userDetail.option,
        history: userDetail.history,
        redoubles: userDetail.redoubles || [],
        scholarships: userDetail.scholarships,
        special: userDetail.special || false,
        is_radie: userDetail.is_radie || false,
        is_active:
          userDetail.is_active !== undefined
            ? userDetail.is_active
            : student.is_active !== undefined
            ? student.is_active
            : true,

        // Groups - include groups data
        groups: student.groups || [],

        // Media
        profile_picture: userDetail.profile_picture || student.profile_picture,
        file: userDetail.file,

        // System fields
        created_at: student.created_at || userDetail.created_at,
        updated_at: student.updated_at || userDetail.updated_at,

        // Keep the full nested structure for compatibility
        user_detail: userDetail,
        roles: student.roles || [],
      };

      return {
        success: true,
        data: transformedStudent,
        message: "Student updated successfully",
      };
    } catch (error) {
      // Parse error message
      let errorMessage = "Failed to update student";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          errorMessage = `Validation failed: ${validationErrors}`;
        }
      }

      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: errorMessage,
      };
    }
  },

  /**
   * PATCH STUDENT
   * Partially updates a student record
   * @param {string|Object} studentTarget - The student's user_id, id, or student object
   * @param {Object} patchData - Partial data to update
   * @returns {Promise<Object>} Updated student object
   */
  async patchStudent(studentTarget, patchData) {
    try {
      const studentId = resolveUserId(studentTarget);

      if (!studentId) {
        return {
          success: false,
          data: null,
          error: "Invalid student identifier provided",
          message: "Could not resolve user ID from provided student data",
        };
      }

      const response = await api.patch(
        `${AUTH_ENDPOINT}/update_user/${studentId}`,
        patchData
      );
      return {
        success: true,
        data: response.data,
        message: "Student updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to update student`,
      };
    }
  },

  /**
   * DELETE STUDENT
   * Deletes a student record
   * @param {string|Object} studentTarget - The student's user_id, id, or student object
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteStudent(studentTarget) {
    let studentId;
    try {
      studentId = resolveUserId(studentTarget);
      if (!studentId) {
        return {
          success: false,
          data: null,
          error: "Invalid student identifier provided",
          message: "Could not resolve user ID from provided student data",
        };
      }

      await api.delete(`users/remove_user/${studentId}`);
      return {
        success: true,
        data: null,
        message: "Student deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to delete student`,
      };
    }
  },

  /**
   * SEARCH STUDENTS
   * Searches students by various criteria
   * @param {Object} searchCriteria - Search parameters
   * @returns {Promise<Array>} Array of matching students
   */
  async searchStudents(searchCriteria) {
    try {
      const params = {};

      // Build query parameters matching API structure
      if (searchCriteria.q) {
        params.search = searchCriteria.q; // Full-text search
      }
      if (searchCriteria.department_id) {
        params.department_id = searchCriteria.department_id;
      }
      if (searchCriteria.sub_department_id) {
        params.sub_department_id = searchCriteria.sub_department_id;
      }
      if (searchCriteria.gender) {
        params.gender = searchCriteria.gender;
      }
      if (searchCriteria.grade) {
        params.grade = searchCriteria.grade;
      }
      if (searchCriteria.academic_year) {
        params.academic_year = searchCriteria.academic_year;
      }
      if (searchCriteria.is_active !== undefined) {
        params.is_active = searchCriteria.is_active;
      }

      const response = await api.get("/students", { params });
      return {
        success: true,
        data: response.data,
        total: response.data.length,
        message: "Search completed successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: "Search failed",
      };
    }
  },

  /**
   * GET STUDENTS WITH PAGINATION
   * Fetches students with pagination support
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of items per page
   * @param {Object} filters - Additional filters
   * @returns {Promise<Object>} Paginated students data
   */
  async getStudentsPaginated(page = 1, limit = 25, filters = {}) {
    try {
      const params = {
        _page: page,
        _limit: limit,
        ...filters,
      };

      const response = await api.get("/students/paginate", { params });
      const totalCount = parseInt(
        response.headers["x-total-count"] || response.data.length
      );

      return {
        success: true,
        data: response.data,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
        message: "Students fetched successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: null,
        error: error.response?.data || error.message,
        message: "Failed to fetch paginated students",
      };
    }
  },

  /**
   * GET STUDENTS BY DEPARTMENT
   * Fetches students filtered by department
   * @param {string} department - Department name
   * @returns {Promise<Array>} Array of students in the department
   */
  async getStudentsByDepartment(department) {
    try {
      const response = await api.get("/students", {
        params: { department },
      });
      return {
        success: true,
        data: response.data,
        total: response.data.length,
        message: `Students from ${department} department fetched successfully`,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: `Failed to fetch students from ${department} department`,
      };
    }
  },

  /**
   * GET STUDENTS BY SECTION
   * Fetches students filtered by section
   * @param {string} section - Section name
   * @returns {Promise<Array>} Array of students in the section
   */
  async getStudentsBySection(section) {
    try {
      const response = await api.get("/students", {
        params: { section },
      });
      return {
        success: true,
        data: response.data,
        total: response.data.length,
        message: `Students from ${section} section fetched successfully`,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: `Failed to fetch students from ${section} section`,
      };
    }
  },

  /**
   * BULK DELETE STUDENTS
   * Deletes multiple students by their IDs
   * @param {Array<string>} studentIds - Array of student IDs
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkDeleteStudents(studentTargets) {
    try {
      const ids = studentTargets.map((t) => resolveUserId(t)).filter(Boolean); // ✅
      const deletePromises = ids.map((id) =>
        api.delete(`users/remove_user/${id}`)
      );
      await Promise.all(deletePromises);
      return {
        success: true,
        data: null,
        deletedCount: ids.length,
        message: `Successfully deleted ${ids.length} students`,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: "Failed to delete some or all students",
      };
    }
  },

  /**
   * UPDATE STUDENT STATUS
   * Updates student active status
   * @param {string|Object} studentTarget - The student's user_id, id, or student object
   * @param {boolean} active - Active status
   * @returns {Promise<Object>} Updated student object
   */
  async updateStudentStatus(studentTarget, active) {
    try {
      const studentId = resolveUserId(studentTarget);

      if (!studentId) {
        return {
          success: false,
          data: null,
          error: "Invalid student identifier provided",
          message: "Could not resolve user ID from provided student data",
        };
      }

      const response = await api.patch(
        `${AUTH_ENDPOINT}/update_user/${studentId}`,
        { is_active: active }
      );
      return {
        success: true,
        data: response.data,
        message: `Student status updated to ${active ? "active" : "inactive"}`,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: "Failed to update student status",
      };
    }
  },
};

// Export individual functions for convenience
export const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  patchStudent,
  deleteStudent,
  searchStudents,
  getStudentsPaginated,
  getStudentsByDepartment,
  getStudentsBySection,
  bulkDeleteStudents,
  updateStudentStatus,
} = StudentCRUD;

// Export default
export default StudentCRUD;
