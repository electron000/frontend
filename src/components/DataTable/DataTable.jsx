import React from 'react';
import './DataTable.css';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.48,0.41L9.2,5.35C8.61,5.59,8.08,5.92,7.58,6.29L5.19,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.69,8.87 C2.58,9.08,2.63,9.34,2.81,9.48l2.03,1.58C4.82,11.36,4.8,11.68,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17-0.48,0.41l0.36-2.54c0.59-0.24,1.12-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
    </svg>
);

const DeleteIcon = ({ onClick }) => (
    <button onClick={onClick} className="delete-icon-btn" title="Delete Row">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
    </button>
);

const DataTable = ({
  data = [],
  headers = [],
  selectedFields = [],
  sortConfig,
  setSortConfig,
  onEdit,
  onDelete,
  onEditSchema,
  fieldTypes = { numeric: [], date: [], text: [] },
}) => {

  const isSortable = (field) => {
    if (!fieldTypes || typeof fieldTypes !== 'object') return false;
    if (field === 'SL No') return true;
    return fieldTypes.numeric?.includes(field) || fieldTypes.date?.includes(field);
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
    if (!date || date === 'nan' || date.trim() === '') return "-";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "-";
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`; // Changed format here
    } catch (e) {
      console.error("Error formatting date:", date, e);
      return "-";
    }
  };

  const getColumnClassName = (header) => {
    return `col-${header.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')}`;
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
                  className={`${isSortable(header) ? 'sortable-header' : ''} ${header === 'SL No' ? getColumnClassName(header) : 'common-column-width'}`}
                  onClick={() => handleSort(header)}
                >
                  {header}
                  {isSortable(header) && <span className="sort-indicator">{getSortIndicator(header)}</span>}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="action-header">
                    {onEditSchema ? (
                        <button onClick={onEditSchema} className="action-header-button" title="Edit Table Columns">
                            <span>ACTION</span>
                            <SettingsIcon />
                        </button>
                    ) : (
                        <span>ACTION</span>
                    )}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => {
                const rowKey = row.id || `row-${rowIndex}`;

                return (
                  <tr key={rowKey} className={`${rowIndex % 2 === 0 ? 'even' : 'odd'}`}>
                    {visibleHeaders.map((header) => (
                      <td
                        key={`${rowKey}-${header}`}
                        className={header === 'SL No' ? getColumnClassName(header) : 'common-column-width'}
                      >
                        {fieldTypes.date?.includes(header)
                          ? formatDate(row[header])
                          : row[header] || "-"}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="action-cell">
                        {onEdit && (
                            <button
                              className="edit-button"
                              onClick={() => onEdit(row)}>
                              Edit
                            </button>
                        )}
                        {onDelete && <DeleteIcon onClick={() => onDelete(row)} />}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={(onEdit || onDelete) ? visibleHeaders.length + 1 : visibleHeaders.length} className="no-data">
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
