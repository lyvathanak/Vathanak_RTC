<!-- src/views/OtpVerify.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="flex flex-col items-center justify-center bg-[#E3E3E3] rounded-lg shadow-lg gap-5 p-13 w-full max-w-fit">
      <!-- Header with Logo -->
      <div class="flex flex-col items-center gap-5">
        <img
          src="/logo.png"
          alt="Logo"
          width="120"
          height="120"
          class="mx-auto rounded-full mb-4"
        />
        <div class="flex flex-col items-center text-center">
          <h1 class="text-sm font-medium text-[#235AA6] khmer-text-light">
            សាលាមធ្យមសិក្សា​សុខាភិបាល​ភូមិភាគបាត់ដំបង
          </h1>
          <h1 class="text-xs text-[#235AA6] font-medium tracking-wide uppercase">
            BATTAMBANG REGIONAL TRAINING CENTER FOR HEALTH
          </h1>
        </div>
      </div>

      <!-- Back -->
      <div class="flex items-center gap-2 self-start w-full max-w-md">
        <button
          type="button"
          class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          @click="goBack"
        >
          <ArrowLeft class="w-4 h-4" />
          <span :class="[locale === 'kh' ? 'khmer-text' : '']">{{ t('back_to_login') || 'Back' }}</span>
        </button>
      </div>

      <!-- Title -->
      <h3 :class="['text-2xl font-bold text-[#235AA6]', locale === 'kh' ? 'khmer-text' : '']">
        {{ t('enter_otp') || 'Enter OTP' }}
      </h3>

      <!-- OTP inputs -->
      <form @submit.prevent="onSubmit" class="flex flex-col items-center gap-4 w-full max-w-md">
        <div class="flex items-center gap-2">
          <input
            v-for="(d, i) in digits"
            :key="i"
            ref="otpRefs"
            maxlength="1"
            inputmode="numeric"
            pattern="[0-9]*"
            class="w-10 h-10 text-center rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            :value="digits[i]"
            @input="onInput($event, i)"
            @keydown.backspace.prevent="onBackspace(i)"
            @paste.prevent="onPaste($event)"
            :disabled="isSubmitting"
          />
        </div>

        <!-- Resend -->
        <div class="text-xs text-gray-500 mt-1">
          <button
            type="button"
            class="underline disabled:no-underline disabled:text-gray-400"
            :disabled="countdown > 0 || isSubmitting"
            @click="resend"
          >
            {{ t('send_otp') || 'Send OTP' }}
            <span v-if="countdown > 0"> ({{ countdown }}s)</span>
          </button>
        </div>

        <!-- Language -->
        <div class="flex items-center justify-center w-full">
          <ChangeLanguage />
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="!isComplete || isSubmitting"
          class="w-full bg-[#235AA6] text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting">{{ t('submitting') || 'Submitting…' }}</span>
          <span v-else>{{ t('submit') || 'Submit' }}</span>
        </button>

        <!-- Message -->
        <div v-if="message.text" :class="message.type === 'error' ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'"
             class="w-full text-sm text-center p-2 rounded-lg">
          {{ message.text }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

// configurable length
const length = Number(route.query.len || 6)

const digits = ref(Array.from({ length }, () => ''))
const otpRefs = ref([])

const isSubmitting = ref(false)
const message = ref({ type: null, text: '' })

// resend timer
const RESEND_SECONDS = Number(route.query.wait || 120)
const countdown = ref(RESEND_SECONDS)
let timerId = null

const isComplete = computed(() => digits.value.every((d) => d !== ''))

function focusIndex(i) {
  const el = otpRefs.value[i]
  if (el) el.focus()
}

function onInput(e, i) {
  const val = e.target.value.replace(/\D/g, '').slice(0, 1)
  digits.value[i] = val
  if (val && i < length - 1) focusIndex(i + 1)
}

function onBackspace(i) {
  if (digits.value[i]) {
    digits.value[i] = ''
  } else if (i > 0) {
    focusIndex(i - 1)
    digits.value[i - 1] = ''
  }
}

function onPaste(e) {
  const txt = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, length)
  if (!txt) return
  for (let i = 0; i < length; i++) digits.value[i] = txt[i] || ''
  // move focus to last filled
  const last = Math.min(txt.length, length) - 1
  if (last >= 0) focusIndex(last)
}

function startTimer() {
  clearInterval(timerId)
  countdown.value = RESEND_SECONDS
  timerId = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) clearInterval(timerId)
  }, 1000)
}

async function resend() {
  message.value = { type: null, text: '' }
  try {
    await fakeResend() // replace with real API
    message.value = { type: 'success', text: t('otp_sent_again') || 'OTP sent again.' }
    startTimer()
  } catch (e) {
    message.value = { type: 'error', text: (e && e.message) || t('an_unexpected_error_occurred') || 'Error. Try again.' }
  }
}

async function onSubmit() {
  if (!isComplete.value) return
  isSubmitting.value = true
  message.value = { type: null, text: '' }
  try {
    const code = digits.value.join('')
    await verifyOtp(code) // replace with real API
    message.value = { type: 'success', text: t('otp_verified') || 'OTP verified.' }
    // route to reset password page or dashboard
    // router.push({ name: 'reset-password' })
  } catch (e) {
    message.value = { type: 'error', text: (e && e.message) || t('invalid_otp') || 'Invalid OTP. Please try again.' }
    // clear and refocus
    digits.value = Array.from({ length }, () => '')
    await nextTick()
    focusIndex(0)
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  if (router) router.back()
  else window.history.back()
}

/* ------- Replace these with real API calls ------- */
async function fakeResend() {
  return new Promise((r) => setTimeout(r, 600))
}
async function verifyOtp(code) {
  // Example:
  // const res = await fetch('/api/v1/auth/verify-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code }) })
  // if (!res.ok) throw new Error('Invalid OTP')
  return new Promise((r) => setTimeout(r, 600))
}
/* ------------------------------------------------- */

onMounted(() => {
  startTimer()
  nextTick(() => focusIndex(0))
})
onBeforeUnmount(() => {
  clearInterval(timerId)
})
</script>
