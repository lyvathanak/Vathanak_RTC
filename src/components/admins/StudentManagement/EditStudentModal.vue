<!-- EditStudentModal.vue -->
<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="close"></div>

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          class="w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl h-[90vh] sm:h-[85vh] rounded-xl sm:rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div
            class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b bg-gray-50 flex items-center justify-between"
          >
            <div class="flex items-end gap-2">
              <div class="text-base sm:text-lg md:text-xl tracking-wider font-bold">{{$t('student')}}</div>
              <span class="text-sm text-[#235AA6]">{{$t('edit_student')}}</span>
            </div>
            <button
              class="p-2 rounded-md hover:bg-gray-100 transition-colors"
              @click="close"
              aria-label="Close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Top Tabs -->
          <div class="px-4 sm:px-5 md:px-6 pt-3 sm:pt-4">
            <div
              class="inline-flex rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                class="px-3 sm:px-4 py-2 text-sm"
                :class="
                  topTab === 'general'
                    ? 'bg-[#235AA6] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                "
                @click="topTab = 'general'"
              >
                {{$t('general_information')}}
              </button>
              <button
                class="px-3 sm:px-4 py-2 text-sm"
                :class="
                  topTab === 'academic'
                    ? 'bg-[#235AA6] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                "
                @click="topTab = 'academic'"
              >
                {{$t('new_academic_information')}} <span class="text-red-500">*</span>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-4 sm:px-5 md:px-6 pb-3 sm:pb-4 pt-3 sm:pt-4 flex-1 overflow-y-auto min-h-0">
            <!-- ===== General Information ===== -->
            <section v-if="topTab === 'general'" class="space-y-4 sm:space-y-5 md:space-y-6">
              <!-- Basic Information (collapsible) -->
              <div>
                <button
                  class="w-full text-left flex items-center gap-2 font-semibold text-sm sm:text-base"
                  @click="basicOpen = !basicOpen"
                >
                  <Info class="w-4 text-gray-500 mr-1" />
                  {{$t('basic_information')}}
                  <ChevronDown
                    class="ml-1 w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': basicOpen }"
                  />
                </button>

                <div v-show="basicOpen" class="mt-3 border rounded-lg p-3 sm:p-4">
                  <div class="grid grid-cols-1 md:grid-cols-[140px_1fr] lg:grid-cols-[160px_1fr] gap-4">
                    <!-- Photo -->
                    <div class="flex flex-col items-center">
                      <div class="w-[100px] h-[125px] sm:w-[120px] sm:h-[150px] border rounded-md overflow-hidden bg-gray-100">
                        <img
                          v-if="previewSrc"
                          :src="previewSrc"
                          class="w-full h-full object-cover"
                          alt="Student photo"
                          @error="handleImageError"
                        />
                        <div v-else class="w-full h-full grid place-items-center text-xs text-gray-400">
                          <div class="text-center">
                            <div>Photo preview</div>
                            <div class="text-[10px] mt-1">No image</div>
                          </div>
                        </div>
                      </div>
                      <label
                          class="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-md border cursor-pointer text-xs sm:text-sm hover:bg-gray-50"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            class="hidden"
                            @change="onPhotoChange"
                          />
                          Choose File
                      </label>
                    </div>

                    <!-- Fields -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('id_card')}}
                        </label>
                        <input
                          v-model="form.id_card"
                          type="text"
                          disabled
                          class="w-full rounded-md border px-3 py-2 bg-gray-100 text-gray-700"
                        />
                      </div>

                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('khmer_name')}} <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="form.khmer_name"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.khmer_name }"
                        />
                        <p v-if="errors.khmer_name" class="text-red-500 text-xs mt-1">{{ errors.khmer_name }}</p>
                      </div>

                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('name_latin')}} <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="form.latin_name"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.latin_name }"
                        />
                        <p v-if="errors.latin_name" class="text-red-500 text-xs mt-1">{{ errors.latin_name }}</p>
                      </div>

                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('gender')}} <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                          <select
                            v-model="form.gender"
                            class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none bg-white"
                            :class="{ 'border-red-500 focus:ring-red-500': errors.gender }"
                          >
                            <option value="" disabled>{{$t('select_gender')}}</option>
                            <option
                              v-for="g in genderOptions"
                              :key="g"
                              :value="g"
                            >
                              {{ g }}
                            </option>
                          </select>
                          <ChevronDown
                            class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          />
                        </div>
                        <p v-if="errors.gender" class="text-red-500 text-xs mt-1">{{ errors.gender }}</p>
                      </div>

                      <div>
                          <label class="block text-sm text-gray-600 mb-1">
                            {{$t('date_of_birth')}} <span class="text-red-500">*</span>
                          </label>
                        <input
                          v-model="form.date_of_birth"
                          type="date"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.date_of_birth }"
                        />
                        <p v-if="errors.date_of_birth" class="text-red-500 text-xs mt-1">{{ errors.date_of_birth }}</p>
                      </div>

                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('place_of_birth')}}
                        </label>
                        <input
                          v-model="form.place_of_birth"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div class="flex items-center gap-4">
                        <label class="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            v-model="form.is_radie"
                            class="rounded border-gray-300"
                          />
                          <span class="text-sm text-gray-700">{{$t('radie')}}</span>
                        </label>
                        <label class="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            v-model="form.active"
                            class="rounded border-gray-300"
                          />
                          <span class="text-sm text-gray-700">{{$t('active')}}</span>
                        </label>
                      </div>

                      <div class="md:col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('biography')}}
                        </label>
                        <textarea
                          v-model="form.bio"
                          rows="4"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        >
                        </textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- More Information (collapsible + inner tabs) -->
              <div>
                <button
                  class="w-full text-left flex items-center gap-2 font-semibold text-sm sm:text-base"
                  @click="moreOpen = !moreOpen"
                >
                  <Info class="w-4 text-gray-500 mr-1" />
                  {{$t('more_information')}}
                  <ChevronDown
                    class="ml-1 w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': moreOpen }"
                  />
                </button>

                <div v-show="moreOpen" class="mt-3 border rounded-lg">
                  <!-- inner tabs -->
                  <div class="px-3 sm:px-4 pt-3 sm:pt-4">
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="tab in moreTabs"
                        :key="tab.key"
                        class="px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm border"
                        :class="
                          innerTab === tab.key
                            ? 'bg-[#235AA6] text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        "
                        @click="innerTab = tab.key"
                      >
                            {{$t(tab.label)}}
                      </button>
                    </div>
                  </div>

                  <div class="p-3 sm:p-4">
                    <!-- Contact Information -->
                    <div
                      v-if="innerTab === 'contact'"
                      class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
                    >
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('origin')}} *
                        </label>
                        <div class="relative">
                          <select
                            v-model="form.origin"
                            class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none bg-white"
                          >
                            <option value="" disabled>{{$t('select_province')}}</option>
                            <option
                              v-for="province in provinces"
                              :key="province"
                              :value="province"
                            >
                              {{ province }}
                            </option>
                          </select>
                          <ChevronDown
                            class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('phone_number')}}
                        </label>
                        <input
                          v-model="form.phone_number"
                          type="tel"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                          :class="{ 'border-red-500 focus:ring-red-500': errors.phone_number }"
                        />
                        <p v-if="errors.phone_number" class="text-red-500 text-xs mt-1">{{ errors.phone_number }}</p>
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('email')}}
                        </label>
                        <input
                          v-model="form.email"
                          type="email"
                          class="w-full rounded-md border px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                          disabled
                          readonly
                          aria-readonly="true"
                        />
                        <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('current_address')}}
                        </label>
                        <input
                          v-model="form.current_address"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('permanent_address')}}
                        </label>
                        <input
                          v-model="form.permanent_address"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <!-- Parent Information -->
                    <div
                      v-else-if="innerTab === 'parent'"
                      class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
                    >
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('father_name')}}
                        </label>
                        <input
                          v-model="form.father_name"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('father_phone')}}
                        </label>
                        <input
                          v-model="form.father_phone"
                          type="tel"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('mother_name')}}
                        </label>
                        <input
                          v-model="form.mother_name"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('mother_phone')}}
                        </label>
                        <input
                          v-model="form.mother_phone"
                          type="tel"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="">
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('guardian_name')}}
                        </label>
                        <input
                          v-model="form.guardian_name"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="">
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('guardian_phone')}}
                        </label>
                        <input
                          v-model="form.guardian_phone"
                          type="tel"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <!-- High School Information -->
                    <div
                      v-else-if="innerTab === 'highschool'"
                      class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
                    >
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('high_school')}}
                        </label>
                        <input
                          v-model="form.high_school"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('mcs_no')}}
                        </label>
                        <input
                          v-model="form.mcs_no"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('can_id')}}
                        </label>
                        <input
                          v-model="form.can_id"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <!-- Bac II Information -->
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('grade')}}
                        </label>
                        <input
                          v-model="form.bac_grade"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('from')}}
                        </label>
                        <input
                          v-model="form.bac_from"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm text-gray-600 mb-1">
                          {{$t('program')}}
                        </label>
                        <input
                          v-model="form.bac_program"
                          type="text"
                          class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- ===== New Academic Information ===== -->
            <section v-else class="space-y-3 sm:space-y-4">
              <div class="border rounded-lg p-3 sm:p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('academic_year')}} <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <select
                        v-model="form.academic_year"
                        class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none bg-white"
                      >
                        <option v-for="y in academicYears" :key="y" :value="y">
                          {{ y }}
                        </option>
                      </select>
                      <ChevronDown
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('promotion')}} <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <select
                        v-model="form.promotion"
                        class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none bg-white"
                      >
                        <option value="" disabled>{{$t('select_promotion')}}</option>
                        <option
                          v-for="p in promotionOptions"
                          :key="p"
                          :value="p"
                        >
                          {{ p }}
                        </option>
                      </select>
                      <ChevronDown
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('department')}} <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <select
                        v-model="form.department_id"
                        class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none bg-white"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.department_id }"
                        :disabled="departmentLoading"
                      >
                        <option value="" disabled>
                          {{ departmentLoading ? 'Loading departments...' : $t('select_department') }}
                        </option>
                        <option v-for="dept in departmentsList" :key="dept.id" :value="dept.id">
                          {{ dept.department_name || dept.name }}
                        </option>
                      </select>
                      <ChevronDown
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                    <p v-if="errors.department_id" class="text-red-500 text-xs mt-1">{{ errors.department_id }}</p>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('program')}}<span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <select
                        v-model="form.program_id"
                        class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none bg-white"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.program || errors.program_id }"
                        :disabled="!form.department_id || programLoading"
                      >
                        <option value="" disabled>
                          {{
                            !form.department_id
                              ? $t('select_department_first')
                              : (programLoading ? 'Loading programs...' : $t('select_program'))
                          }}
                        </option>
                        <option v-for="o in programSelectOptions" :key="o.value" :value="o.value">
                          {{ o.label }}
                        </option>
                      </select>
                      <ChevronDown
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                    <p v-if="errors.program || errors.program_id" class="text-red-500 text-xs mt-1">
                      {{ errors.program || errors.program_id }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('section')}}<span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <select
                        v-model="form.sub_department_id"
                        class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none bg-white"
                        :class="{ 'border-red-500 focus:ring-red-500': errors.section || errors.sub_department_id }"
                        :disabled="!form.department_id || sectionLoading"
                      >
                        <option value="" disabled>
                          {{
                            !form.department_id
                              ? $t('select_department_first')
                              : (sectionLoading ? 'Loading sections...' : $t('select_section'))
                          }}
                        </option>
                        <option v-for="o in sectionSelectOptions" :key="o.value" :value="o.value">
                          {{ o.label }}
                        </option>
                      </select>

                      <ChevronDown
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                    <p v-if="errors.section || errors.sub_department_id" class="text-red-500 text-xs mt-1">
                      {{ errors.section || errors.sub_department_id }} 
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('group')}}
                    </label>

                    <div class="mt-1 min-h-[32px] flex flex-wrap gap-2 p-2 border rounded-md bg-gray-50">
                      <span
                        v-for="g in form.groups"
                        :key="g.id ?? g.name"
                        class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md border"
                      >
                        {{ g.name || g.group_name || `Group ${g.id}` }}
                      </span>
                      <span v-if="!form.groups?.length" class="text-xs text-gray-500 py-1">
                        {{$t('no_groups') || 'No groups assigned'}}
                      </span>
                    </div>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('history')}}
                    </label>
                    <input
                      v-model="form.history"
                      type="text"
                      class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Redouble checkboxes -->
                  <div class="md:col-span-2">
                    <div class="text-sm text-gray-600 mb-2">{{$t('redouble')}}</div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      <label
                        v-for="n in [1, 2, 3, 4, 5]"
                        :key="n"
                        class="inline-flex items-center gap-1 sm:gap-2"
                      >
                        <input
                          type="checkbox"
                          v-model="form.redoubles"
                          :value="`Red. Y${n}`"
                          class="rounded border-gray-300"
                        />
                        <span class="text-xs sm:text-sm">Red. Y{{ n }}</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('scholarships')}}
                    </label>
                    <input
                      v-model="form.scholarships"
                      type="text"
                      class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm text-gray-600 mb-1">
                      {{$t('branch')}}
                    </label>
                    <div class="relative">
                      <select
                        v-model="form.branch"
                        class="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none bg-white"
                      >
                        <option value="" disabled>{{$t('select_branch')}}</option>
                        <option v-for="b in branches" :key="b" :value="b">
                          {{ b }}
                        </option>
                      </select>
                      <ChevronDown
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Footer -->
          <div
            class="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-t bg-grey-50 flex items-center justify-between"
          >
            <button
              class="px-3 sm:px-4 py-2 text-sm rounded-lg border bg-red-600 hover:bg-red-500 text-white transition-colors"
              @click="close"
            >
              {{$t('cancel')}}
            </button>

            <div class="flex gap-2 sm:gap-3">
              <button
                class="px-3 sm:px-4 py-2 text-sm rounded-lg bg-[#FF7700] hover:bg-[#e66600] text-white transition-colors"
                @click="emitPromote"
              >
                <span class="hidden sm:inline">{{$t('promote_student')}}</span>
                <span class="sm:hidden">Promote</span>
              </button>
              <button
                class="px-3 sm:px-4 py-2 text-sm rounded-lg bg-[#235AA6] hover:bg-[#1e4a91] text-white transition-colors"
                @click="emitSave"
              >
                <span class="hidden sm:inline">{{$t('update')}}</span>
                <span class="sm:hidden">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { X, ChevronDown, Info } from "lucide-vue-next";
