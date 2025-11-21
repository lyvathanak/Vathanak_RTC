<template>
  <div class="fixed inset-0 flex items-center justify-center">
    <div
      class="bg-gray-200 p-6 rounded-[10px] shadow-[0px_4px_4px_#00000040] w-[700px] max-h-[100vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Leave Request</h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>
      </div>
      <!-- Form -->
      <form @submit.prevent="submitLeaveRequest" class="space-y-4">
        <!-- ID + Name -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="font-semi-bold">ID<span class="text-red-500">*</span></label>
            <input
              v-model="form.id"
              type="text"
              class="border p-2 rounded-[10px] w-full bg-white cursor-not-allowed"
              disabled
            />
          </div>
          <div>
            <label class="font-semi-bold">Full name<span class="text-red-500">*</span></label>
            <input
              v-model="form.fullName"
              type="text"
              class="border p-2 rounded-[10px] w-full bg-white cursor-not-allowed"
              disabled
            />
          </div>
        </div>
        <!-- Leave Type -->
<div>
  <label class="font-semi-bold">
    Leave Type <span class="text-red-500">*</span>
  </label>
  <div class="grid grid-cols-3 gap-4 mt-2">
    <button
      type="button"
      v-for="type in leaveTypes"
      :key="type"
      @click="selectLeaveType(type)"
      :class="[
        'border p-2 rounded-[10px] text-center transition-colors',
        form.leaveType === type ? 'bg-blue-600 text-white' : 'bg-white',
        isAnnualAndStudent(type) ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'
      ]"
      :disabled="isAnnualAndStudent(type)"
    >
      {{ type }}
    </button>
  </div>
</div>
        <!-- Dates -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="flex font-semi-bold">Start Day<span class="text-red-500">*</span></label>
            <input
              v-model="form.startDate"
              type="date"
              class="border p-2 rounded-[10px] w-full bg-white"
              @change="updateTotalDays"
              required
            />
          </div>
          <div>
            <label class="flex font-semi-bold">End Day<span class="text-red-500">*</span></label>
            <input
              v-model="form.endDate"
              type="date"
              class="border p-2 rounded-[10px] w-full bg-white" 
              @change="updateTotalDays"
              required
            />
          </div>
          <div>
            <label class="flex font-semi-bold">Total Day</label>
            <input
              type="text"
              v-model="form.totalDays"
              class="border p-2 rounded-[10px] w-full bg-white"
              readonly
            />
          </div>
        </div>
        <!-- Reason -->
        <label class="text-semi-bold">
          Reason for Leave <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.reason"
          placeholder="Please provide detail about your leave request ..."
          class="border p-2 rounded-[10px] w-full bg-white resize-none"
          required
        ></textarea>
        <!-- Handover -->
        <label class="text-semi-bold">Handover Details</label>
        <textarea
          v-model="form.handover"
          placeholder="Describe work handover arrangements or coverage plans ..."
          class="border p-2 rounded-[10px] w-full bg-white resize-none"
        ></textarea>
        <!-- Emergency -->
        <div>
          <label class="text-semi-bold">
            Emergency Contact <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.emergencyContact"
            type="text"
            placeholder="Phone number of alternative contact"
            class="border p-2 rounded-[10px] w-full bg-white"
            required
            @input="allowOnlyDigits"
          />
          <small v-if="errorEmergency" class="text-red-500">{{ errorEmergency }}</small>
        </div>
        <!-- File Upload -->
        <div>
          <label class="font-semi-bold">Supporting Documents</label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-[10px] p-3 text-center cursor-pointer hover:border-blue-500 transition bg-white"
            @click="$refs.fileInput.click()"
          >
            <p class="text-gray-500">Drag & Drop your file here</p>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              @change="handleFileUpload"
            />
          </div>
          <div v-if="form.fileName" class="mt-2 text-sm text-gray-700">
            Selected: {{ form.fileName }}
          </div>
        </div>
        <!-- Submit -->
        <div class="flex justify-center mt-6">
          <button
            type="submit"
            class="bg-blue-500 text-white px-6 py-2 rounded-[10px] w-[250px] hover:bg-blue-600 transition"
          >
            Submit Leave Request
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/Authentication/authStore";
import { submitLeaveRequestService } from "@/stores/Student/LeaveRequestFrom";
import { getStudentProfile } from "@/stores/Student/StudentProfile";
import { showNotification } from "@/lib/notifications";

