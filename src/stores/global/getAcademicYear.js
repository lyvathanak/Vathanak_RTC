/**
 * API Service for fetching academic year based on program selection
 * This service chains three API calls:
 * 1. Get all programs
 * 2. Get generation by program ID
 * 3. Get academic year (filtered by generation start year)
 */

import api from '@/stores/apis/axios.js';

/**
 * Fetch all available programs
 * @returns {Promise<Array>} Array of program objects
 */
async function getAllPrograms() {
  try {
    const response = await api.get('/managements/get_all_program');
    return response.data.programs || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }
}

/**
 * Fetch generation data for a specific program
 * @param {number} programId - The ID of the program
 * @returns {Promise<Object>} Object containing program and generation data
 */
async function getGenerationByProgram(programId) {
  try {
    const response = await api.get(`/managements/get_generation_by_program/${programId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching generation data:', error);
    throw error;
  }
}

/**
 * Fetch all academic years
 * @returns {Promise<Array>} Array of academic year objects
 */
async function getAllAcademicYears() {
  try {
    const response = await api.get('/managements/get_academic_year');
    return response.data.academic_year || [];
  } catch (error) {
    console.error('Error fetching academic years:', error);
    throw error;
  }
}

/**
 * Parse dates field which can be either a JSON string or object
 * @param {string|Object} dates - The dates field from academic year
 * @returns {Object} Parsed dates object with start_year and end_year
 */
function parseDates(dates) {
  if (typeof dates === 'string') {
    try {
      return JSON.parse(dates);
    } catch (error) {
      console.error('Error parsing dates:', error);
      return null;
    }
  }
  return dates;
}

/**
 * Find matching academic year based on generation start year
 * @param {Array} academicYears - Array of academic year objects
 * @param {string|number} startYear - Start year from generation
 * @returns {Object|null} Matching academic year or null
 */
function findMatchingAcademicYear(academicYears, startYear) {
  const yearNum = parseInt(startYear);
  
  for (const academicYear of academicYears) {
    const dates = parseDates(academicYear.dates);
    if (dates) {
      const academicStartYear = parseInt(dates.start_year);
      if (academicStartYear === yearNum) {
        return {
          ...academicYear,
          dates: dates // Return parsed dates
        };
      }
    }
  }
  
  return null;
}

/**
 * Main function: Get academic year for a selected program
 * @param {number} programId - The ID of the selected program
 * @returns {Promise<Object>} Object containing program, generation, and academic year data
 */
async function getAcademicYearForProgram(programId) {
  try {
    // Step 1: Get generation data for the program
    const generationData = await getGenerationByProgram(programId);
    
    if (!generationData.generation || generationData.generation.length === 0) {
      throw new Error('No generation found for this program');
    }
    
    // Get the first (or most recent) generation
    const generation = generationData.generation[0];
    
    if (!generation.start_year) {
      throw new Error('Generation has no start year');
    }
    
    // Step 2: Get all academic years
    const academicYears = await getAllAcademicYears();
    
    // Step 3: Find matching academic year based on generation start year
    const matchingAcademicYear = findMatchingAcademicYear(
      academicYears,
      generation.start_year
    );
    
    if (!matchingAcademicYear) {
      throw new Error(
        `No academic year found for start year ${generation.start_year}`
      );
    }
    
    // Return complete data
    return {
      success: true,
      program: generationData.program,
      generation: generation,
      academicYear: matchingAcademicYear,
      message: 'Academic year automatically determined based on program generation'
    };
    
  } catch (error) {
    console.error('Error in getAcademicYearForProgram:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to get all data needed for program selection UI
 * @returns {Promise<Object>} Object containing all programs and academic years
 */
async function getInitialData() {
  try {
    const [programs, academicYears] = await Promise.all([
      getAllPrograms(),
      getAllAcademicYears()
    ]);
    
    return {
      success: true,
      programs: programs,
      academicYears: academicYears.map(ay => ({
        ...ay,
        dates: parseDates(ay.dates)
      }))
    };
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions
export {
  getAllPrograms,
  getGenerationByProgram,
  getAllAcademicYears,
  getAcademicYearForProgram,
  getInitialData,
  findMatchingAcademicYear,
  parseDates
};

// For CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getAllPrograms,
    getGenerationByProgram,
    getAllAcademicYears,
    getAcademicYearForProgram,
    getInitialData,
    findMatchingAcademicYear,
    parseDates
  };
}