import provincesData from "@/db/CambodiaAdministrationArea/provinces.json";
import { 
    useFilteredByDepartment,
    useProgramsFilteredByDepartment, 
    useSectionsFilteredByDepartment 
  } from "@/stores/global/FilterByDepartment.js";
import { useStudentFormValidate } from "@/stores/global/useFormValidate.js";
import { showNotification } from "@/lib/notifications.js";

/** Props / Emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false }, // v-model
  student: { type: Object, default: () => ({}) }, // initial data
  // OPTIONAL: pass all groups from parent (if you have them). Fallback uses student's groups.
  groupsOptions: { type: Array, default: () => [] },
  academicYears: {
    type: Array,
    default: () => ["2022-2023", "2023-2024", "2024-2025"],
  },
  promotionOptions: { type: Array, default: () => ["Promoted", "Repeat"] },
  programOptions: {
    type: Array,
    default: () => [
      "Bachelor",
      "Associate",
      "Master",
      "Diploma",
      "Certificate",
    ],
  }, // Added programOptions
  departments: { type: Array, default: () => [] }, // Remove default values, will use composables
  branches: { type: Array, default: () => ["Battambang", "Phnom Penh"] },
});
const emit = defineEmits(["update:modelValue", "save", "promote"]);

const open = computed(() => props.modelValue);
const close = () => emit("update:modelValue", false);

// ✅ Use reusable form validation composable
const { 
  errors, 
  validateStudent, 
  clearErrors, 
  mapServerErrors 
} = useStudentFormValidate();

// All groups available to select/display
const allGroups = computed(() => {
  return (props.groupsOptions && props.groupsOptions.length)
    ? props.groupsOptions
    : (props.student?.groups || []);
});


/** Tabs / sections */
const topTab = ref("general"); // 'general' | 'academic'
const basicOpen = ref(true);
const moreOpen = ref(true);
const moreTabs = [
  { key: "contact", label: "contact_information" },
  { key: "parent", label: "parent_information" },
  { key: "highschool", label: "high_school_information" },
  { key: "bac2", label: "bac2_information" },
];
const innerTab = ref("contact");

