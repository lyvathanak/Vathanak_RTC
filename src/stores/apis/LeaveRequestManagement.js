import api from './axios.js';

/**
 * Leave Request Management API
 * Handles all leave request related operations
 */

// Get all leave requests with optional filtering
// LeaveRequestManagement.js  (fix getAllLeaveRequests)
export const getAllLeaveRequests = async (params = {}) => {
  try {
    const { page = 1, limit, ...otherParams } = params;
    
    // Build query parameters for backend pagination
    const queryParams = {
      ...otherParams,
      page: page,
    };
    
    // Add limit/per_page if provided
    if (limit) {
      queryParams.per_page = limit;
      queryParams.limit = limit;
    }
    
    console.log('📤 Sending pagination params:', queryParams);
    
    const response = await api.get('/request/get_all_leave_request', { params: queryParams });

    // ✅ Correct path per your Postman screenshot
    const list = response.data?.requests?.data ?? [];

    // Optional: return pagination if you need it in the UI
    const pg = response.data?.requests || {};
    const pagination = {
      current_page: pg.current_page ?? 1,
      per_page: pg.per_page ?? list.length,
      total: pg.total ?? list.length,
      last_page: pg.last_page ?? 1,
      next_page_url: pg.next_page_url ?? null,
      prev_page_url: pg.prev_page_url ?? null,
    };

    console.log('📥 Received pagination:', pagination);
    console.log('📥 Leave requests fetched:', list.length);

    return {
      success: true,
      data: response.data,
      requests: list,
      total_count: pagination.total,
      pagination,
    };
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch leave requests',
      requests: [],
    };
  }
};


// Get leave request by ID
export const getLeaveRequestById = async (id) => {
  try {
    const response = await api.get(`/request/get_leave_request/${id}`);
    return {
      success: true,
      data: response.data,
      request: response.data?.data || null
    };
  } catch (error) {
    console.error('Error fetching leave request:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch leave request',
      request: null
    };
  }
};

// Create a new leave request
export const createLeaveRequest = async (leaveRequestData) => {
  try {
    // Prepare form data for file upload if document is included
    const formData = new FormData();
    
    // Add all leave request fields
    Object.keys(leaveRequestData).forEach(key => {
      if (leaveRequestData[key] !== null && leaveRequestData[key] !== undefined) {
        if (key === 'document' && leaveRequestData[key] instanceof File) {
          formData.append('document', leaveRequestData[key]);
        } else {
          formData.append(key, leaveRequestData[key]);
        }
      }
    });

    const response = await api.post('/request/create_leave_request', formData);
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Leave request created successfully'
    };
  } catch (error) {
    console.error('Error creating leave request:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create leave request',
      errors: error.response?.data?.errors || {}
    };
  }
};

// Update leave request
export const updateLeaveRequest = async (id, updateData) => {
  try {
    // Prepare form data for file upload if document is included
    const formData = new FormData();
    
    // Add all update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== null && updateData[key] !== undefined) {
        if (key === 'document' && updateData[key] instanceof File) {
          formData.append('document', updateData[key]);
        } else {
          formData.append(key, updateData[key]);
        }
      }
    });

    const response = await api.put(`/request/update_leave_request/${id}`, formData);
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Leave request updated successfully'
    };
  } catch (error) {
    console.error('Error updating leave request:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update leave request',
      errors: error.response?.data?.errors || {}
    };
  }
};

// Delete leave request
export const deleteLeaveRequest = async (id) => {
  try {
    const response = await api.delete(`/request/delete_leave_request/${id}`);
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Leave request deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete leave request'
    };
  }
};

// Approve leave request
// LeaveRequestManagement.js
export const approveLeaveRequest = async (id, approvalData = {}) => {
  try {
    const res = await api.put('/request/approve_leave_request', {
      request_id: id,
      status: 'approved',
      approved_at: new Date().toISOString(),
      ...approvalData
    });
    return { success: true, data: res.data, message: res.data?.message || 'Leave request approved successfully' };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Failed to approve leave request' };
  }
};

