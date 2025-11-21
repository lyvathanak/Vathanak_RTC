import api from './axios.js'

const GROUPS_ENDPOINT = '/groups';

/* ----------------------------- helpers ----------------------------- */

// remove undefined/null (keep empty strings if explicitly set)
function clean(obj, { dropEmptyString = false } = {}) {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (dropEmptyString && v === '') return;
    out[k] = v;
  });
  return out;
}

// unify to user_id
function resolveUserId(target) {
  if (typeof target === 'string' || typeof target === 'number') return target;
  if (target && typeof target === 'object') return target.user_id ?? target.id ?? null;
  return null;
}

/* --------------------------- Group CRUD API --------------------------- */

export const GroupCRUD = {
  /* GET ALL */
  async getAllGroups(params = {}) {
    try {
      const { data } = await api.get(`${GROUPS_ENDPOINT}/get_all_groups`, { params });
      return {
        success: true,
        data: data.groups?.data ?? [],
        total: data.groups?.total ?? 0,
        message: 'Groups fetched successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: 'Failed to fetch groups',
      };
    }
  },

  /* GET BY ID (with students) */
  async getGroupById(groupId) {
    try {
      // FIX: add leading slash & use GROUPS_ENDPOINT
      const { data } = await api.get(`${GROUPS_ENDPOINT}/get_group_by_id/${groupId}`);

      const groupData = data.group || data || {};
      // Normalize student_ids (user_id preferred)
      if (Array.isArray(groupData.students)) {
        groupData.student_ids = groupData.students
          .map(s => s?.user_id ?? s?.id)
          .filter(Boolean);
      }

      return {
        success: true,
        data: groupData,
        message: 'Group fetched successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to fetch group with ID: ${groupId}`,
      };
    }
  },

  /* GET GROUP STUDENTS */
  async getGroupStudents(groupId) {
    try {
      const { data } = await api.get(`${GROUPS_ENDPOINT}/get_group_by_id/${groupId}`);
      const groupData = data.group || data || {};
      const students = Array.isArray(groupData.students) ? groupData.students : [];
      return {
        success: true,
        data: students,
        total: students.length,
        message: 'Group students fetched successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: `Failed to fetch students for group ID: ${groupId}`,
      };
    }
  },

  /* CREATE (IDs only; no duplicate name/label fields) */
  async createGroup(groupData) {
    try {
      // Match the Postman payload structure exactly
      const payload = clean({
        name: groupData.name,
        semester_id: Number(groupData.semester_id),
        program_id: Number(groupData.program_id),
        department_id: Number(groupData.department_id),
        sub_department_id: Number(groupData.section_id ?? groupData.sub_department_id),
        description: groupData.description ?? '',
      });

      console.log('📦 POST /groups/create_new_group payload:', payload);
      const { data } = await api.post(`${GROUPS_ENDPOINT}/create_new_group`, payload);
      return { success: true, data, message: 'Group created successfully' };
    } catch (error) {
      console.error('❌ Create group error:', error.response?.status, error.response?.data);
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: 'Failed to create group',
      };
    }
  },

  /* CREATE with students */
  async createGroupWithStudents(groupData) {
    let requestData = null;
    try {
      const user_ids = (groupData.students || [])
        .map(resolveUserId)
        .filter(id => id !== null);

      const payload = clean({
        group_name: groupData.name,
        description: groupData.description ?? '',
        program_id: groupData.program_id,
        department_id: groupData.department_id,
        sub_department_id: groupData.section_id ?? groupData.sub_department_id,
        semester_id: groupData.semester_id,
        academic_year:
          groupData.academic_year ||
          `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        user_ids: user_ids.map(Number),
      });

      if (!payload.group_name) {
        return { success: false, data: null, error: 'Group name is required', message: 'Group name is required' };
      }
      if (!payload.semester_id) {
        return { success: false, data: null, error: 'Semester is required', message: 'Semester is required' };
      }

      requestData = payload;
      const { data } = await api.post(
        `${GROUPS_ENDPOINT}/create_new_group_add_student`,
        payload
      );

      return {
        success: true,
        data,
        message: user_ids.length
          ? `Group created successfully with ${user_ids.length} students`
          : 'Group created successfully',
      };
    } catch (error) {
      console.error('Failed to create group with students. Sent payload:', requestData);
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: 'Failed to create group with students',
      };
    }
  },

  /* UPDATE (IDs only) */
  async updateGroup(groupId, updateData) {
    try {
      const payload = clean({
        // ✅ send both; some validators require `name`, others `group_name`
        name:       updateData.name ?? updateData.group_name,
        group_name: updateData.group_name ?? updateData.name,

        description: updateData.description ?? '',
        program_id: Number(updateData.program_id),
        department_id: Number(updateData.department_id),
        sub_department_id: Number(updateData.sub_department_id ?? updateData.section_id),
        semester_id: Number(updateData.semester_id),
      });

      console.log('📦 PUT', `${GROUPS_ENDPOINT}/update_group/${groupId}`, payload);
      const { data } = await api.put(`${GROUPS_ENDPOINT}/update_group/${groupId}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return { success: true, data, message: 'Group updated successfully' };
    } catch (error) {
      console.error('❌ Update error:', error.response?.status, error.response?.data);
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to update group with ID: ${groupId}`,
      };
    }
  },


  /* ASSIGN multiple users */
  async assignMultipleUsers(groupId, students) {
    try {
      const user_ids = (students || []).map(resolveUserId).filter(id => id !== null);
      if (!user_ids.length) {
        return {
          success: false,
          data: null,
          error: 'No valid user IDs found in provided student data',
          message: 'Could not resolve user IDs from provided student data',
        };
      }
      const { data } = await api.post(`${GROUPS_ENDPOINT}/assign_multiple_users`, {
        group_id: groupId,
        user_ids,
      });
      return {
        success: true,
        data,
        message: `Successfully assigned ${user_ids.length} students to group`,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to assign students to group: ${groupId}`,
      };
    }
  },

  /* ADD students (alias) */
  async addStudentsToGroup(groupId, students) {
    try {
      return await this.assignMultipleUsers(groupId, students);
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to add students to group: ${groupId}`,
      };
    }
  },

  /* REMOVE students (backend expects individual deletes) */
  async removeStudentsFromGroup(groupId, students) {
    try {
      const user_ids = (students || []).map(resolveUserId).filter(id => id !== null);
      if (!user_ids.length) {
        return {
          success: false,
          data: null,
          error: 'No valid user IDs found in provided student data',
          message: 'Could not resolve user IDs from provided student data',
        };
      }

      await Promise.all(
        user_ids.map(user_id =>
          api.delete(`${GROUPS_ENDPOINT}/remove_student_from_group`, {
            data: { user_id, group_id: groupId },
          })
        )
      );

      return {
        success: true,
        data: null,
        message: `Successfully removed ${user_ids.length} student(s) from group`,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to remove students from group: ${groupId}`,
      };
    }
  },

  /* DELETE */
  async deleteGroup(groupId) {
    try {
      await api.delete(`${GROUPS_ENDPOINT}/delete_group/${groupId}`);
      return { success: true, data: null, message: 'Group deleted successfully' };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response?.data || error.message,
        message: `Failed to delete group with ID: ${groupId}`,
      };
    }
  },

  /* SEARCH */
  async searchGroups(searchCriteria) {
    try {
      const { data } = await api.get(`${GROUPS_ENDPOINT}/search_groups`, { params: searchCriteria });
      return {
        success: true,
        data: data.groups?.data ?? [],
        total: data.groups?.total ?? 0,
        message: 'Search completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: 'Search failed',
      };
    }
  },

  /* FILTER by department (API looks like it expects a name; keep signature) */
  async getGroupsByDepartment(department) {
    try {
      const { data } = await api.get(`${GROUPS_ENDPOINT}/filter_group_by_department`, {
        params: { department },
      });
      const groups = data.groups ?? [];
      return {
        success: true,
        data: groups,
        total: groups.length,
        message: `Groups from ${department} department fetched successfully`,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.response?.data || error.message,
        message: `Failed to fetch groups from ${department} department`,
      };
    }
  },
};

/* Named exports */
export const {
  getAllGroups,
  getGroupById,
  getGroupStudents,
  createGroup,
  createGroupWithStudents,
  updateGroup,
  assignMultipleUsers,
  addStudentsToGroup,
  removeStudentsFromGroup,
  deleteGroup,
  searchGroups,
  getGroupsByDepartment,
} = GroupCRUD;

export default GroupCRUD;