/** Selects */
const genderOptions = ["Male", "Female"];

// Sort provinces alphabetically for better UX
const provinces = computed(() => {
  return provincesData
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((province) => province.name);
});

/** Form (clone of incoming student) */
const blank = () => ({
  id: "",
  user_id: "",
  id_card: "",
  khmer_name: "",
  latin_name: "",
  full_name: "", // Add full_name field
  first_name: "", // Add first_name field
  last_name: "", // Add last_name field
  gender: "",
  date_of_birth: "",
  place_of_birth: "",
  is_radie: false,
  active: true,
  bio: "",
  origin: "",
  phone_number: "",
  email: "",
  current_address: "",
  permanent_address: "",
  father_name: "",
  father_phone: "",
  mother_name: "",
  mother_phone: "",
  guardian_name: "",
  guardian_phone: "",
  high_school: "",
  mcs_no: "",
  can_id: "",
  bac_grade: "",
  bac_from: "",
  bac_program: "",
  academic_year: props.academicYears.at(-1) ?? "",
  promotion: "",
  program_id: "", // Changed from program to program_id for API consistency
  department_id: "", // Changed from department to department_id for API consistency
  sub_department_id: "", // Changed from section to sub_department_id for API consistency
  groups_ids: [],
  groups: [],
  history: "",
  redoubles: [],
  scholarships: "",
  branch: props.branches[0] ?? "",
  profile_picture: "",
  file: null,
  place_of_birth: "",
});