// Reject leave request
export const rejectLeaveRequest = async (id, { remark, ...rest } = {}) => {
  try {
    const response = await api.put('/request/reject_leave_request', {
      request_id: id,
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      remark,
      ...rest,
    });

    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Leave request rejected successfully',
    };
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to reject leave request',
    };
  }
};


// Get leave requests by user
export const getLeaveRequestsByUser = async (userId, params = {}) => {
  try {
    const response = await api.get(`/request/get_user_leave_requests/${userId}`, { params });
    return {
      success: true,
      data: response.data,
      requests: response.data?.data || []
    };
  } catch (error) {
    console.error('Error fetching user leave requests:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user leave requests',
      requests: []
    };
  }
};

// Get leave requests by status
export const getLeaveRequestsByStatus = async (status, params = {}) => {
  try {
    const response = await api.get('/request/get_all_leave_request', { 
      params: { status, ...params } 
    });
    return {
      success: true,
      data: response.data,
      requests: response.data?.data || [],
      pagination: {
        current_page: response.data?.current_page || 1,
        total_pages: response.data?.total_pages || 1,
        total_count: response.data?.total_count || 0
      }
    };
  } catch (error) {
    console.error('Error fetching leave requests by status:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch leave requests',
      requests: []
    };
  }
};

// Get leave request statistics
export const getLeaveRequestStats = async (params = {}) => {
  try {
    const response = await api.get('/request/leave_request_stats', { params });
    return {
      success: true,
      data: response.data,
      stats: response.data?.stats || {}
    };
  } catch (error) {
    console.error('Error fetching leave request stats:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch leave request statistics',
      stats: {}
    };
  }
};

// Download leave request document
export const downloadLeaveRequestDocument = async (id) => {
  try {
    const response = await api.get(`/request/download_document/${id}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leave_request_${id}_document`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'Document downloaded successfully'
    };
  } catch (error) {
    console.error('Error downloading document:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to download document'
    };
  }
};

// Bulk approve/reject leave requests
export const bulkUpdateLeaveRequests = async (requestIds, action, updateData = {}) => {
  try {
    const response = await api.put('/request/bulk_update_leave_requests', {
      request_ids: requestIds,
      action,
      ...updateData
    });
    return {
      success: true,
      data: response.data,
      message: response.data?.message || `Leave requests ${action} successfully`
    };
  } catch (error) {
    console.error('Error bulk updating leave requests:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update leave requests',
      errors: error.response?.data?.errors || {}
    };
  }
};

// Helper function to build leave request payload
export const buildLeaveRequestPayload = (formData) => {
  return {
    user_id: formData.user_id,
    start_date: formData.start_date,
    end_date: formData.end_date,
    reason: formData.reason,
    type: formData.type || 'Mission',
    handover_detail: formData.handover_detail || '',
    emergency_contact: formData.emergency_contact || '',
    document: formData.document || null,
    total_days: formData.total_days || calculateLeaveDays(formData.start_date, formData.end_date)
  };
};

// Helper function to calculate leave days
export const calculateLeaveDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDifference = end.getTime() - start.getTime();
  const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  
  return dayDifference + 1; // Include both start and end dates
};

// Helper function to format leave request for display
export const formatLeaveRequestForDisplay = (request) => {
  return {
    ...request,
    start_date_formatted: new Date(request.start_date).toLocaleDateString(),
    end_date_formatted: new Date(request.end_date).toLocaleDateString(),
    requested_at_formatted: new Date(request.requested_at).toLocaleDateString(),
    status_badge_class: getStatusBadgeClass(request.status),
    total_days_display: `${request.total_days} day${request.total_days > 1 ? 's' : ''}`
  };
};

// Helper function to get status badge class
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Export all functions as default object for easy importing
export default {
  getAllLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveRequestsByUser,
  getLeaveRequestsByStatus,
  getLeaveRequestStats,
  downloadLeaveRequestDocument,
  bulkUpdateLeaveRequests,
  buildLeaveRequestPayload,
  calculateLeaveDays,
  formatLeaveRequestForDisplay,
  getStatusBadgeClass
};