<template>
	<ListTable
		:data="enhancedGroups"
		:columns="columns"
		:loading="loading"
		:show-selection="false"
		:show-actions="true"
		:show-view-action="true"
		:show-edit-action="true"
		:show-delete-action="true"
		empty-state-title="No groups found"
		empty-state-message="There are no groups to display."
		loading-message="Loading groups..."
		@view="$emit('view', $event)"
		@edit="$emit('edit', $event)"
		@delete="$emit('delete', $event)"
	>
		<!-- Department name slot with loading state -->
		<template #column-department_name="{ value, row }">
			<span v-if="value !== 'N/A'" class="text-gray-900">{{ value }}</span>
			<span v-else class="text-gray-400 italic">{{ row.department || 'No department' }}</span>
		</template>
		
		<!-- Program name slot with loading state -->
		<template #column-program_name="{ value, row }">
			<span v-if="value !== 'N/A'" class="text-gray-900">{{ value }}</span>
			<span v-else class="text-gray-400 italic">{{ row.program || 'No program' }}</span>
		</template>
		
		<!-- Section name slot with loading state -->
		<template #column-section_name="{ value, row }">
			<span v-if="value !== 'N/A'" class="text-gray-900">{{ value }}</span>
			<span v-else class="text-gray-400 italic">{{ row.section || 'No section' }}</span>
		</template>
		
		<!-- Students count slot -->
		<template #column-students="{ row }">
			<div class="flex justify-center">
				<span class="text-gray-900 font-semibold text-lg">{{ getStudentCount(row) }}</span>
			</div>
		</template>
	</ListTable>
</template>

<script setup>
import ListTable from '@/components/features/ListTable.vue';
import { computed, onMounted } from 'vue';
import { useDepartment } from '@/stores/global/useDepartment.js';
import { useProgram } from '@/stores/global/useProgram.js';
import { useSection } from '@/stores/global/useSection.js';

const props = defineProps({
	groups: {
		type: Array,
		default: () => []
	},
	loading: {
		type: Boolean,
		default: false
	}
});

// Composables for dynamic data resolution
const { getDepartmentById, getAllDepartments } = useDepartment();
const { getProgramById, getAllPrograms } = useProgram();
const { getSectionById, getAllSections } = useSection();

// Load data when component mounts
onMounted(async () => {
	await Promise.all([
		getAllDepartments(),
		getAllPrograms(),
		getAllSections()
	]);
});

// Enhanced groups with resolved names
const enhancedGroups = computed(() => {
	return props.groups.map(group => {
		try {
			// Get dynamic names from IDs with multiple fallback strategies
			const department = getDepartmentById(group.department_id) || 
							 getDepartmentById(group.dept_id);
			const program = getProgramById(group.program_id) || 
						   getProgramById(group.programme_id);
			const section = getSectionById(group.section_id) || 
						   getSectionById(group.sub_department_id) ||
						   getSectionById(group.subdepartment_id);

			return {
				...group,
				// Use dynamic names if available, with comprehensive fallbacks
				department_name: department?.department_name || 
								group.department || 
								group.department_name || 
								'N/A',
				program_name: program?.program_name || 
							 program?.programme_name ||
							 group.program || 
							 group.program_name ||
							 group.programme ||
							 'N/A',
				section_name: section?.name || 
							 section?.section_name ||
							 section?.sub_department_name ||
							 group.section || 
							 group.section_name ||
							 group.sub_department ||
							 'N/A'
			};
		} catch (error) {
			console.warn('Error resolving group data:', error, group);
			// Return group with fallback values if resolution fails
			return {
				...group,
				department_name: group.department || group.department_name || 'N/A',
				program_name: group.program || group.program_name || 'N/A',
				section_name: group.section || group.section_name || 'N/A'
			};
		}
	});
});

const columns = [
	{ key: 'name', label: 'Group Name' },
	{ key: 'department_name', label: 'Department' },
	{ key: 'program_name', label: 'Program' },
	{ key: 'section_name', label: 'Section' },
	{ key: 'students', label: 'Students' },
];

// Helper function to get student count from different data structures
function getStudentCount(group) {
	// Try multiple data sources to get the most accurate count
	if (group.students && Array.isArray(group.students)) {
		return group.students.length;
	}
	if (group.student_ids && Array.isArray(group.student_ids)) {
		return group.student_ids.length;
	}
	// Fallback to explicit count field if available
	if (typeof group.student_count === 'number') {
		return group.student_count;
	}
	// Default to 0
	return 0;
}

function formatDate(dateString) {
	if (!dateString) return 'N/A';
	try {
		return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	} catch (e) {
		return dateString;
	}
}
</script>
