<template>
  <div :class="['p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6', locale === 'kh' ? 'khmer-text' : 'font-sans']">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <Building class="w-5 h-5 sm:w-6 sm:h-6" />
          <h1
            :class="[
              'text-lg sm:text-xl md:text-2xl font-bold',
              locale === 'kh' ? 'khmer-text' : '',
            ]"
          >
            {{ t("building_management") }}
          </h1>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          @click="openAddBuildingModal"
          class="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#235AA6] text-white rounded-lg hover:bg-[#1E4A78] transition-colors text-sm"
        >
          <Plus class="w-4 h-4" />
          <span :class="[locale === 'kh' ? 'khmer-text' : '']">
            {{ t("add_building") }}
          </span>
        </button>
        <button
          @click="openAddLocationModal"
          class="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#235AA6] text-white rounded-lg hover:bg-[#1E4A78] transition-colors text-sm"
        >
          <Plus class="w-4 h-4" />
          <span :class="[locale === 'kh' ? 'khmer-text' : '']">
            {{ t("add_location") }}
          </span>
        </button>
      </div>
    </div>

    <!-- Buildings List -->
    <div class="space-y-3 sm:space-y-4">
      <div
        v-for="building in buildings"
        :key="building.id"
        class="border border-gray-200 rounded-lg bg-white overflow-hidden"
      >
        <!-- Building Header -->
        <div class="flex items-center justify-between p-3 sm:p-4 border-b">
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              @click="toggleBuilding(building.id)"
              class="p-1 hover:bg-gray-100 rounded flex-shrink-0"
            >
              <ChevronDown
                class="w-4 h-4 sm:w-5 sm:h-5 transition-transform"
                :class="{ 'rotate-180': !expandedBuildings[building.id] }"
              />
            </button>
            <h2
              :class="[
                'text-base sm:text-lg font-semibold truncate',
                locale === 'kh' ? 'khmer-text' : '',
              ]"
            >
              {{ building.name }}
            </h2>
          </div>
          
          <div class="flex gap-1 sm:gap-2 flex-shrink-0">
            <button
              @click="editBuilding(building)"
              class="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit Building"
            >
              <Pencil class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <button
                  class="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete Building"
                >
                  <Trash2 class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle
                    :class="[locale === 'kh' ? 'khmer-text' : '']"
                  >
                    {{ t("delete_building") }}
                  </AlertDialogTitle>
                  <AlertDialogDescription
                    :class="[locale === 'kh' ? 'khmer-text' : '']"
                  >
                    {{ t("delete_building_confirm", { name: building.name }) }}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    :class="[locale === 'kh' ? 'khmer-text' : '']"
                  >
                    {{ t("cancel") }}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    :class="[
                      'bg-red-600 hover:bg-red-700 text-white',
                      locale === 'kh' ? 'khmer-text' : '',
                    ]"
                    @click="deleteBuilding(building)"
                  >
                    {{ t("delete") }}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <!-- Building Content (Collapsible) -->
        <div v-show="expandedBuildings[building.id]" class="p-3 sm:p-4">
          <!-- Location Filter -->
          <div class="mb-3 sm:mb-4">
            <LocationFilter
              :floors="getFloorsForBuilding(building.id)"
              @update:filters="handleLocationFilters"
            />
          </div>

          <!-- Location Table -->
          <div class="overflow-x-auto">
            <LocationTable
              :locations="getFilteredLocations(building.id)"
              :loading="loading"
              @view="viewLocation"
              @edit="editLocation"
              @delete="deleteLocation"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!buildings.length && !loading" class="text-center py-8 sm:py-12 px-4">
      <Building class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
      <h3
        :class="[
          'text-base sm:text-lg font-medium text-gray-900 mb-2',
          locale === 'kh' ? 'khmer-text' : '',
        ]"
      >
        {{ t("no_buildings_found") }}
      </h3>
      <p
        class="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4"
        :class="[locale === 'kh' ? 'khmer-text' : '']"
      >
        {{ t("create_first_building") }}
      </p>
      
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8 sm:py-12">
      <div
        class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"
      ></div>
      <p :class="[locale === 'kh' ? 'khmer-text text-sm sm:text-base' : 'text-gray-500 text-sm sm:text-base']">
        {{ t("loading_buildings") }}
      </p>
    </div>

    <!-- Modals -->
    <UpdateBuildingModal
      v-model:open="buildingModalOpen"
      :mode="buildingModalMode"
      :initial="selectedBuilding"
      :submitting="submitting"
      :placeholder="t('enter_building_name')"
      @submit="handleBuildingSubmit"
    />

    <UpdateLocationModal
      v-model:open="locationModalOpen"
      :mode="locationModalMode"
      :initial="selectedLocation"
      :buildings="buildings"
      :submitting="submitting"
      @submit="handleLocationSubmit"
    />

    <ViewLocationModal
      v-model:open="viewModalOpen"
      :location="selectedLocation"
      :buildings="buildings"
    />
  </div>
</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
import { Building, Plus, ChevronDown, Pencil, Trash2 } from 'lucide-vue-next';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import LocationFilter from '@/components/admins/LocationManagement/LocationFilter.vue';
import LocationTable from '@/components/admins/LocationManagement/LocationTable.vue';
import UpdateBuildingModal from '@/components/admins/LocationManagement/UpdateBuildingModal.vue';
import UpdateLocationModal from '@/components/admins/LocationManagement/UpdateLocationModal.vue';
import ViewLocationModal from '@/components/admins/LocationManagement/ViewLocationModal.vue';
import LocationCRUD from '@/stores/apis/LocationCRUD.js';
import { showNotification } from '@/lib/notifications';

