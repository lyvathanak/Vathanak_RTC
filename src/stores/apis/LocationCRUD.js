import api from './axios.js';

/**
 * Location Management CRUD Operations API
 */
const LocationCRUD = {
  // ==================== BUILDING CRUD ====================
  
  /**
   * Get all buildings
   */
  async getAllBuildings() {
    try {
      const response = await api.get('/locations/get_all_building');
      console.log('✅ Buildings fetched successfully:', response.data);
      return {
        success: true,
        data: response.data.buildings?.data || [],
        message: 'Buildings retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching buildings:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch buildings'
      };
    }
  },

  /**
   * Get building by ID
   */
  async getBuildingById(id) {
    try {
      console.log(`📍 Fetching building with ID: ${id}`);
      const response = await api.get(`/locations/buildings/${id}`);
      console.log('✅ Building fetched successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Building retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching building:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch building'
      };
    }
  },

  /**
   * Create new building
   */
  async createBuilding(buildingData) {
    try {
      console.log('📍 Creating new building:', buildingData);
      const response = await api.post('/locations/create_building', buildingData);
      console.log('✅ Building created successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Building created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating building:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to create building'
      };
    }
  },

  /**
   * Update building
   */
  async updateBuilding(id, buildingData) {
    try {
      console.log(`📍 Updating building ${id}:`, buildingData);
      const response = await api.put(`/locations/update_building/${id}`, buildingData);
      console.log('✅ Building updated successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Building updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating building:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update building'
      };
    }
  },

  /**
   * Delete building
   */
  async deleteBuilding(id) {
    try {
      console.log(`📍 Deleting building with ID: ${id}`);
      const response = await api.delete(`/locations/remove_building/${id}`);
      console.log('✅ Building deleted successfully');
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Building deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting building:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to delete building'
      };
    }
  },

  // ==================== LOCATION CRUD ====================

  /**
   * Get all locations
   */
  async getAllLocations() {
    try {
      console.log('📍 Fetching all locations...');
      const response = await api.get('/locations/get_all_locations');
      console.log('✅ Locations fetched successfully:', response.data);
      return {
        success: true,
        data: response.data.locations?.data || [],
        message: 'Locations retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching locations:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch locations'
      };
    }
  },

  /**
   * Get locations by building ID
   */
  async getLocationsByBuilding(buildingId) {
    try {
      console.log(`📍 Fetching locations for building: ${buildingId}`);
      const response = await api.get(`/locations/filter_rooms_by/${buildingId}/locations`);
      console.log('✅ Building locations fetched successfully:', response.data);
      return {
        success: true,
        data: response.data.Locations?.data || [],
        message: 'Building locations retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching building locations:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch building locations'
      };
    }
  },

  /**
   * Get location by ID
   */
  async getLocationById(id) {
    try {
      console.log(`📍 Fetching location with ID: ${id}`);
      const response = await api.get(`/locations/get_detail_location/${id}`);
      console.log('✅ Location fetched successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Location retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching location:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch location'
      };
    }
  },

  /**
   * Create new location
   */
  async createLocation(locationData) {
    try {
      console.log('📍 Creating new location:', locationData);
      const response = await api.post('/locations/create_new_room', locationData);
      console.log('✅ Location created successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Location created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating location:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to create location'
      };
    }
  },

  /**
   * Update location
   */
  async updateLocation(id, locationData) {
    try {
      console.log(`📍 Updating location ${id}:`, locationData);
      const response = await api.put(`/locations/update_room/${id}`, locationData);
      console.log('✅ Location updated successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Location updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating location:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to update location'
      };
    }
  },

  /**
   * Delete location
   */
  async deleteLocation(id) {
    try {
      console.log(`📍 Deleting location with ID: ${id}`);
      const response = await api.delete(`/locations/remove_room/${id}`);
      console.log('✅ Location deleted successfully');
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Location deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting location:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to delete location'
      };
    }
  },

  /**
   * Get location QR code (Updated for reload functionality)
   */