const form = ref(blank());

// Live preview for file or URL, with proper cleanup
const objectUrl = ref("");

const previewSrc = computed(() => {
  // 1. If user selected a new file, show the file preview
  if (form.value.file instanceof File && objectUrl.value) {
    return objectUrl.value;
  }
  
  // 2. If form has a base64 preview (from file reader), show that
  if (form.value.profile_picture && form.value.profile_picture.startsWith('data:')) {
    return form.value.profile_picture;
  }
  
  // 3. Otherwise, construct the backend URL like ViewStudentModal does
  const imageFile = form.value.profile_picture || props.student?.profile_picture || props.student?.photo_url || props.student?.user_detail?.profile_picture;
  
  if (imageFile) {
    // If it's already a full URL, return as is
    if (imageFile.startsWith('http')) {
      return imageFile;
    }
    // Otherwise, construct the full URL exactly like ViewStudentModal
    return `https://api.rtc-bb.camai.kh/storage/${imageFile}`;
  }
  
  return "";
});

// Recompute object URL whenever file changes
watch(() => form.value.file, (f) => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
  objectUrl.value = f instanceof File ? URL.createObjectURL(f) : "";
});

watch(
  () => form.value?.groups_ids,
  (ids) => {
    const map = new Map((allGroups.value || []).map(g => [String(g.id), g]));
    form.value.groups = (ids || [])
      .map(id => map.get(String(id)))
      .filter(Boolean)
      .map(g => ({ id: g.id, name: g.name }));
  }
);