const emit = defineEmits(["close", "submit"]);
const authStore = useAuthStore();
const leaveTypes = [
  "Annual",
  "Sick Leave",
  "Personal Leave",
  "Emergency",
  "Maternity",
  "Other",
];
const today = computed(() => new Date().toISOString().split("T")[0]);
const form = reactive({
  id: "",
  fullName: "",
  leaveType: "",
  startDate: "",
  endDate: "",
  totalDays: "",
  reason: "",
  handover: "",
  emergencyContact: "",
  file: null,
  fileName: "",
});
const errorEmergency = ref("");

onMounted(async () => {
  try {
    const data = await getStudentProfile();
    form.id = data.user.user_detail?.id_card || "";
    form.fullName = data.user?.name || "";
    // Ensure authStore.userRole is set; fallback to 'unknown' if undefined
    if (!authStore.userRole) {
      console.warn("userRole is undefined, fetching from profile");
      authStore.userRole = data.user?.role || "unknown";
    }
  } catch (error) {
    console.error("Failed to load profile:", error);
  }
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.file = file;
    form.fileName = file.name;
  }
};

const isAnnualAndStudent = (type) => {
  return type === 'Annual' && authStore.userRole?.toLowerCase() === 'student';
};

const selectLeaveType = (type) => {
  if (isAnnualAndStudent(type)) {
    return; // Prevent selection for student + annual combination
  }
  form.leaveType = type;
};

const updateTotalDays = () => {
  if (!form.startDate || !form.endDate) return;
  if (form.endDate < form.startDate) {
    showNotification("End date cannot be before start date.");
    form.endDate = "";
  } else {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    form.totalDays = ((end - start) / (1000 * 60 * 60 * 24) + 1).toFixed(0);
  }
};

const allowOnlyDigits = () => {
  form.emergencyContact = form.emergencyContact.replace(/\D/g, "");
};

const validateEmergencyContact = () => {
  const regex = /^0\d{8,}$/;
  if (!regex.test(form.emergencyContact)) {
    errorEmergency.value = "Emergency contact must start with 0 and be at least 9 digits.";
    return false;
  }
  errorEmergency.value = "";
  return true;
};

const submitLeaveRequest = async () => {
  try {
    if (!validateEmergencyContact()) {
      return;
    }
    if (form.startDate < today.value) {
      showNotification("Start date must be today or later.");
      return;
    }
    if (form.endDate < form.startDate) {
      showNotification("End date cannot be before start date.");
      return;
    }
    if (form.leaveType === "Annual" && authStore.userRole === "student") {
      showNotification("Annual is not available for students.");
      return;
    }

    const formData = new FormData();
    formData.append("student_id", form.id);
    formData.append("full_name", form.fullName);
    formData.append("type", form.leaveType);
    formData.append("start_date", form.startDate);
    formData.append("end_date", form.endDate);
    formData.append("reason", form.reason);
    formData.append("handover_detail", form.handover);
    formData.append("emergency_contact", form.emergencyContact);
    
    if (form.file) {
      formData.append("document", form.file);
      // ✅ Debug logs for file
      console.log("📂 File ready for upload:");
      console.log("Name:", form.file.name);
      console.log("Type:", form.file.type);
      console.log("Size:", form.file.size, "bytes");
    } else {
      console.log("⚠️ No file selected");
    }
    const data = await submitLeaveRequestService(formData);

    const formattedData = {
      id: data.id,
      type: data.type || form.leaveType,
      start: data.start_date || form.startDate,
      end: data.end_date || form.endDate,
      totalDays: data.total_days || form.totalDays,
      submit: data.requested_at_formatted || new Date().toLocaleString(),
      status: data.status || "Pending",
      reason: data.reason,
      handover_detail: data.handover_detail,
      emergency_contact: data.emergency_contact,
      document: data.document,
    };

    emit("submit", formattedData);
    emit("close");

    // Reset form
    form.leaveType = "";
    form.startDate = "";
    form.endDate = "";
    form.totalDays = "";
    form.reason = "";
    form.handover = "";
    form.emergencyContact = "";
    form.file = null;
    form.fileName = "";
    errorEmergency.value = "";

    showNotification("Leave request submitted successfully!");
  } catch (error) {
    console.error("API error:", error.response?.status, error.response?.data);
    showNotification(error.response?.data?.message || "Failed to submit leave request.");
  }
};

</script>

<style scoped>
button:disabled {
  background-color: #f3f4f6 !important; /* matches input bg-gray-100 */
  border-color: #e5e7eb !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
}
</style>