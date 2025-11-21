<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <!-- Academic Year Selector -->
    <div class="mb-4">
      <select
        v-model="selectedYear"
        class="border border-gray-700 p-2 rounded-[10px] w-40 text-center"
      >
        <option disabled value="">Academic Year</option>
        <option v-for="year in years" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>

    <!-- Semester 1 -->
    <h2 class="font-bold mb-2">Semester 1</h2> 
    <div
      v-if="academicData[selectedYear]"
      class="mb-6 bg-white rounded-xl shadow-lg text-center overflow-hidden"
    >
      <table class="min-w-full border-collapse text-center table-fixed">
        <thead>
          <tr class="bg-gray-200 border-b">
            <th class="p-3 text-center w-1/4">Subject</th>
            <th class="p-3 text-center w-1/4">Credit</th>
            <th class="p-3 text-center w-1/4">Absence</th>
            <th class="p-3 text-center w-1/4">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in academicData[selectedYear]?.semester1 || []"
            :key="index"
            class="border-b"
          >
            <td class="p-3 text-center">{{ item.subject }}</td>
            <td class="p-3 text-center">{{ item.credit }}</td>
            <td class="p-3 text-center">{{ item.absence }}</td>
            <td class="p-3 text-center">{{ item.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Semester 2 -->
    <h2 class="font-bold mb-2">Semester 2</h2>
    <div
      v-if="academicData[selectedYear]"
      class="bg-white rounded-lg shadow-lg text-center overflow-hidden"
    >
      <table class="min-w-full border-collapse text-center table-fixed">
        <thead>
          <tr class="bg-gray-200 border-b">
            <th class="p-2 text-center w-1/4">Subject</th>
            <th class="p-2 text-center w-1/4">Credit</th>
            <th class="p-2 text-center w-1/4">Absence</th>
            <th class="p-2 text-center w-1/4">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in academicData[selectedYear]?.semester2 || []"
            :key="index"
            class="border-b"
          >
            <td class="p-2 text-center">{{ item.subject }}</td>
            <td class="p-2 text-center">{{ item.credit }}</td>
            <td class="p-2 text-center">{{ item.absence }}</td>
            <td class="p-2 text-center">{{ item.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAcademicInfo } from "@/stores/Student/AcademicInfo";

const years = ref([]);
const selectedYear = ref("");
const academicData = ref({});

onMounted(async () => {
  try {
    const response = await getAcademicInfo(); // call API
    console.log("Academic Info (raw):", response);

    // ✅ collect academic years from semesters
    const semesters = response.semesters || [];

    // Extract unique academic years from response
    const academicYears = [
      ...new Set(semesters.map((s) => s.academic_year?.year_number)),
    ];

    // Build years like "Year1", "Year2"
    years.value = academicYears.map((num) => `Year${num}`);
    selectedYear.value = years.value[0] || "";

    // Initialize academicData
    const mappedData = {};
    years.value.forEach((year) => {
      mappedData[year] = { semester1: [], semester2: [] };
    });

    // Map backend semesters → frontend structure
    semesters.forEach((sem) => {
      const yearKey = `Year${sem.academic_year?.year_number || 1}`;

      // check semester_number to push into correct semester
      if (sem.semester_number === 2) {
        mappedData[yearKey].semester1 = sem.subjects.map((subj) => ({
          subject: subj.subject_name,
          credit: subj.credit,
          absence: subj.attendance_count?.absent || 0,
          score: subj.scores ?? "-",
        }));
      } else if (sem.semester_number === 3) {
        mappedData[yearKey].semester2 = sem.subjects.map((subj) => ({
          subject: subj.subject_name,
          credit: subj.credit,
          absence: subj.attendance_count?.absent || 0,
          score: subj.scores ?? "-",
        }));
      }
    });

    academicData.value = mappedData;
    console.log("📌 academicData mapped:", academicData.value);
  } catch (error) {
    console.error("❌ Failed to fetch academic info:", error);
  }
});
</script>