// Revoke when component unmounts
onBeforeUnmount(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
});


// Use FilterByDepartment composables instead of individual ones
const {
  departments,
  departmentOptions,
  loading: departmentLoading
} = useFilteredByDepartment({ immediate: true });

const {
  selectedDepartmentId: selectedDepartmentIdForPrograms,
  filtered: programsFiltered,
  rawList: allPrograms,
  loading: programLoading,
  setDepartment: setProgramsDepartment
} = useProgramsFilteredByDepartment({ immediate: true });

const {
  selectedDepartmentId: selectedDepartmentIdForSections,
  filtered: sectionsFiltered,
  rawList: allSections,
  loading: sectionLoading,
  setDepartment: setSectionsDepartment
} = useSectionsFilteredByDepartment({ immediate: true });

// Watch for data loading - removed individual watchers since FilterByDepartment handles this
// watch(departments, (newDepts) => {
//   // Departments updated
// }, { immediate: true });

// watch(programs, (newPrograms) => {
//   // Programs updated
// }, { immediate: true });

// watch(subDepartments, (newSections) => {
//   // Sections updated
// }, { immediate: true });

// Computed properties for loading states and data availability
const isDataLoading = computed(() => {
  return departmentLoading.value || programLoading.value || sectionLoading.value;
});

