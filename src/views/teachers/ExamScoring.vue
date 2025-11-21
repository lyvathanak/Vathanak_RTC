<template>
  <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
      <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 4C16.1022 4 15.7206 4.15804 15.4393 4.43934C15.158 4.72064 15 5.10218 15 5.5V6.5H18V5.5C18 5.10218 17.842 4.72064 17.5607 4.43934C17.2794 4.15804 16.8978 4 16.5 4ZM18 7.5H15V15.75L16.5 18L18 15.75V7.5ZM0 2V17C0 17.3978 0.158035 17.7794 0.43934 18.0607C0.720644 18.342 1.10218 18.5 1.5 18.5H12.5C12.8978 18.5 13.2794 18.342 13.5607 18.0607C13.842 17.7794 14 17.3978 14 17V2C14 1.60218 13.842 1.22064 13.5607 0.93934C13.2794 0.658035 12.8978 0.5 12.5 0.5H1.5C1.10218 0.5 0.720644 0.658035 0.43934 0.93934C0.158035 1.22064 0 1.60218 0 2ZM7 5C7 4.86739 7.05268 4.74021 7.14645 4.64645C7.24021 4.55268 7.36739 4.5 7.5 4.5H11.5C11.6326 4.5 11.7598 4.55268 11.8536 4.64645C11.9473 4.74021 12 4.86739 12 5C12 5.13261 11.9473 5.25979 11.8536 5.35355C11.7598 5.44732 11.6326 5.5 11.5 5.5H7.5C7.36739 5.5 7.24021 5.44732 7.14645 5.35355C7.05268 5.25979 7 5.13261 7 5ZM7.5 6.5C7.36739 6.5 7.24021 6.55268 7.14645 6.64645C7.05268 6.74021 7 6.86739 7 7C7 7.13261 7.05268 7.25979 7.14645 7.35355C7.24021 7.44732 7.36739 7.5 7.5 7.5H11.5C11.6326 7.5 11.7598 7.44732 11.8536 7.35355C11.9473 7.25979 12 7.13261 12 7C12 6.86739 11.9473 6.74021 11.8536 6.64645C11.7598 6.55268 11.6326 6.5 11.5 6.5H7.5ZM7 11.5C7 11.3674 7.05268 11.2402 7.14645 11.1464C7.24021 11.0527 7.36739 11 7.5 11H11.5C11.6326 11 11.7598 11.0527 11.8536 11.1464C11.9473 11.2402 12 11.3674 12 11.5C12 11.6326 11.9473 11.7598 11.8536 11.8536C11.7598 11.9473 11.6326 12 11.5 12H7.5C7.36739 12 7.24021 11.9473 7.14645 11.8536C7.05268 11.7598 7 11.6326 7 11.5ZM7.5 13C7.36739 13 7.24021 13.0527 7.14645 13.1464C7.05268 13.2402 7 13.3674 7 13.5C7 13.6326 7.05268 13.7598 7.14645 13.8536C7.24021 13.9473 7.36739 14 7.5 14H11.5C11.6326 14 11.7598 13.9473 11.8536 13.8536C11.9473 13.7598 12 13.6326 12 13.5C12 13.3674 11.9473 13.2402 11.8536 13.1464C11.7598 13.0527 11.6326 13 11.5 13H7.5ZM3 11.5V13H4.5V11.5H3ZM2.5 10.5H5C5.13261 10.5 5.25979 10.5527 5.35355 10.6464C5.44732 10.7402 5.5 10.8674 5.5 11V13.5C5.5 13.6326 5.44732 13.7598 5.35355 13.8536C5.25979 13.9473 5.13261 14 5 14H2.5C2.36739 14 2.24021 13.9473 2.14645 13.8536C2.05268 13.7598 2 13.6326 2 13.5V11C2 10.8674 2.05268 10.7402 2.14645 10.6464C2.24021 10.5527 2.36739 10.5 2.5 10.5ZM5.8535 5.3535C5.94458 5.2592 5.99498 5.1329 5.99384 5.0018C5.9927 4.8707 5.94011 4.74529 5.84741 4.65259C5.75471 4.55989 5.6293 4.5073 5.4982 4.50616C5.3671 4.50502 5.2408 4.55542 5.1465 4.6465L3.5 6.293L2.8535 5.6465C2.7592 5.55542 2.6329 5.50502 2.5018 5.50616C2.3707 5.5073 2.24529 5.55989 2.15259 5.65259C2.05989 5.74529 2.0073 5.8707 2.00616 6.0018C2.00502 6.1329 2.05542 6.2592 2.1465 6.3535L3.5 7.707L5.8535 5.3535Z" fill="currentColor"/>
      </svg>
      Input Exam Score
    </h2>
    <div class="mb-4">
      <label class="block text-gray-700 font-bold">Choose a Subject</label>
      <select v-model="selectedSubject" class="w-auto p-2 border rounded-sm">
        <option v-for="subject in subjects" :key="subject" :value="subject">{{ subject }}</option>
      </select>
    </div>
    <div class="mb-4">
      <label class="block text-gray-700 font-bold">Group</label>
      <select v-model="selectedGroup" class="w-15px p-2 border rounded-sm" @change="loadStudents">
        <option v-for="group in groups" :key="group" :value="group">{{ group }}</option>
      </select>
    </div>
    <div v-if="selectedGroup">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-200 text-center border">
            <th class="p-2 border">ID</th>
            <th class="p-2 border">Latin Fullname</th>
            <th class="p-2 border">Gender</th>
            <th class="p-2 border">Score</th>
            <th class="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id" class="text-center border"> 
            <td class="p-2 border">{{ student.id }}</td>
            <td class="p-2 border">{{ student.name }}</td>
            <td class="p-2 border">{{ student.gender }}</td>
            <td class="p-2 border">{{ student.score }}</td>
            <td class="p-2 border">
              <button @click="showScoreInput(student)" class="text-blue-500 hover:text-blue-700">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                class="lucide size-4"
              >
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                <path d="m15 5 4 4"></path>
              </svg>
            </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <FillScore v-if="showModal" :student="currentStudent" :subject="selectedSubject" @close="showModal = false" @submit="submitScore" />
  </div>