// State
const loading = ref(false);
const submitting = ref(false);
const buildings = ref([]);
const locations = ref([]);
const expandedBuildings = reactive({});

// Filters
const locationFilters = ref({ floor: 'All' });

// Modal states
const buildingModalOpen = ref(false);
const buildingModalMode = ref('create');
const selectedBuilding = ref({});

const locationModalOpen = ref(false);
const locationModalMode = ref('create');
const selectedLocation = ref({});

const viewModalOpen = ref(false);

// ==================== API METHODS ====================

/**
 * Load all buildings from API
 */
const loadBuildings = async () => {
  try {
    loading.value = true;
    const result = await LocationCRUD.getAllBuildings();
    
    if (result.success) {
      buildings.value = result.data;
      
      // Auto-expand first building
      if (buildings.value.length > 0) {
        buildings.value.forEach((building, index) => {
          expandedBuildings[building.id] = index === 1; // Building B expanded by default
        });
      }
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Error loading buildings:', error);
    showNotification('Failed to load buildings', 'error');
  } finally {
    loading.value = false;
  }
};

/**
 * Load all locations from API
 */
const loadLocations = async () => {
  try {
    const result = await LocationCRUD.getAllLocations();
    
    if (result.success) {
      locations.value = result.data;
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Error loading locations:', error);
    showNotification('Failed to load locations', 'error');
  }
};

/**
 * Initialize data on component mount
 */
const initializeData = async () => {
  await Promise.all([
    loadBuildings(),
    loadLocations()
  ]);
};

// ==================== BUILDING CRUD ====================

const openAddBuildingModal = () => {
  selectedBuilding.value = { name: '' };
  buildingModalMode.value = 'create';
  buildingModalOpen.value = true;
};

const editBuilding = (building) => {
  selectedBuilding.value = { ...building };
  buildingModalMode.value = 'edit';
  buildingModalOpen.value = true;
};

const deleteBuilding = async (building) => {
  try {
    submitting.value = true;
    const result = await LocationCRUD.deleteBuilding(building.id);
    
    if (result.success) {
      showNotification('Building deleted successfully', 'success');
      await loadBuildings(); // Reload buildings
      await loadLocations(); // Reload locations (removes associated locations)
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Error deleting building:', error);
    showNotification('Failed to delete building', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleBuildingSubmit = async ({ name, mode }) => {
  try {
    submitting.value = true;
    
    const buildingData = { name };
    let result;
    
    if (mode === 'create') {
      result = await LocationCRUD.createBuilding(buildingData);
    } else {
      result = await LocationCRUD.updateBuilding(selectedBuilding.value.id, buildingData);
    }
    
    if (result.success) {
      showNotification(result.message, 'success');
      buildingModalOpen.value = false;
      await loadBuildings(); // Reload buildings
      
      // Auto-expand new building
      if (mode === 'create' && result.data?.id) {
        expandedBuildings[result.data.id] = true;
      }
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Error saving building:', error);
    showNotification('Failed to save building', 'error');
  } finally {
    submitting.value = false;
  }
};

// ==================== LOCATION CRUD ====================

const openAddLocationModal = () => {
  selectedLocation.value = {
    name: '',
    floor: null,
    latitude: null,
    longitude: null,
    building_id: ''
  };
  locationModalMode.value = 'create';
  locationModalOpen.value = true;
};

const viewLocation = (location) => {
  selectedLocation.value = location;
  viewModalOpen.value = true;
};

const editLocation = (location) => {
  selectedLocation.value = { ...location };
  locationModalMode.value = 'edit';
  locationModalOpen.value = true;
};

const deleteLocation = async (location) => {
  try {
    submitting.value = true;
    const result = await LocationCRUD.deleteLocation(location.id);
    
    if (result.success) {
      showNotification('Location deleted successfully', 'success');
      await loadLocations(); // Reload locations
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Error deleting location:', error);
    showNotification('Failed to delete location', 'error');
  } finally {
    submitting.value = false;
  }
};

const handleLocationSubmit = async ({ mode, payload }) => {
  try {
    submitting.value = true;
    
    let result;
    
    if (mode === 'create') {
      result = await LocationCRUD.createLocation(payload);
    } else {
      result = await LocationCRUD.updateLocation(selectedLocation.value.id, payload);
    }
    
    if (result.success) {
      showNotification(result.message, 'success');
      locationModalOpen.value = false;
      await loadLocations(); // Reload locations
    } else {
      showNotification(result.message, 'error');
    }
  } catch (error) {
    console.error('Error saving location:', error);
    showNotification('Failed to save location', 'error');
  } finally {
    submitting.value = false;
  }
};

// ==================== COMPUTED & METHODS ====================

const toggleBuilding = (buildingId) => {
  expandedBuildings[buildingId] = !expandedBuildings[buildingId];
};

const handleLocationFilters = (filters) => {
  locationFilters.value = filters;
};

const getFloorsForBuilding = (buildingId) => {
  const buildingLocations = locations.value.filter(loc => loc.building_id === buildingId);
  const floors = [...new Set(buildingLocations.map(loc => loc.floor))];
  return floors.sort();
};

const getFilteredLocations = (buildingId) => {
  let buildingLocations = locations.value.filter(loc => loc.building_id === buildingId);
  
  if (locationFilters.value.floor !== 'All') {
    buildingLocations = buildingLocations.filter(loc => loc.floor === locationFilters.value.floor);
  }
  
  return buildingLocations;
};

// Initialize on mount
onMounted(() => {
  initializeData();
});
</script>