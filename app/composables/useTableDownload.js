export function useTableDownload() {
  // Convert data to CSV format
  const convertToCSV = (data, columns) => {
    if (!data || data.length === 0) return ''

    // Get headers
    const headers = columns.map(col => col.label).join(',')

    // Get rows
    const rows = data.map(item => {
      return columns.map(col => {
        const value = getNestedValue(item, col.key)
        // Handle values that might contain commas or quotes
        const stringValue = value != null ? String(value) : ''
        // Escape quotes and wrap in quotes if contains comma or quote
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    })

    return [headers, ...rows].join('\n')
  }

  // Convert data to JSON format
  const convertToJSON = (data, columns) => {
    if (!data || data.length === 0) return '[]'

    // Create simplified objects with only the columns we want
    const simplifiedData = data.map(item => {
      const obj = {}
      columns.forEach(col => {
        obj[col.label] = getNestedValue(item, col.key)
      })
      return obj
    })

    return JSON.stringify(simplifiedData, null, 2)
  }

  // Convert data to TSV (Tab Separated Values) format
  const convertToTSV = (data, columns) => {
    if (!data || data.length === 0) return ''

    // Get headers
    const headers = columns.map(col => col.label).join('\t')

    // Get rows
    const rows = data.map(item => {
      return columns.map(col => {
        const value = getNestedValue(item, col.key)
        const stringValue = value != null ? String(value) : ''
        // Replace tabs and newlines
        return stringValue.replace(/[\t\n\r]/g, ' ')
      }).join('\t')
    })

    return [headers, ...rows].join('\n')
  }

  // Helper to get nested values from objects
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // Download file
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Main download function
  const downloadTable = (data, columns, tableName, format = 'csv') => {
    if (!data || data.length === 0) {
      console.warn('No data to download')
      return
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const baseFilename = `${tableName}_${timestamp}`

    let content, filename, mimeType

    switch (format) {
      case 'csv':
        content = convertToCSV(data, columns)
        filename = `${baseFilename}.csv`
        mimeType = 'text/csv;charset=utf-8;'
        break
      case 'json':
        content = convertToJSON(data, columns)
        filename = `${baseFilename}.json`
        mimeType = 'application/json'
        break
      case 'tsv':
        content = convertToTSV(data, columns)
        filename = `${baseFilename}.tsv`
        mimeType = 'text/tab-separated-values;charset=utf-8;'
        break
      default:
        console.error('Unsupported format:', format)
        return
    }

    downloadFile(content, filename, mimeType)
  }

  return {
    downloadTable
  }
}