const hasDataLoaded = computed(() => {
  return departments.value.length > 0 && allPrograms.value.length > 0 && allSections.value.length > 0;
});

// Computed properties for filtered data based on department selection
const departmentsList = computed(() => {
  return Array.isArray(departments.value) ? departments.value : [];
});

const programsList = computed(() => {
  // Show filtered programs if a department is selected, otherwise show all
  const currentDeptId = form.value.department_id;
  if (currentDeptId && currentDeptId !== "") {
    return programsFiltered.value;
  }
  return Array.isArray(allPrograms.value) ? allPrograms.value : [];
});

const sectionsList = computed(() => {
  // Show filtered sections if a department is selected, otherwise show all
  const currentDeptId = form.value.department_id;
  if (currentDeptId && currentDeptId !== "") {
    return sectionsFiltered.value;
  }
  return Array.isArray(allSections.value) ? allSections.value : [];
});

// Shape options for <select>/<BaseSelect>
const programSelectOptions = computed(() =>
  (programsList.value || []).map(p => ({
    value: String(p.id),
    label: p.program_name
  }))
)

const sectionSelectOptions = computed(() =>
  (sectionsList.value || []).map(s => ({
    value: String(s.id),
    label: s.sub_department_name || s.name
  }))
)


// Watch for department changes to update the filtered lists
watch(() => form.value.department_id, (newDeptId, oldDeptId) => {
  if (newDeptId === oldDeptId) return;

  setProgramsDepartment(newDeptId || '');
  setSectionsDepartment(newDeptId || '');

  // ✅ Safer clearing logic
  const pid = String(form.value.program_id ?? '');
  const sid = String(form.value.sub_department_id ?? '');

  if (pid && !programSelectOptions.value.some(o => String(o.value) === pid)) {
    form.value.program_id = '';
  }
  if (sid && !sectionSelectOptions.value.some(o => String(o.value) === sid)) {
    form.value.sub_department_id = '';
  }
});


watch(() => form.value.program_id, v => {
  if (v != null && v !== '') form.value.program_id = String(v);
});
watch(() => form.value.sub_department_id, v => {
  if (v != null && v !== '') form.value.sub_department_id = String(v);
});


// Load all data when component mounts - FilterByDepartment handles this automatically
// onMounted(async () => {
//   try {
//     await Promise.allSettled([
//       getAllDepartments().catch(err => {
//         console.error('Failed to load departments:', err);
//         return { success: false, error: err };
//       }),
//       getAllPrograms().catch(err => {
//         console.error('Failed to load programs:', err);
//         return { success: false, error: err };
//       }),
//       getAllSections().catch(err => {
//         console.error('Failed to load sections:', err);
//         return { success: false, error: err };
//       })
//     ]);
//   } catch (error) {
//     console.error('Failed to load data:', error);
//   }
// });

function toDateInputValue(v) {
  if (!v) return '';
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);

  const s = String(v).trim();

  // DD-MM-YYYY → YYYY-MM-DD
  let m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  // DD/MM/YYYY → YYYY-MM-DD
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;

  // YYYY-MM-DD (already correct)
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return s.slice(0, 10);

  // Last resort: try to parse and format
  const d = new Date(s);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}