//   async getLocationQR(id) {
//     try {
//       console.log(`📍 Fetching QR code for location ${id}`);
//       const response = await api.get(`/locations/get_detail_location/${id}`, {
//         // Remove responseType: 'arraybuffer' - we want JSON response
//       });
//       console.log('✅ Location with QR code fetched successfully');
//       console.log('✅ QR code retrieved successfully',response.data.qr_code_url_online);
//       return {
//         success: true,
//         data: response.data.data || response.data,
//         qrUrl: response.data.qr_code_url_online || null,
//         message: 'QR code retrieved successfully'
//       };
//     } catch (error) {
//       console.error('❌ Error fetching QR code:', error);
//       return {
//         success: false,
//         data: null,
//         qrUrl: null,
//         message: error.response?.data?.message || 'Failed to fetch QR code'
//       };
//     }
//   },

//   /**
//    * Regenerate QR code for location
//    */
//   async regenerateLocationQR(id, format = 'png') {
//     try {
//       console.log(`📍 Regenerating QR code for location ${id} in ${format} format`);
//       const response = await api.post(`/attendance/re_generate_qr_code/${id}`, {
//         format: format
//       });
//       console.log('✅ QR code regenerated successfully');
//       return {
//         success: true,
//         data: response.data,
//         qrUrl: response.qr_code || response.data || null,
//         message: response.data.message || 'QR code regenerated successfully'
//       };
//     } catch (error) {
//       console.error('❌ Error regenerating QR code:', error);
//       return {
//         success: false,
//         data: null,
//         qrUrl: null,
//         message: error.response?.data?.message || 'Failed to regenerate QR code'
//       };
//     }
//   },

//   /**
//    * Download QR code as file
//    */
//   async downloadLocationQR(id, format = 'png') {
//     try {
//       console.log(`📍 Downloading QR code for location ${id} in ${format} format`);
//       const response = await api.get(`/attendance/re_generate_qr_code/${id}`, {
//         params: { format },
//         responseType: 'blob'
//       });
      
//       // Create download link
//       const blob = new Blob([response.data]);
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `location-${id}-qr.${format}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
      
//       console.log('✅ QR code downloaded successfully');
//       return {
//         success: true,
//         data: response.data,
//         message: 'QR code downloaded successfully'
//       };
//     } catch (error) {
//       console.error('❌ Error downloading QR code:', error);
//       return {
//         success: false,
//         data: null,
//         message: error.response?.data?.message || 'Failed to download QR code'
//       };
//     }
//   }

async getLocationQR(id) {
  try {
    const res = await api.get(`/locations/get_detail_location/${id}`);
    const payload = res.data || {};
    
    // Updated to match actual API response structure
    const qrUrl = payload.qr_code_url || null;
    const locationData = payload.location || payload.data || {};
    
    return {
      success: true,
      data: locationData,
      qrUrl,
      message: payload.message || 'QR code retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      qrUrl: null,
      message: error.response?.data?.message || 'Failed to fetch QR code'
    };
  }
},

async regenerateLocationQR(id, format = 'png') {
  try {
    const res = await api.post(`/attendance/re_generate_qr_code/${id}`, { format });
    const payload = res.data || {};
    // Same tolerant reading:
    const qrUrlOnline = payload.qr_code_url_online;
    const qrBase64 = payload.qr_code;
    const qrUrl = qrUrlOnline
      ? qrUrlOnline
      : (qrBase64 ? `data:image/${format};base64,${qrBase64}` : null);
        
    return {
      success: true,
      data: payload,
      qrUrl,
      message: payload.message || 'QR code regenerated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      data: null,
      qrUrl: null,
      message: error.response?.data?.message || 'Failed to regenerate QR code'
    };
  }
},

// Optional: keep a pure "fetch & download by URL" helper
async downloadByUrl(qrUrl, filename = 'qr.png') {
  try {
    const resp = await api.get(qrUrl, { responseType: 'blob' }); // works if same origin or CORS-allowed
    const blob = new Blob([resp.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return { success: true, message: 'QR code downloaded successfully' };
  } catch (e) {
    return { success: false, message: 'Failed to download QR from URL' };
  }
},
};

export default LocationCRUD;