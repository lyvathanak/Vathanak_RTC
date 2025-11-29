<template>
  <div class="min-h-screen bg-gray-50 p-8">
    
    <div class="bg-[#235AA6] text-white p-4 flex items-center justify-between shadow-lg -mx-8 -mt-8 mb-8">
      <div class="flex items-center">
        <h1 class="text-xl font-medium">Head of Department</h1>
      </div>
      <div class="flex items-center space-x-4">
        <button class="relative">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.007 2.007 0 0118 14.285V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.285c0 .531-.192 1.053-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span class="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
        </button>
        <select class="bg-[#1e4a8b] border border-blue-700 rounded-md py-1 px-2 text-sm">
          <option>🇺🇸 EN</option>
          <option>🇰🇭 KH</option>
        </select>
        <div class="flex items-center space-x-2">
          <img src="https://via.placeholder.com/30" alt="User Avatar" class="w-8 h-8 rounded-full border-2 border-white">
          <span class="text-white font-medium">{{ authStore.user?.name || 'John Doe' }}</span>
        </div>
      </div>
    </div>
    <div class="w-full">
      <div class="mb-6 pb-2 flex justify-between items-end">
        <div>
          <h1 :class="['text-3xl font-medium tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('dashboard') || 'Dashboard' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            A quick overview of key metrics and statistics across the department.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 flex justify-between items-center border border-gray-100">
          <div><p class="text-sm font-medium text-gray-500">Teachers</p><p class="text-3xl font-semibold text-gray-800 mt-1">{{ dashboardData.teachers }}</p></div>
          <span class="flex items-center text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full">+11.01%</span>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 flex justify-between items-center border border-gray-100">
          <div><p class="text-sm font-medium text-gray-500">Students</p><p class="text-3xl font-semibold text-gray-800 mt-1">{{ dashboardData.students }}</p></div>
          <span class="flex items-center text-red-600 text-sm font-medium bg-red-100 px-3 py-1 rounded-full">-2.01%</span>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 flex justify-between items-center border border-gray-100">
          <div><p class="text-sm font-medium text-gray-500">Attendance</p><p class="text-3xl font-semibold text-gray-800 mt-1">{{ dashboardData.attendance }}%</p></div>
          <span class="flex items-center text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full">+11.01%</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 class="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Genders</h2>
          <div class="flex items-center justify-center h-64 relative">
            <canvas ref="gendersChartCanvas"></canvas>
            <div class="absolute text-center"><p class="text-4xl font-semibold text-gray-800">{{ dashboardData.genders.total }}</p><p class="text-sm text-gray-500">Total</p></div>
          </div>
          <div class="flex justify-center space-x-6 mt-4 text-sm text-gray-600">
            <span class="flex items-center"><span class="block w-3 h-3 rounded-full mr-2 bg-blue-500"></span>Male - {{ dashboardData.genders.male }}%</span>
            <span class="flex items-center"><span class="block w-3 h-3 rounded-full mr-2 bg-pink-500"></span>Female - {{ dashboardData.genders.female }}%</span>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 class="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Results</h2>
          <div class="flex items-center justify-center h-64 relative">
            <canvas ref="resultsChartCanvas"></canvas>
            <div class="absolute text-center"><p class="text-4xl font-semibold text-gray-800">{{ dashboardData.results.total }}</p><p class="text-sm text-gray-500">Total</p></div>
          </div>
          <div class="flex justify-center space-x-6 mt-4 text-sm text-gray-600">
            <span class="flex items-center"><span class="block w-3 h-3 rounded-full mr-2 bg-green-500"></span>Passed - {{ dashboardData.results.passed }}%</span>
            <span class="flex items-center"><span class="block w-3 h-3 rounded-full mr-2 bg-red-500"></span>Failed - {{ dashboardData.results.failed }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h2 class="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Student Performance (By Gender & Year)</h2>
        <div class="h-96">
          <canvas ref="performanceChartCanvas"></canvas>
        </div>
        <div class="flex justify-center space-x-6 mt-4 text-sm text-gray-600">
          <span class="flex items-center"><span class="block w-3 h-3 rounded-full mr-2 bg-blue-500"></span>Male</span>
          <span class="flex items-center"><span class="block w-3 h-3 rounded-full mr-2 bg-pink-500"></span>Female</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import Chart from 'chart.js/auto';

const authStore = { user: { name: 'Dr. Jane Doe' } };
const { t, locale } = useI18n({ messages: { en: { dashboard: 'Dashboard' } } });

const gendersChartCanvas = ref(null);
const resultsChartCanvas = ref(null);
const performanceChartCanvas = ref(null);

const dashboardData = ref({
  teachers: 0, students: 0, attendance: 0,
  genders: { male: 0, female: 0, total: 0 },
  results: { passed: 0, failed: 0, total: 0 },
  performance: { maleScores: [], femaleScores: [], years: [] }
});

const fetchData = () => {
    setTimeout(() => {
        dashboardData.value = {
            teachers: 65, students: 7265, attendance: 65,
            genders: { male: 75, female: 25, total: 100 },
            results: { passed: 80, failed: 20, total: 100 },
            performance: { 
                maleScores: [223, 174, 394, 295], femaleScores: [256, 169, 316, 350],
                years: ['2021-2022', '2022-2023', '2023-2024', '2024-2025']
            }
        };
        renderGendersChart();
        renderResultsChart();
        renderPerformanceChart();
    }, 500); 
};

onMounted(fetchData);

const renderGendersChart = () => {
  const ctx = gendersChartCanvas.value.getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [dashboardData.value.genders.male, dashboardData.value.genders.female],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'],
        borderColor: ['rgba(59, 130, 246, 1)', 'rgba(236, 72, 153, 1)'],
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '70%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.parsed}%` } } }
    }
  });
};

const renderResultsChart = () => {
  const ctx = resultsChartCanvas.value.getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Passed', 'Failed'],
      datasets: [{
        data: [dashboardData.value.results.passed, dashboardData.value.results.failed],
        backgroundColor: ['rgba(52, 211, 153, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(52, 211, 153, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '70%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.parsed}%` } } }
    }
  });
};

const renderPerformanceChart = () => {
  const ctx = performanceChartCanvas.value.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dashboardData.value.performance.years,
      datasets: [
        {
          label: 'Male', data: dashboardData.value.performance.maleScores,
          backgroundColor: 'rgba(59, 130, 246, 0.8)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 1, borderRadius: 5,
        },
        {
          label: 'Female', data: dashboardData.value.performance.femaleScores,
          backgroundColor: 'rgba(236, 72, 153, 0.8)', borderColor: 'rgba(236, 72, 153, 1)', borderWidth: 1, borderRadius: 5,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, title: { display: true, text: 'Years', font: { size: 14, weight: 'normal' }, color: '#4B5563' } },
        y: { beginAtZero: true, grid: { color: 'rgba(229, 231, 235, 0.7)' }, title: { display: true, text: 'Scores', font: { size: 14, weight: 'normal' }, color: '#4B5563' } }
      }
    }
  });
};
</script>