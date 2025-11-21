<template>
  <div class="content p-6">
    <!-- Header Section -->
    <div class="header flex justify-between items-center mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by ID or Name"
        class="search-bar p-2 border rounded-lg w-1/4"
      />
      <div class="flex items-center">
        <button class="export-btn bg-orange-500 text-white px-4 py-2 rounded-lg">
          Export
        </button>
      </div>
    </div>

    <!-- Student Table Component -->
    <StudentTable
      :students="filteredStudents"
      :selected-ids="selectedStudents"
      :show-selection="true"
      :show-actions="true"
      :show-view-action="true"
      :show-edit-action="false"
      :show-delete-action="false"
      @view="viewProfile"
      @select="updateSelected"
      @selectAll="updateAllSelected"
      @sort="handleSort"
    />
  </div>
</template>

<script>
import StudentTable from '@/components/admins/StudentManagement/StudentTable.vue';

export default {
  name: 'StudentManagement',
  components: {
    StudentTable,
  },
  data() {
    return {
      searchQuery: '',
      selectedStudents: [],
      sortField: '',
      sortDirection: 'asc',
      students: [
        {
          id: '#10933',
          id_card: '#10933',
          khmer_name: 'Piseth',
          latin_name: 'ABA',
          date_of_birth: '12 Jan 2023',
          gender: 'M',
          department_id: 'rtc_001',
          sub_department_id: 'section_1time',
          grade: 'A',
          phone_number: '123-456-7890',
          email: 'piseth@example.com',
          academic_year: '2023-2024',
          program_id: 'prog_001',
        },
        {
          id: '#10934',
          id_card: '#10934',
          khmer_name: 'Dara',
          latin_name: 'CDD',
          date_of_birth: '4 Feb 2023',
          gender: 'M',
          department_id: 'rtc_001',
          sub_department_id: 'section_2time',
          grade: 'B',
          phone_number: '987-654-3210',
          email: 'dara@example.com',
          academic_year: '2023-2024',
          program_id: 'prog_002',
        },
        {
          id: '#10935',
          id_card: '#10935',
          khmer_name: 'Sok',
          latin_name: 'EEE',
          date_of_birth: '18 Mar 2023',
          gender: 'F',
          department_id: 'it_001',
          sub_department_id: 'section_3time',
          grade: 'A',
          phone_number: '555-123-4567',
          email: 'sok@example.com',
          academic_year: '2023-2024',
          program_id: 'prog_003',
        },
      ],
    };
  },
  computed: {
    filteredStudents() {
      return this.students
        .filter(
          (student) =>
            student.id_card.includes(this.searchQuery) ||
            student.khmer_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            student.latin_name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (!this.sortField) return 0;
          const valueA = a[this.sortField] || '';
          const valueB = b[this.sortField] || '';
          const direction = this.sortDirection === 'asc' ? 1 : -1;
          return valueA.toString().localeCompare(valueB.toString()) * direction;
        });
    },
  },
  methods: {
    viewProfile(id) {
      alert(`Viewing profile for ID: ${id}`);
      // TODO: Replace with router.push or modal open for profile view
    },
    updateSelected(selectedIds) {
      this.selectedStudents = selectedIds;
    },
    updateAllSelected(selectedIds) {
      this.selectedStudents = selectedIds;
    },
    handleSort({ field, direction }) {
      this.sortField = field;
      this.sortDirection = direction;
    },
  },
};
</script>

<style scoped>
.search-bar:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 5px rgba(249, 115, 22, 0.5);
}

.export-btn:hover {
  background-color: #e69500;
}
</style>