<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-3xl font-bold flex items-center gap-2">
        <span class="i-lucide-clock"></span>
        Time Table
      </h2>

      <!-- Week selector -->
      <div class="relative">
        <select
          v-model="selectedWeek"
          class="appearance-none border rounded-lg px-4 py-2 pr-9 font-semibold">
          <option v-for="w in weeks" :key="w" :value="w">{{ w }}</option>
        </select>
        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">▾</span>
      </div>
    </div>

    <!-- Morning table -->
    <h3 class="text-xl font-semibold mb-2">Morning (7:00–11:00)</h3>
    <table class="w-full table-fixed border-collapse">
      <thead>
        <tr class="bg-gray-200 text-gray-700">
          <th class="border border-gray-300 w-30 py-3 text-center px-3">Time</th>
          <th v-for="d in days" :key="d" class="border border-gray-300 py-3 font-semibold text-center">
            {{ d }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in timesMorning" :key="t">
          <td class="border border-gray-300 px-3 py-6 text-center font-medium">{{ t }}</td>
          <td
            v-for="d in days"
            :key="d + t"
            class="border border-gray-300 px-3 py-4 cursor-pointer hover:bg-gray-100"
            @click="editCell(d, t)"
          >
            <div v-if="slot(d, t)">
              <div class="text-center font-semibold">{{ slot(d, t)?.subject }}</div>
              <div class="mt-2 text-xs flex items-center text-gray-700">
                <span>{{ slot(d, t)?.teacher }}</span>
                <span class="ml-auto text-red-500">{{ slot(d, t)?.room }}</span>
              </div>
            </div>
            <div v-else class="h-16 text-gray-400 italic flex items-center justify-center">
              empty
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Afternoon table -->
    <h3 class="text-xl font-semibold my-4">Afternoon (1:00–5:00)</h3>
    <table class="w-full table-fixed border-collapse">
      <thead>
        <tr class="bg-gray-200 text-gray-700">
          <th class="border border-gray-300 w-30 py-3 text-center px-3">Time</th>
          <th v-for="d in days" :key="d" class="border border-gray-300 py-3 font-semibold text-center">
            {{ d }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in timesAfternoon" :key="t">
          <td class="border border-gray-300 px-3 py-6 text-center font-medium">{{ t }}</td>
          <td
            v-for="d in days"
            :key="d + t"
            class="border border-gray-300 px-3 py-4 cursor-pointer hover:bg-gray-100"
            @click="editCell(d, t)"
          >
            <div v-if="slot(d, t)">
              <div class="text-center font-semibold">{{ slot(d, t)?.subject }}</div>
              <div class="mt-2 text-xs flex items-center text-gray-700">
                <span>{{ slot(d, t)?.teacher }}</span>
                <span class="ml-auto text-red-500">{{ slot(d, t)?.room }}</span>
              </div>
            </div>
            <div v-else class="h-16 text-gray-400 italic flex items-center justify-center">
              empty
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit Modal -->
    <div v-if="editing" class="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h3 class="text-lg font-semibold mb-4">Edit Slot ({{ editing.day }} {{ editing.time }})</h3>
        
        <div class="space-y-3">
          <input v-model="form.subject" type="text" placeholder="Subject" class="w-full border rounded px-3 py-2" />
          <input v-model="form.teacher" type="text" placeholder="Teacher" class="w-full border rounded px-3 py-2" />
          <input v-model="form.room" type="text" placeholder="Room" class="w-full border rounded px-3 py-2" />
        </div>

        <div class="flex justify-end gap-3 mt-4">
          <button @click="editing = null" class="px-4 py-2 rounded bg-gray-300">Cancel</button>
          <button @click="saveCell" class="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Slot = { subject: string; teacher?: string; room?: string }
type DaySchedule = { [time: string]: Slot | undefined }
type WeekSchedule = { [day: string]: DaySchedule }
type Schedule = { [week: string]: WeekSchedule }

const days = ['Monday', 'Tuesday', 'Wedenesday', 'Thursday', 'Friday']
const timesMorning = ['7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00']
const timesAfternoon = ['13:00-14:00','14:00-15:00','15:00-16:00','16:00-17:00']

function makeWeek(): WeekSchedule {
  const wk: WeekSchedule = {}
  for (const d of days) {
    wk[d] = {}
    for (const t of [...timesMorning, ...timesAfternoon]) {
      wk[d][t] = undefined // start empty
    }
  }
  return wk
}

const schedule = ref<Schedule>({
  'Week 1': makeWeek(),
  'Week 2': makeWeek(),
  'Week 3': makeWeek(),
})

const weeks = Object.keys(schedule.value)
const selectedWeek = ref(weeks[0])
const weekData = computed<WeekSchedule>(() => schedule.value[selectedWeek.value] || {})

function slot(day: string, time: string): Slot | undefined {
  return weekData.value?.[day]?.[time]
}

/* Editing state */
const editing = ref<{day: string; time: string} | null>(null)
const form = ref<Slot>({ subject: '', teacher: '', room: '' })

function editCell(day: string, time: string) {
  editing.value = { day, time }
  const existing = slot(day, time)
  form.value = existing ? { ...existing } : { subject: '', teacher: '', room: '' }
}

function saveCell() {
  if (!editing.value) return
  const { day, time } = editing.value
  weekData.value[day][time] = { ...form.value }
  editing.value = null
}
</script>
