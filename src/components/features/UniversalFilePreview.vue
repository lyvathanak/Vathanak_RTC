<template>
  <div class="w-full">
    <!-- IMAGE -->
    <img
      v-if="isImage"
      :src="src"
      :alt="displayName"
      class="max-w-full h-auto rounded"
    />

    <!-- VIDEO -->
    <video
      v-else-if="isVideo"
      :src="src"
      controls
      class="w-full rounded"
      :style="{ height }"
    />

    <!-- AUDIO -->
    <audio
      v-else-if="isAudio"
      :src="src"
      controls
      class="w-full"
    ></audio>

    <!-- OFFICE (Word/Excel/PPT) via viewer -->
    <iframe
      v-else-if="isOffice"
      :src="officeViewerUrl"
      class="w-full border rounded"
      :style="{ height }"
      referrerpolicy="no-referrer"
    ></iframe>

    <!-- PDF via Google Viewer (avoid iframing your host) -->
    <iframe
      v-else-if="isPdf"
      :src="pdfViewerUrl"
      class="w-full border rounded"
      :style="{ height }"
      referrerpolicy="no-referrer"
    ></iframe>

    <!-- Fallback -->
    <div v-else class="text-sm text-gray-600">
      No inline preview available for <strong>{{ displayName }}</strong>.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: { type: String, required: true },      // public URL to your file
  filename: { type: String, default: '' },
  mime: { type: String, default: '' },        // can be ''
  height: { type: String, default: '70vh' },
  officeViewer: { type: String, default: 'google' }, // 'google' | 'office'
})

const height = computed(() => props.height)

const lower = (s) => (s || '').toLowerCase()
const extFrom = (s) => {
  try {
    const clean = (s || '').split('?')[0].split('#')[0]
    const parts = clean.split('.')
    return lower(parts[parts.length - 1] || '')
  } catch { return '' }
}

const guessExt = computed(() =>
  props.filename ? extFrom(props.filename) : extFrom(props.src)
)
const mime = computed(() => lower(props.mime || ''))

const isPdf   = computed(() => mime.value === 'application/pdf' || guessExt.value === 'pdf')
const isImage = computed(() => mime.value.startsWith('image/') || ['png','jpg','jpeg','gif','webp','bmp','svg'].includes(guessExt.value))
const isVideo = computed(() => mime.value.startsWith('video/') || ['mp4','webm','ogg','mov','m4v','mkv'].includes(guessExt.value))
const isAudio = computed(() => mime.value.startsWith('audio/') || ['mp3','wav','ogg','m4a','aac','flac'].includes(guessExt.value))

const isOffice = computed(() => {
  const exts = ['doc','docx','ppt','pptx','xls','xlsx']
  const mimes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]
  return exts.includes(guessExt.value) || mimes.includes(mime.value)
})

const encodedSrc = computed(() => encodeURIComponent(props.src))

// Office viewer keeps encoded (MS/Google accept encoded)
const officeViewerUrl = computed(() =>
  props.officeViewer === 'office'
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodedSrc.value}`
    : `https://docs.google.com/gview?url=${props.src}&embedded=true`
)

// PDF viewer uses Google PDF viewer to bypass frame restrictions
const pdfViewerUrl = computed(() =>
  `https://docs.google.com/gview?url=${encodeURIComponent(props.src)}&embedded=true`
)
console.log('📄 PDF Viewer URL:', pdfViewerUrl.value)

const displayName = computed(() =>
  props.filename || (props.src.split('/').pop() || 'file')
)
</script>
