import api from "@/stores/apis/axios";

// ✅ Fetch academic info (groups, program duration, etc.)
export async function getAcademicInfo() {
  try {
    const response = await api.get("/users/get_academic_information");
    return response.data;
  } catch (error) {
    console.error("Error fetching academic info:", error);
    throw error;
  }
} 
 