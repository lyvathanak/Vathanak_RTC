// stores/Student/Overview.js
import api from '@/stores/apis/axios'

// Existing attendance function
export async function getAttendanceOverview() {
  try {
    const response = await api.get('/attendance/get_attendances')
    const records = response.data.attendance.data
    let onTime = 0
    let late = 0
    let absence = 0
    records.forEach(r => {
      if (r.status === 'OnTime' || r.status === 'Present') onTime++
      if (r.status === 'Late') late++
      if (r.status === 'Absent') absence++
    })
    // Total present = OnTime + Late
    const present = onTime + late + absence
    return { present, onTime, late, absence }
  } catch (error) {
    console.error('Error fetching attendance overview:', error)
    throw error
  }
}

// Timetable fetching function (fetches all user slots; week param ignored for now)
export async function getTimetableOverview(week) {
  try {
    const response = await api.get('/time_table/get_time_slots_user')
    // Adjust extraction based on your exact response structure (e.g., response.data.data or response.data.time_slots)
    const entries = response.data.data || response.data.time_slots || response.data || []
    console.log('Fetched timetable entries:', entries.length) // Debug log
    return entries
  } catch (error) {
    console.error('Error fetching timetable overview:', error)
    throw error
  }
}