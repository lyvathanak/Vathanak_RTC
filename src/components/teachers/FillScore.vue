<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/40">
    <div class="bg-white p-6 rounded shadow-lg w-1/3">
      <h2 class="text-xl font-bold mb-4">Fill in Score</h2>
      <p class="mb-2">Subject name: {{ subject }}</p>
      <div class="mb-4">
        <p class="mb-2">Attendance: 10%</p>
        <input v-model="scoreInput.attendance" class="w-full p-2 border rounded" placeholder="Fill in score(1-100)">
      </div>
      <div class="mb-4">
        <p class="mb-2">Mid-term: 40%</p>
        <input v-model="scoreInput.midterm" class="w-full p-2 border rounded" placeholder="Fill in score(1-100)">
      </div>
      <div class="mb-4">
        <p class="mb-2">Final: 50%</p>
        <input v-model="scoreInput.final" class="w-full p-2 border rounded" placeholder="Fill in score(1-100)">
      </div>
      <button @click="submitScore" class="bg-blue-500 text-white p-2 rounded">Submit</button>
      <button @click="$emit('close')" class="ml-2 text-gray-700 p-2 border rounded">Cancel</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    student: Object,
    subject: String
  },
  data() {
    return {
      scoreInput: { attendance: '', midterm: '', final: '' }
    };
  },
  methods: {
    submitScore() {
      this.$emit('submit', this.scoreInput);
    }
  }
};
</script>