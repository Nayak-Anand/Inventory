// Export data to CSV
export const exportToCSV = (data, filename = 'export.csv', headers = null) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Ensure .csv extension
  const csvFilename = filename.replace(/\.[^.]+$/, '') + '.csv';

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  const getValue = (row, header) => {
    const v = row[header];
    return v !== undefined && v !== null ? v : '';
  };

  // Create CSV content (BOM helps Excel detect UTF-8)
  const csvRows = [
    csvHeaders.join(','),
    ...data.map((row) =>
      csvHeaders.map((header) => {
        const value = getValue(row, header);
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ),
  ];
  const csvContent = '\uFEFF' + csvRows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = csvFilename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
};

// Export data to Excel (CSV that Excel can open; for native .xlsx use a library like xlsx)
export const exportToExcel = (data, filename = 'export.xlsx', headers = null) => {
  const base = filename.replace(/\.[^.]+$/, '');
  exportToCSV(data, base + '.csv', headers);
};

// Format data for export
export const formatDataForExport = (data, columnMap = {}) => {
  return data.map((item) => {
    const formatted = {};
    Object.keys(columnMap).forEach((key) => {
      const value = item[key];
      formatted[columnMap[key] || key] = value !== null && value !== undefined ? value : '';
    });
    return formatted;
  });
};
