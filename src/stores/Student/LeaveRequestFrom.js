import api from "@/stores/apis/axios";

// Service to submit a leave request
export async function submitLeaveRequestService(payload) {
  try {
    const response = await api.post("/request/create_leave_request", payload, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    console.error("❌ API error submitting leave request:", error);
    throw error;
  }
}

// Service to fetch leave requests
export async function getLeaveRequestsService() {
  try {
    const response = await api.get("/request/get_leave_request");
    return response.data.requests; // Return the 'requests' array
  } catch (error) {
    console.error("❌ API error fetching leave requests:", error);
    throw error;
  }
}