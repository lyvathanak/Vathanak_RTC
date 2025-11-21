<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
    <div class="w-full max-w-5xl bg-gray-200 rounded-2xl p-7 shadow-lg">
      <!-- Header -->
      <div class="flex gap-5 items-center mb-2.5">
        <img :src="profile.photo" alt="avatar" class="w-30 h-30 rounded-full object-cover border-6 border-white shadow-lg" />
        <div>
          <h1 class="m-0 text-2xl font-bold text-gray-900">{{ profile.name }}</h1>
          <p class="mt-1.5 text-gray-600">{{ profile.role }}</p>
        </div>
      </div>

      <!-- Content -->
      <div class="grid grid-cols-2 gap-10 mt-3.5">
        <!-- Personal Info -->
        <section>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">Personal Information</h2>
          <div class="space-y-3.5">
            <div class="space-y-1.5">
              <label class="text-xs text-gray-500 tracking-wide">FULL NAME</label>
              <div class="bg-white rounded-full py-2.5 px-4 shadow-sm text-gray-900">{{ profile.fullName }}</div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs text-gray-500 tracking-wide">ID</label>
              <div class="bg-white rounded-full py-2.5 px-4 shadow-sm text-gray-900">{{ profile.id }}</div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs text-gray-500 tracking-wide">DATE OF BIRTH</label>
              <div class="bg-white rounded-full py-2.5 px-4 shadow-sm text-gray-900">{{ profile.dob }}</div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs text-gray-500 tracking-wide">GENDER</label>
              <div class="bg-white rounded-full py-2.5 px-4 shadow-sm text-gray-900">{{ profile.gender }}</div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs text-gray-500 tracking-wide">ADDRESS</label>
              <div class="bg-white rounded-full py-2.5 px-4 shadow-sm text-gray-900">{{ profile.address }}</div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs text-gray-500 tracking-wide">EMAIL ADDRESS</label>
              <div class="bg-white rounded-full py-2.5 px-4 shadow-sm text-gray-900">{{ profile.email }}</div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs text-gray-500 tracking-wide">TELEPHONE</label>
              <div class="bg-white rounded-full py-2.5 px-4 shadow-sm text-gray-900">{{ profile.phone }}</div>
            </div>
          </div>
        </section>

        <!-- Academic Info -->
        <section>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">Academic Information</h2>

          <!-- Header row -->
          <div class="grid grid-cols-[72%_28%] px-1.5 mb-2">
            <label class="text-xs font-semibold text-gray-600">SUBJECT</label>
            <label class="text-xs font-semibold text-gray-600">EXPERIENCE</label> 
          </div>

          <div class="space-y-3">
            <div
              class="flex justify-between items-center gap-3"
              v-for="(s, idx) in subjects"
              :key="idx"
            >
              <div class="flex-1 max-w-[65%] bg-white rounded-full py-2.5 px-4">{{ s.subject }}</div>
              <div class="w-[140px] text-center bg-white rounded-full py-2.5 px-4">{{ s.experience }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TeacherProfile",
  data() {
    return {
      profile: {
        photo: "https://i.pravatar.cc/300?img=5",
        name: "John Doooooooooooe",
        role: "Medical • 2nd Year Student",
        fullName: "John Doe",
        id: "e20211111",
        dob: "20-July-2005",
        gender: "Male",
        address: "St 123, N0 50Z",
        email: "JohnDonut@gmail.com",
        phone: "+855 123-456-789"
      },
      subjects: [
        { subject: "Physics", experience: "2 years" },
        { subject: "Maths", experience: "2 years" },
        { subject: "Geography", experience: "2 years" },
        { subject: "Biology", experience: "2 years" },
        { subject: "History", experience: "2 years" },
        { subject: "Chemistry", experience: "2 years" },
        { subject: "English", experience: "2 years" }
      ]
    };
  }
};
</script>


