import React, { useMemo } from 'react';

// MODIFICATION: Added default values and comments for clarity.
const DataTable = ({ 
  data = [], 
  headers = [], 
  selectedFields = [], 
  sortConfig, 
  setSortConfig, 
  onEdit, 
  // These props are essential for correct row numbering.
  // They must be passed from the parent component (Leaderboard.jsx).
  currentPage = 1, 
  rowsPerPage = 5 
}) => {
  // Only show columns that are selected
  const visibleHeaders = headers.filter(header => selectedFields.includes(header));

  const isSortable = (field, sampleRow) => {
    if (!sampleRow) return false;
    const value = sampleRow[field];
    if (field.toLowerCase().includes("date")) return true;
    // We don't want to sort our dynamically generated SL No column
    if (field === "SL No") return false; 
    if (typeof value === "number") return true;
    return false;
  };

  const sortedData = useMemo(() => {
    if (!sortConfig?.field) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortConfig.field];
      const valB = b[sortConfig.field];

      if (valA == null) return 1;
      if (valB == null) return -1;

      const isDate = sortConfig.field.toLowerCase().includes("date");
      const aValue = isDate ? new Date(valA) : parseFloat(valA);
      const bValue = isDate ? new Date(valB) : parseFloat(valB);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const toggleSort = (field) => {
    const firstRow = data?.[0];
    if (!isSortable(field, firstRow)) return;

    if (typeof setSortConfig === "function") {
      setSortConfig((prev) => ({
        field,
        direction: prev?.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-CA");
  };

  return (
    <div className="table-wrapper overflow-x-auto my-4">
      <table className="min-w-full table-auto border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {visibleHeaders.map((h) => {
              const isColumnSortable = data.length > 0 && isSortable(h, data[0]);
              return (
                <th
                  key={h}
                  className={`border px-4 py-2 text-left text-sm font-semibold align-top ${
                    isColumnSortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => toggleSort(h)}
                >
                  {h}
                  {sortConfig?.field === h && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              );
            })}
            <th className="border px-4 py-2 text-left text-sm font-semibold align-top">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={visibleHeaders.length + 1} className="text-center py-4">
                No data found
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr key={row['SL No']} className="odd:bg-white even:bg-gray-50">
                {visibleHeaders.map((h) => (
                  <td
                    key={h}
                    className={
                      h.toLowerCase().includes("remark")
                        ? "remarks-column"
                        : `border px-4 py-2 text-sm ${
                            typeof row[h] === "number" || h === 'SL No' ? "text-right" : "text-left"
                          }`
                    }
                  >
                    {h === 'SL No'
                      // This calculation creates a sequential row number across all pages.
                      // It requires 'currentPage' and 'rowsPerPage' to be passed correctly from the parent component.
                      // If numbering resets on each page, please ensure you are passing these props from Leaderboard.jsx, for example:
                      // <DataTable currentPage={currentPage} rowsPerPage={rowsPerPage} ... />
                      ? (currentPage - 1) * rowsPerPage + index + 1
                      : typeof row[h] === "number"
                      ? row[h].toLocaleString()
                      : h.toLowerCase().includes("date")
                      ? formatDate(row[h])
                      : row[h] || "-"}
                  </td>
                ))}
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => onEdit(row)}
                    className="edit-button"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