/** hydrate form when opening / when student changes */
watch(
  () => props.student,
  (newVal) => {
    if (!newVal) return;

    const base = blank();
    const data = JSON.parse(JSON.stringify(props.student || {}));

    // Debug raw input
    console.log('🟡 Raw props.student:', props.student);
    console.log('🟡 Cloned data from props.student:', data);

    // ── Date of birth → YYYY-MM-DD (for <input type="date">)
    {
      const rawDob = data.user_detail?.date_of_birth ?? data.date_of_birth ?? '';
      const normalized = toDateInputValue(rawDob);
      console.log('📅 Edit DOB raw → normalized:', rawDob, '→', normalized);
      data.date_of_birth = normalized;
    }

    // ── Profile picture - DON'T modify the URL here, let previewSrc handle it
    // Just keep the original backend path
    if (data.profile_picture) {
      // Keep the original path from backend, don't modify it
      data.profile_picture = data.profile_picture;
    } else if (data.user_detail?.profile_picture) {
      data.profile_picture = data.user_detail.profile_picture;
    }

    // ── Normalize backend → form keys
    {
      // Active flag → boolean
      if (data.is_active !== undefined && data.active === undefined) {
        data.active = data.is_active === 1 || data.is_active === true || data.is_active === '1';
      }

      // Guardian
      if (!data.guardian_name && data.guardian) data.guardian_name = String(data.guardian);
      if (!data.guardian_phone) data.guardian_phone = '';

      // Addresses (corrected fallback)
      data.permanent_address = data.permanent_address ?? data.address ?? '';
      data.current_address   = data.current_address   ?? data.address ?? '';

      // Booleans
      const toBool = (v) => v === true || v === 1 || v === '1' || v === 'true';
      if (data.is_radie !== undefined) data.is_radie = toBool(data.is_radie);
      if (data.special  !== undefined) data.special  = toBool(data.special);

      // IDs to strings for <select>
      ['department_id', 'sub_department_id', 'program_id'].forEach((k) => {
        if (data[k] !== undefined && data[k] !== null) data[k] = String(data[k]);
      });

      // Ensure redoubles is an array
      if (!Array.isArray(data.redoubles)) {
        if (typeof data.redoubles === 'string' && data.redoubles.trim() !== '') {
          data.redoubles = data.redoubles.split(',').map((s) => s.trim());
        } else {
          data.redoubles = [];
        }
      }

      data.degree = data.degree ?? '';
      data.option = data.option ?? '';
    }

    // ── GROUPS: normalize [{id,name}] and build groups_ids (strings)
    {
      const rawGroups = Array.isArray(data.groups) ? data.groups : [];
      data.groups = rawGroups
        .filter(g => g && (g.id != null || g.group_id != null || g.name))
        .map(g => ({
          id: g.id ?? g.group_id ?? null,
          name: g.name ?? String(g.label ?? g.text ?? g.id ?? g.group_id ?? '').trim()
        }))
        .filter(g => g.id != null && g.name);

      data.groups_ids = data.groups.map(g => String(g.id));

      console.log('👥 groups from backend:', rawGroups);
      console.log('✅ normalized groups:', data.groups);
      console.log('✅ groups_ids (strings):', data.groups_ids);
    }

    // Debug after normalization
    console.log('🟢 Normalized data ready for form:', data);

    form.value = { ...base, ...data };

    // Keep filters in sync with the hydrated department
    const dept = form.value.department_id || '';
    setProgramsDepartment(dept);
    setSectionsDepartment(dept);


    // Final debug
    console.log('✅ Final form.value set in modal:', form.value);
    console.log('🖼️ Image data:', {
      profile_picture: form.value.profile_picture,
      computed_preview: previewSrc.value
    });
  },
  { immediate: true }
);

