<template>
  <div class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-[#E3E3E3] rounded-2xl shadow-xl w-3xl max-h-[90vh] flex flex-col">
      
      <!-- Header - Fixed -->
      <div class="flex justify-between items-center p-6 flex-shrink-0">
        <div class="text-center flex-1">
          <h2 class="text-xl font-bold text-center flex-1">Leave Request</h2>
          <p class="text-center text-gray-600">Submit your leave application for approval !</p>
        </div>
    
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-black text-xl font-bold"
        >
          ✕
        </button>
      </div>

      <!-- Body - Scrollable -->
      <div class="flex-1 overflow-y-auto px-12 py-4">
        <div class="space-y-4">
          
          <!-- ID and Full Name -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">
                ID <span class="text-red-500">*</span>
              </label>
              <input
                :value="leaveRequest.id_card"
                type="text"
                class="w-full p-2 border border-gray-400 rounded-lg bg-white"
                readonly
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">
                Full name <span class="text-red-500">*</span>
              </label>
              <input
                :value="leaveRequest.latin_name"
                type="text"
                class="w-full p-2 border border-gray-400 rounded-lg bg-white"
                readonly
              />
            </div>
          </div>

          <!-- Leave Type -->
          <div>
            <label class="block text-sm font-semibold mb-2">
              Leave Type <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="type in leaveTypes"
                :key="type"
                :class="[
                  'p-2 text-center rounded-lg border text-sm',
                  leaveRequest.originalData?.type === type
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 text-gray-500 border-gray-300'
                ]"
              >
                {{ type }}
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold mb-1">
                Start Date <span class="text-red-500">*</span>
              </label>
              <input
                :value="leaveRequest.originalData?.start_date"
                type="text"
                class="w-full p-2 border border-gray-400 rounded-lg bg-white"
                readonly
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">
                End Date <span class="text-red-500">*</span>
              </label>
              <input
                :value="leaveRequest.originalData?.end_date"
                type="text"
                class="w-full p-2 border border-gray-400 rounded-lg bg-white"
                readonly
              />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-1">Total Days</label>
              <input
                :value="leaveRequest.originalData?.total_days + ' days'"
                type="text"
                class="w-full p-2 border border-gray-400 rounded-lg bg-white"
                readonly
              />
            </div>
          </div>

          <!-- Reason for Leave -->
          <div>
            <label class="block text-sm font-semibold mb-1">
              Reason for Leave <span class="text-red-500">*</span>
            </label>
            <textarea
              :value="leaveRequest.originalData?.reason"
              class="w-full p-2 border border-gray-400 rounded-lg bg-white h-20 resize-none"
              readonly
            ></textarea>
          </div>

          <!-- Handover Details -->
          <div>
            <label class="block text-sm font-semibold mb-1">Handover Details</label>
            <textarea
              :value="leaveRequest.originalData?.handover_detail || 'No handover details provided'"
              class="w-full p-2 border border-gray-400 rounded-lg bg-white h-20 resize-none"
              readonly
            ></textarea>
          </div>

          <!-- Emergency Contact -->
          <div>
            <label class="block text-sm font-semibold mb-1">
              Emergency Contact Information <span class="text-red-500">*</span>
            </label>
            <input
              :value="leaveRequest.originalData?.emergency_contact"
              type="text"
              class="w-full p-2 border border-gray-400 rounded-lg bg-white"
              readonly
            />
          </div>

          <!-- Supporting Documents -->
          <div>
            <label class="block text-sm font-semibold mb-2">Supporting Documents</label>

            <div v-if="docPath" class="border border-gray-400 rounded-lg p-4 bg-white">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-sm">{{ fileName }}</span>
                </div>

                <button
                  class="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                  @click="previewDocument"
                  :disabled="previewLoading"
                >
                  {{ previewLoading ? 'Loading…' : 'Preview' }}
                </button>
              </div>

              <!-- Preview area -->
              <div v-if="showPreview" class="mt-4">
                <UniversalFilePreview
                  v-if="publicDocUrl"
                  :src="publicDocUrl"
                  :filename="fileDisplayName"
                  :mime="''"
                  officeViewer="google"
                  height="70vh"
                />

                <div v-else class="text-sm text-gray-600">
                  No inline preview available for {{ fileName }}.
                </div>

                <div class="mt-3 text-right">
                  <button class="px-3 py-1.5 text-sm rounded border hover:bg-gray-50" @click="closePreview">
                    Close preview
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="border border-gray-400 rounded-lg p-4 bg-white text-center text-gray-500">
              No supporting documents provided
            </div>
          </div>

          <!-- Remark -->
          <div v-if="isPending">
            <label class="block text-sm font-semibold mb-1">Remark</label>
            <textarea
              v-model="remark"
              placeholder="Reason for Reject..."
              class="w-full p-2 border border-gray-400 rounded-lg bg-white h-16 resize-none"
            ></textarea>
          </div>

          <!-- Show existing remark for processed requests -->
          <div v-else-if="existingRemark">
            <label class="block text-sm font-semibold mb-1">Admin Remark</label>
            <textarea
              :value="existingRemark"
              class="w-full p-2 border border-gray-400 rounded-lg bg-gray-50 h-16 resize-none"
              readonly
            ></textarea>
          </div>

        </div>
      </div>

      <!-- Footer - Fixed -->
      <div v-if="isPending" class="flex justify-center space-x-4 p-6 border-t flex-shrink-0">
        <button
          @click="handleReject"
          :disabled="loading || !remark || !remark.trim()"
          class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading && actionType === 'reject' ? 'Rejecting...' : 'Reject' }}
        </button>
        <button
          @click="handleApprove"
          :disabled="loading"
          class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading && actionType === 'approve' ? 'Approving...' : 'Approve' }}
        </button>
      </div>

      <!-- Status Display for Non-Pending Requests -->
      <div v-else class="flex justify-center p-6 border-t flex-shrink-0">
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-2">This request has been processed</p>
          <span 
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium',
              currentStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]"
          >
            {{ currentStatus === 'approved' ? 'Approved' : 'Rejected' }}
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { approveLeaveRequest, rejectLeaveRequest } from '@/stores/apis/LeaveRequestManagement.js'
import { showNotification } from '@/lib/notifications.js'
import UniversalFilePreview from '@/components/features/UniversalFilePreview.vue'

