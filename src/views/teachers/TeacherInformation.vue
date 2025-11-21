<template>
  <div class="p-3">
  <!-- show attendance -->
   <div class="flex flex-wrap justify-center text-center gap-8 mb-6">
  <!-- Total Present -->
  <div class="flex flex-col w-[250px] items-center justify-center gap-2.5 px-[50px] py-5 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] border-blue-500 shadow-[0px_4px_4px_#00000040]">
    <div class="font-normal text-blue text-base">Total Present</div>
    <div class="font-bold text-blue-500 text-xl">{{ stats.present }}</div>
  </div>

  <!-- On Time -->
  <div class="flex flex-col w-[250px] items-center justify-center gap-2.5 px-[50px] py-5 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] border-green-500 shadow-[0px_4px_4px_#00000040]">
    <div class="font-normal text-blue text-base">On Time</div>
    <div class="font-bold text-green-500 text-xl">{{ stats.onTime }}</div>
  </div>

  <!-- Late -->
  <div class="flex flex-col w-[250px] items-center justify-center gap-2.5 px-[50px] py-5 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] border-yellow-500 shadow-[0px_4px_4px_#00000040]">
    <div class="font-normal text-blue text-base">Late</div>
    <div class="font-bold text-yellow-500 text-xl">{{ stats.late }}</div>
  </div>

  <!-- Absence -->
  <div class="flex flex-col w-[250px] items-center justify-center gap-2.5 px-[50px] py-5 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] border-red-500 shadow-[0px_4px_4px_#00000040]">
    <div class="font-normal text-blue text-base">Absence</div>
    <div class="font-bold text-red-500 text-xl">{{ stats.absence }}</div>
  </div>
</div>

<div class="bg-white rounded-[10px] shadow-lg overflow-x-auto">
  <table class="border min-w-full">
    <thead>
      <tr class="bg-gray-300 border">
        <th class="p-3 text-center">Fullname</th> 
        <th class="p-3 text-center">Section</th>
        <th class="p-3 text-center">Grade</th>
        <th class="p-3 text-center">Subject</th>
        <th class="p-3 text-center">Date</th>
        <th class="p-3 text-center">Shift</th>
        <th class="p-3 text-center">Status</th>
      </tr>
    </thead>
      <tr v-for="(info,index) in information" key:="index" class="border ">
        <td class="text-center p-3">{{ info.name }}</td>
        <td class="text-center p-3">{{ info.section }}</td>
        <td class="text-center p-3">{{ info.grade }}</td>
        <td class="text-center p-3">{{ info.subject }}</td>
        <td class="text-center p-3">{{ info.date }}</td>
        <td class="text-center p-3">{{ info.shift }}</td>
        <td class="text-center p-3">
          <span
            class="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm w-24"
            :class="{
                  'bg-green-500 text-white px-2 py-2 rounded-md text-sm': info.status === 'OnTime',
                  'bg-yellow-500 text-white px-2.5 py-2 rounded-md text-sm': info.status === 'Late',
                  'bg-red-500 text-white px-2 py-2 rounded-md text-sm': info.status === 'Absence'}">
                  {{ info.status }}
          </span>
        </td>

      </tr>
    <tbody>

    </tbody>
  </table>
</div>

</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const stats = ref({
  present: 50,
  onTime: 20,
  late: 20,
  absence: 10
});

const information = reactive([
  {
    name: "Sita Yong",
    section: "Pharmacy",
    grade: "1",
    subject: "History",
    date: "01-06-2025",
    shift: "Morning",
    status: "Late" 
  },
  {
    name: "Dara Kim",
    section: "Nursing",
    grade: "2",
    subject: "Math",
    date: "05-06-2025",
    shift: "Afternoon",
    status: "OnTime"
  },
  {
    name: "Sokha Lim",
    section: "Biology",
    grade: "3",
    subject: "Chemistry",
    date: "07-06-2025",
    shift: "Morning",
    status: "Absence"
  }
])
</script>

<style scoped>
table, th, td { border: 1px solid #cfcfcf; }
</style>