const emitSave = async () => {
  // Clear previous validation errors
  clearErrors();

  // 👇 add this helper so we can safely read the chosen file
  const selectedFile = computed(() =>
    form.value.file instanceof File ? form.value.file : null
  );


  // Clone current form
  const formData = { ...form.value };

  // 🔐 Ensure we have user_id and id
  formData.user_id =
    formData.user_id ??
    props.student?.user_id ??
    props.student?.id ??
    null;
  formData.id = formData.id ?? props.student?.id ?? null;

  if (!formData.user_id) {
    showNotification('Missing user_id for update. Please reload the student and try again.', 'error');
    return;
  }

  // Required fallbacks
  formData.name = formData.latin_name || formData.khmer_name || 'Unknown Student';
  formData.latin_name = formData.latin_name || '';
  formData.khmer_name = formData.khmer_name || '';
  formData.gender = formData.gender || '';
  formData.date_of_birth = formData.date_of_birth || '';
  formData.email = formData.email || '';
  formData.phone_number = formData.phone_number || '';
  formData.department_id = formData.department_id || '';
  formData.sub_department_id = formData.sub_department_id || '';
  formData.program_id = formData.program_id || '';
  formData.academic_year = formData.academic_year || '';
  formData.role_key = formData.role_key || 'Student';
  formData.id_prefix = formData.id_prefix || 'e';

  // Split latin_name into first/last
  if (formData.latin_name) {
    const parts = formData.latin_name.trim().split(' ');
    if (parts.length >= 2) {
      formData.last_name = parts[0];
      formData.first_name = parts.slice(1).join(' ');
    }
  }

  // ✅ Use reusable validation composable
  // Map form data to validation format (program_id -> program, sub_department_id -> section)
  const validationData = {
    latin_name: formData.latin_name,
    khmer_name: formData.khmer_name,
    email: formData.email,
    phone_number: formData.phone_number,
    gender: formData.gender,
    date_of_birth: formData.date_of_birth,
    department_id: formData.department_id,
    program: formData.program_id,
    section: formData.sub_department_id,
    program_id: formData.program_id,
    sub_department_id: formData.sub_department_id,
  };

  if (!validateStudent(validationData)) {
    console.log("❌ Edit validation failed:", { ...errors });
    showNotification('Please correct the validation errors and try again.', 'error');
    return;
  }

  // ---- Normalize image fields BEFORE emitting ----
  // Always send `file` when user picked a new one; never send profile_picture string
  if (selectedFile.value) {
    formData.file = selectedFile.value;
  } else {
    delete formData.file; // ensure no stale file field
  }
  delete formData.profile_picture; // never send the preview/base64/url


  console.log('💾 Edit save - form data before emit:', {
    user_id: formData.user_id,
    file: formData.file,
    // profile_picture: formData.profile_picture,
    profile_picture: undefined,
    hasFile: formData.file instanceof File,
    // hasProfilePicture: !!formData.profile_picture
    hasProfilePicture: false,
  });

  // Hand back to parent for actual API call
  emit('save', formData);
};


const emitPromote = () =>
  emit("promote", {
    user_id: form.value.user_id || props.student?.user_id || props.student?.id,
    id_card: form.value.id_card,
    promotion: form.value.promotion,
    academic_year: form.value.academic_year,
  });

/** Image preview */
const handleImageError = (event) => {
  console.error('Failed to load image:', previewSrc.value);
  event.target.style.display = 'none';
  // You could set a fallback image here if needed
};

const onPhotoChange = (e) => {
  const file = e.target.files?.[0];
  e.target.value = ""; // reset input so picking same file again still triggers change

  if (!file) return;
  
  console.log('📸 Edit modal - Photo change started:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });
  
  // Validate file type using a more specific check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showNotification('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
    return;
  }
  
  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    showNotification('Image size should be less than 2MB', 'error');
    e.target.value = '';
    return;
  }

  // Store the file for form submission
  form.value.file = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = () => {
    // Create an image element to verify the file is actually an image
    const img = new Image();
    img.onload = () => {
      // Store the preview URL
      form.value.profile_picture = reader.result;
      console.log('📸 Edit modal - Photo preview created successfully');
    };
    img.onerror = () => {
      showNotification('The selected file is not a valid image', 'error');
      e.target.value = '';
      form.value.file = null;
      form.value.profile_picture = '';
    };
    img.src = reader.result;
  };
  reader.onerror = () => {
    showNotification('Error reading file', 'error');
    e.target.value = '';
    form.value.file = null;
    form.value.profile_picture = '';
  };
  reader.readAsDataURL(file);
};

/** ESC to close */
const onEsc = (ev) => {
  if (ev.key === "Escape") close();
};
onMounted(() => window.addEventListener("keydown", onEsc));
onBeforeUnmount(() => window.removeEventListener("keydown", onEsc));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