// ---------- PUBLIC FILE URL BUILDER ----------
const toPublicUrl = (docPath) => {
  if (!docPath) return null
  if (/^https?:\/\//i.test(docPath)) return docPath // already absolute
  // -> https://api.rtc-bb.camai.kh/storage/<docPath>
  const cleanPath = docPath.startsWith('/') ? docPath.substring(1) : docPath
  return `https://api.rtc-bb.camai.kh/storage/${cleanPath}`
}

// ---------- PROPS / EMITS ----------
const props = defineProps({
  leaveRequest: { type: Object, required: true }
})
const emit = defineEmits(['close', 'updated'])

// ---------- UI DATA ----------
const leaveTypes = ['Annual Leave','Sick Leave','Personal Leave','Emergency','Maternity','Other']
const remark = ref('')
const loading = ref(false)
const actionType = ref('')

// ---------- APPROVE ----------
const handleApprove = async () => {
  loading.value = true
  actionType.value = 'approve'
  try {
    const requestId = props.leaveRequest.originalData?.id || props.leaveRequest.id
    const result = await approveLeaveRequest(requestId, {
      approved_by_name: 'Admin',
      approval_notes: remark.value || 'Approved by admin'
    })
    if (result.success) {
      showNotification('Leave request approved successfully!', 'success')
      emit('updated'); emit('close')
    } else {
      showNotification(result.error || 'Failed to approve leave request', 'error')
    }
  } catch (error) {
    console.error('Error approving leave request:', error)
    showNotification('Failed to approve leave request: ' + (error?.message || 'Unknown error'), 'error')
  } finally {
    loading.value = false
    actionType.value = ''
  }
}

// ---------- REJECT ----------
const handleReject = async () => {
  if (!remark.value.trim()) {
    showNotification('Please provide a reason for rejection', 'error')
    return
  }
  loading.value = true
  actionType.value = 'reject'
  try {
    const requestId = props.leaveRequest.originalData?.id || props.leaveRequest.id
    const result = await rejectLeaveRequest(requestId, {
      rejected_by_name: 'Admin',
      remark: remark.value
    })
    if (result.success) {
      showNotification('Leave request rejected successfully!', 'success')
      emit('updated'); emit('close')
    } else {
      showNotification(result.error || 'Failed to reject leave request', 'error')
    }
  } catch (error) {
    console.error('Error rejecting leave request:', error)
    showNotification('Failed to reject leave request: ' + (error?.message || 'Unknown error'), 'error')
  } finally {
    loading.value = false
    actionType.value = ''
  }
}

// ---------- FILE / PREVIEW ----------
const currentReq = computed(() => props.leaveRequest?.originalData || props.leaveRequest)
const docPath = computed(() => currentReq.value?.document || null)
const publicDocUrl = computed(() => (docPath.value ? toPublicUrl(docPath.value) : null))
// console.log('📄 Document path:', publicDocUrl.value)
const fileDisplayName = computed(() =>
  docPath.value ? docPath.value.split('/').pop() : 'Document'
)

const fileName = computed(() => fileDisplayName.value)

// ---------- STATUS CHECK ----------
const currentStatus = computed(() => {
  const status = currentReq.value?.status || props.leaveRequest?.status || 'pending'
  return status.toLowerCase()
})

const isPending = computed(() => currentStatus.value === 'pending')

const existingRemark = computed(() => {
  return currentReq.value?.remark || 
         currentReq.value?.approval_notes || 
         currentReq.value?.admin_remark || 
         null
})

const showPreview = ref(false)
const previewLoading = ref(false)

const previewDocument = () => {
  if (!docPath.value) {
    showNotification('This request has no uploaded document.', 'error')
    return
  }
  // We’re not fetching; UniversalFilePreview will render the public URL (Google viewer for Office/PDF)
  previewLoading.value = true
  showPreview.value = true
  previewLoading.value = false
}

const closePreview = () => {
  showPreview.value = false
}
</script>