</template>

<script>
import FillScore from '@/components/teachers/FillScore.vue';
import { showNotification } from '@/lib/notifications';

export default {
  components: {
    FillScore
  },
  data() {
    return {
      subjects: ['Calculus II', 'History', 'Math'],
      groups: ['Group 1', 'Group 2', 'Group 3'],
      selectedSubject: null,
      selectedGroup: null,
      students: [],
      showModal: false,
      currentStudent: null
    };
  },
  methods: {
    loadStudents() {
      const mockData = {
        'Group 1': [
          { id: '#101', name: 'John Smith', gender: 'M', score: null },
          { id: '#102', name: 'Emma Davis', gender: 'F', score: null },
          { id: '#103', name: 'Michael Brown', gender: 'M', score: null },
          { id: '#104', name: 'Sophia Wilson', gender: 'F', score: null },
          { id: '#105', name: 'James Johnson', gender: 'M', score: null }
        ],
        'Group 2': [
          { id: '#201', name: 'Oliver Taylor', gender: 'M', score: null },
          { id: '#202', name: 'Ava Martinez', gender: 'F', score: null },
          { id: '#203', name: 'William Lee', gender: 'M', score: null },
          { id: '#204', name: 'Isabella Clark', gender: 'F', score: null },
          { id: '#205', name: 'Lucas Wright', gender: 'M', score: null }
        ],
        'Group 3': [
          { id: '#301', name: 'Ethan Anderson', gender: 'M', score: null },
          { id: '#302', name: 'Mia Thompson', gender: 'F', score: null },
          { id: '#303', name: 'Alexander White', gender: 'M', score: null },
          { id: '#304', name: 'Charlotte King', gender: 'F', score: null },
          { id: '#305', name: 'Daniel Harris', gender: 'M', score: null }
        ]
      };

      try {
        this.students = mockData[this.selectedGroup] || [];
        if (this.students.length > 0) {
          showNotification(`Loaded ${this.students.length} students from ${this.selectedGroup}`, 'success');
        } else {
          showNotification('Please select a group', 'info');
        }
      } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Failed to load students', 'error');
        this.students = [];
      }
    },

    showScoreInput(student) {
      this.currentStudent = student;
      this.showModal = true;
    },

    submitScore(scores) {
      try {
        if (!this.currentStudent) return;

        // Validate scores
        const attendance = parseInt(scores.attendance);
        const midterm = parseInt(scores.midterm);
        const final = parseInt(scores.final);

        if (isNaN(attendance) || isNaN(midterm) || isNaN(final)) {
          showNotification('Invalid score values', 'error');
          return;
        }

        // Calculate total score
        const totalScore = (attendance * 0.1) + (midterm * 0.4) + (final * 0.5);
        
        // Update student score
        this.currentStudent.score = totalScore.toFixed(2);
        
        // Close modal and show success message
        this.showModal = false;
        showNotification(`Score updated successfully for ${this.currentStudent.name}`, 'success');

        // Save to mock API (replace with actual API call later)
        this.saveScore({
          studentId: this.currentStudent.id,
          subject: this.selectedSubject,
          group: this.selectedGroup,
          scores: {
            attendance,
            midterm,
            final,
            total: totalScore
          } 
        });

      } catch (error) {
        console.error('Error submitting score:', error);
        showNotification('Failed to submit score', 'error');
      }
    },

    async saveScore(scoreData) {
      // Mock API call - replace with actual API implementation
      console.log('Saving score:', scoreData);
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },

  watch: {
    selectedGroup(newGroup) {
      if (newGroup) {
        this.loadStudents();
      }
    },
    selectedSubject() {
      // Reset scores when subject changes
      this.students = this.students.map(student => ({
        ...student,
        score: null
      }));
    }
  },

  mounted() {
    this.loadStudents();
  }
};
</script>