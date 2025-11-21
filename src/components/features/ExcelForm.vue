<template>
  <div class="excel-export-container">
    <button @click="exportToExcel" class="export-btn">
        Export
    </button>
  </div>
</template>

<script setup>
import { toRaw, computed } from 'vue'
import { useProgramsFilteredByDepartment, useSectionsFilteredByDepartment } from '@/stores/global/FilterByDepartment.js'
import { normalizeDateToYMD } from '@/stores/global/normalizedDate.js'

const props = defineProps({
  filteredRows: {
    type: Array,
    required: false,
    default: () => []
  },
  // Optional lookup maps: id -> display name
  programsMap: {
    type: Object,
    required: false,
    default: () => ({})
  },
  departmentsMap: {
    type: Object,
    required: false,
    default: () => ({})
  },
  sectionsMap: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

// Build lookup maps from FilterByDepartment composables and merge with props
const { rawList: programsList, departments } = useProgramsFilteredByDepartment({ immediate: true })
const { rawList: sectionsList } = useSectionsFilteredByDepartment({ immediate: true })

const programsMapMerged = computed(() => {
  const map = { ...toRaw(props.programsMap) }
  const list = toRaw(programsList.value) || []
  list.forEach(p => {
    if (p && p.id != null && !map[p.id]) {
      map[p.id] = p.program_name || p.name || ''
    }
  })
  return map
})

const departmentsMapMerged = computed(() => {
  const map = { ...toRaw(props.departmentsMap) }
  const list = toRaw(departments.value) || []
  list.forEach(d => {
    if (d && d.id != null && !map[d.id]) {
      map[d.id] = d.department_name || d.name || ''
    }
  })
  return map
})

const sectionsMapMerged = computed(() => {
  const map = { ...toRaw(props.sectionsMap) }
  const list = toRaw(sectionsList.value) || []
  list.forEach(s => {
    if (s && s.id != null && !map[s.id]) {
      map[s.id] = s.sub_department_name || s.name || ''
    }
  })
  return map
})

const exportToExcel = () => {
  // Define headers
  const header = [
    "ID",
    "Khmer name",
    "Latin name",
    "DOB",
    "Gender",
    "Program",
    "Department",
    "Section",
  ]

  // Helper to format dates to DD-MM-YYYY
  const pad = (n) => String(n).padStart(2, '0')
  
  const formatDate = (value) => {
    if (!value) return ''
    const s = String(value).trim()
    
    // First, try to normalize using the utility function
    const normalized = normalizeDateToYMD(value)
    if (normalized && /^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const [y, m, d] = normalized.split('-')
      return `${pad(d)}-${pad(m)}-${y}`
    }
    
    // Try YYYY-MM-DD format
    let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (match) {
      const [, y, m, d] = match
      return `${pad(d)}-${pad(m)}-${y}`
    }
    
    // Try DD-MM-YYYY or D-M-YYYY format (already correct, just pad)
    match = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
    if (match) {
      const [, d, m, y] = match
      return `${pad(d)}-${pad(m)}-${y}`
    }
    
    // Try D/M/YYYY or DD/MM/YYYY format
    match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (match) {
      const [, d, m, y] = match
      return `${pad(d)}-${pad(m)}-${y}`
    }
    
    // Try D/M/YY or DD/MM/YY format (2-digit year)
    match = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/)
    if (match) {
      const [, d, m, yy] = match
      const y = parseInt(yy) > 50 ? `19${yy}` : `20${yy}`
      return `${pad(d)}-${pad(m)}-${y}`
    }
    
    // Last resort: return original value
    return s
  }

  // Resolve display names using merged maps
  const getProgramDisplay = (r) => {
    return r?.program_name || programsMapMerged.value?.[r?.program_id] || r?.program_id || ''
  }
  const getDepartmentDisplay = (r) => {
    return r?.department_name || r?.department || departmentsMapMerged.value?.[r?.department_id] || r?.department_id || ''
  }
  const getSectionDisplay = (r) => {
    return r?.sub_department_name || r?.section_name || sectionsMapMerged.value?.[r?.sub_department_id] || r?.sub_department_id || r?.section || 'N/A'
  }

  // Map data rows
  const rowsData = (toRaw(props.filteredRows) || []).map((r) => [
    r?.id_card || r?.id || '',
    r?.khmer_name || r?.full_name_kh || '',
    r?.latin_name || r?.full_name_latin || '',
    formatDate(r?.date_of_birth || r?.dob || r?.DOB || ''),
    r?.gender || '',
    getProgramDisplay(r),
    getDepartmentDisplay(r),
    getSectionDisplay(r),
  ])

  // Generate HTML table for .xls export with borders and column widths
  const escapeHtml = (s) => {
    if (s === null || s === undefined) return ''
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // Compute column widths based on content
  const allRows = [header, ...rowsData]
  const colCount = header.length
  const maxLens = new Array(colCount).fill(0)
  
  allRows.forEach((r) => {
    for (let i = 0; i < colCount; i++) {
      const cell = r[i] == null ? '' : String(r[i])
      if (cell.length > maxLens[i]) maxLens[i] = cell.length
    }
  })

  // Convert to pixel widths (heuristic)
  const colWidths = maxLens.map(len => Math.min(Math.max(len * 8 + 40, 80), 400))

  const tableStyles = 'border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;'
  const thStyle = 'background:#f3f4f6;border:1px solid #999;padding:8px;text-align:left;font-weight:bold;'
  const tdStyle = 'border:1px solid #999;padding:8px;vertical-align:top;'

  const colgroup = `<colgroup>${colWidths.map(w => `<col style="width:${w}px">`).join('')}</colgroup>`
  const thead = '<thead><tr>' + header.map(h => `<th style="${thStyle}">${escapeHtml(h)}</th>`).join('') + '</tr></thead>'
  const tbody = rowsData.map(row => {
    return '<tr>' + row.map((c) => `<td style="${tdStyle}">${escapeHtml(c)}</td>`).join('') + '</tr>'
  }).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><table style="${tableStyles}">${colgroup}${thead}<tbody>${tbody}</tbody></table></body></html>`

  // Create blob and download as .xls (Excel will open HTML tables with formatting)
  const blob = new Blob(['\uFEFF', html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')
  a.download = `students_export_${ts}.xls`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.excel-export-container {
  display: inline-block;
}

.export-btn {
  background-color: #27ae60;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background-color: #229954;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.export-btn:active {
  transform: translateY(0);
}
</style>