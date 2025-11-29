<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
        <div>
          <h1 :class="['text-4xl font-extrabold tracking-tight text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('hod_dashboard') || 'Primary School Management Dashboard' }}
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Strategic overview of classes, staff, and student welfare.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl p-6 border-l-4 border-blue-600">
          <div class="flex items-center justify-between">
            <div><p class="text-sm font-semibold text-gray-500 uppercase">Total Teachers</p><p class="text-4xl font-bold text-gray-800 mt-1">12</p></div>
            <div class="p-3 bg-blue-100 rounded-full text-blue-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl p-6 border-l-4 border-purple-600">
          <div class="flex items-center justify-between">
            <div><p class="text-sm font-semibold text-gray-500 uppercase">Total Students</p><p class="text-4xl font-bold text-gray-800 mt-1">285</p></div>
            <div class="p-3 bg-purple-100 rounded-full text-purple-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg></div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl p-6 border-l-4 border-yellow-600">
          <div class="flex items-center justify-between">
            <div><p class="text-sm font-semibold text-gray-500 uppercase">Avg. Class Size</p><p class="text-4xl font-bold text-gray-800 mt-1">24</p></div>
            <div class="p-3 bg-yellow-100 rounded-full text-yellow-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h10M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"></path></svg></div>
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl p-6 border-l-4 border-red-600 cursor-pointer">
          <div class="flex items-center justify-between">
            <div><p class="text-sm font-semibold text-red-600 uppercase">Alerts (Attendance/Behavior)</p><p class="text-4xl font-bold text-red-600 mt-1">17</p></div>
            <div class="p-3 bg-red-100 rounded-full text-red-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg></div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-2xl shadow-xl p-6">
                <h2 class="text-2xl font-bold mb-4 text-gray-800">Enrollment & Attendance Trends</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="border border-gray-200 rounded-xl p-4 h-80 flex flex-col justify-center items-center bg-gray-50">
                        <p class="text-lg font-medium text-gray-600 mb-2">Student Enrollment by Grade</p>
                        <div class="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-300 shadow-inner">
                            <p class="text-gray-500 font-bold">Bar Chart: Grade 1-6</p>
                        </div>
                    </div>

                    <div class="border border-gray-200 rounded-xl p-4 h-80 flex flex-col justify-center items-center bg-gray-50">
                        <h3 class="text-lg font-medium text-gray-600 mb-2">Monthly Absenteeism Rate (%)</h3>
                        <div class="w-full h-40 bg-white rounded-lg relative overflow-hidden shadow-inner">
                            <div class="absolute bottom-0 w-full flex justify-around items-end h-full p-2">
                                <div class="w-4 bg-red-400 h-1/4 rounded-t-lg shadow"></div>
                                <div class="w-4 bg-red-400 h-2/4 rounded-t-lg shadow"></div>
                                <div class="w-4 bg-red-600 h-3/4 rounded-t-lg shadow"></div>
                                <div class="w-4 bg-red-400 h-1/6 rounded-t-lg shadow"></div>
                                <div class="w-4 bg-red-400 h-1/3 rounded-t-lg shadow"></div>
                                <div class="w-4 bg-red-400 h-1/5 rounded-t-lg shadow"></div>
                                <div class="w-4 bg-red-600 h-2/5 rounded-t-lg shadow"></div>
                            </div>
                        </div>
                        <p class="text-sm font-semibold text-gray-700 mt-3">Current Absenteeism: 5.2%</p>
                    </div>
                </div>
            </div>
          </div>
          
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-700">
              <h3 class="text-xl font-bold mb-3 text-red-700 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
                High-Priority Alerts
              </h3>
              <ul class="space-y-3 text-sm">
                <li class="p-2 bg-red-50 rounded-lg border-l-4 border-red-500">5 Students have 5+ unexcused absences (Chronic).</li>
                <li class="p-2 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">Grade 3-A Homeroom Teacher requests behavior support.</li>
                <li class="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">Grade 1 enrollment capacity reached (2 sections).</li>
              </ul>
            </div>
            
            <div class="bg-white rounded-2xl shadow-xl p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-800">Quick Actions</h3>
                <div class="space-y-3">
                    <button class="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200 shadow-sm">
                        <span class="font-medium text-red-700">Review Absence Requests</span>
                        <span class="bg-red-200 text-red-800 text-xs font-bold px-3 py-1 rounded-full">7 PENDING</span>
                    </button>
                    <button class="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 shadow-sm">
                        <span class="font-medium text-blue-700">Check Section Capacities</span>
                        <span class="text-xs text-gray-500">Max 25/Class</span>
                    </button>
                </div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
// Mocked imports for display purposes
const authStore = { user: { name: 'Dr. Jane Doe', email: 'jane.doe@rtc.edu', profile: { department: 'Primary School' } }, userRole: 'head_of_department', userPermissions: ['manage_students', 'manage_teachers', 'approve_leave'] };
const { t, locale } = useI18n({ messages: { en: { hod_dashboard: 'HOD Dashboard', welcome: 'Welcome' } } }); 
const router = useRouter();
const route = useRoute();
</script>