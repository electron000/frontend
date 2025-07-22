import React from 'react';
import './DataTable.css';

const DataTable = ({
  data = [],
  headers = [],
  selectedFields = [],
  sortConfig,
  setSortConfig,
  onEdit,
  currentPage = 1,
  rowsPerPage = 10,
  fieldTypes = {}
}) => {

  const isSortable = (field) => {
    if (!fieldTypes || typeof fieldTypes !== 'object') return false;
    const sortableCategories = ['range', 'number', 'yearDropdown', 'date', 'yesNo'];
    for (const category of sortableCategories) {
      if (fieldTypes[category]?.includes(field)) {
        return true;
      }
    }
    return false;
  };

  const handleSort = (field) => {
    if (!isSortable(field)) return;

    if (typeof setSortConfig === "function") {
      const isAsc = sortConfig?.field === field && sortConfig.direction === 'asc';
      setSortConfig({ field, direction: isAsc ? 'desc' : 'asc' });
    }
  };

  const getSortIndicator = (field) => {
    if (sortConfig?.field === field) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const visibleHeaders = headers.filter(header => selectedFields.includes(header));

  const formatDate = (date) => {
    if (!date || date === 'nan') return "-";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("en-GB");
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="data-table-wrapper">
      <div className="table-scroll">
        <table className="custom-table">
          <thead>
            <tr>
              {visibleHeaders.map((header) => (
                <th
                  key={header}
                  className={isSortable(header) ? 'sortable-header' : ''}
                  onClick={() => handleSort(header)}
                >
                  {header}
                  {isSortable(header) && <span className="sort-indicator">{getSortIndicator(header)}</span>}
                </th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => {
                const rowKey = row.id || `row-${rowIndex}`;
                const dynamicSlNo = (currentPage - 1) * rowsPerPage + rowIndex + 1;

                return (
                  <tr key={rowKey} className={rowIndex % 2 === 0 ? 'even' : 'odd'}>
                    {visibleHeaders.map((header) => (
                      <td
                        key={`${rowKey}-${header}`}
                        className={
                          header.toLowerCase().includes("remark")
                            ? "remarks-column"
                            : ""
                        }
                      >
                        {header === "SL No"
                          ? dynamicSlNo
                          : header.toLowerCase().includes("date")
                          ? formatDate(row[header])
                          : row[header] || "-"}
                      </td>
                    ))}
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => onEdit(row, dynamicSlNo)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={visibleHeaders.length + 1} className="no-data">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;