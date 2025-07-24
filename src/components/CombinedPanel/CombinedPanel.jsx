import React, { useState, useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';
import './CombinedPanel.css';
import Button from '../Button';
import api from '../../utils/api.js';

// --- HELPER FUNCTION ---
// This function takes a date string in dd-mm-yyyy format and returns yyyy-mm-dd
// It returns an empty string if the input is invalid.
const formatDateForAPI = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '';
  const parts = dateString.split(/[-/]/);
  if (parts.length !== 3 || parts[2]?.length !== 4) return ''; // Basic validation
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

const CombinedPanel = ({
  headers,
  fieldTypes,
  filterField,
  setFilterField,
  filterValue,
  setFilterValue,
  rangeValues,
  setRangeValues,
  dateRange,
  setDateRange,
  onApply,
  onClear,
  selectedFields,
  setSelectedFields,
  activeFilters,
  sortConfig,
  resetSort,
  setNotification,
  onLogout
}) => {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showFieldSelection, setShowFieldSelection] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [filterField]);

  const getFieldType = (field) => {
    if (!field || !fieldTypes) return 'text';
    if (fieldTypes.numeric?.includes(field)) return 'numeric';
    if (fieldTypes.date?.includes(field)) return 'date';
    return 'text';
  };

  const getCleanFilters = () => {
    const cleanFilters = {};
    for (const key in activeFilters) {
      if (activeFilters[key] !== "" && activeFilters[key] !== null) {
        // --- MODIFICATION FOR EXPORT ---
        // Convert date formats before sending them in the export request
        if (key === 'fromDate' || key === 'toDate') {
          const formattedDate = formatDateForAPI(activeFilters[key]);
          if (formattedDate) {
            cleanFilters[key] = formattedDate;
          }
        } else {
          cleanFilters[key] = activeFilters[key];
        }
      }
    }
    return cleanFilters;
  };

  const handleServerExport = async (format) => {
    setIsExporting(true);
    try {
      if (selectedFields.length === 0) {
        setNotification('Please select at least one column to export.', 'error');
        setIsExporting(false);
        return;
      }

      const finalFileNameForSave = fileName || "Contracts_Details";
      
      const cleanFilters = getCleanFilters(); // Use the modified function

      const params = new URLSearchParams({
        format,
        sortField: sortConfig?.field || '',
        sortDirection: sortConfig?.direction || '',
        selectedFields: selectedFields.join(','),
        ...cleanFilters, // Pass the cleaned and formatted filters
      });

      if (fileName) {
        params.append('fileName', fileName);
      }

      const response = await api.get(`/export?${params}`, {
        responseType: 'blob'
      });

      saveAs(response.data, `${finalFileNameForSave}.${format}`);
      setNotification('Export Successful!', 'info');

    } catch (error) {
      console.error("Export error:", error);
      if (error.response?.status === 401) {
        setNotification('Session expired. Please log in again.', 'error');
        if (typeof onLogout === 'function') {
          onLogout();
        }
      } else {
        const errorMessage = error.response?.data?.error || 'Export Failed. Please check the console.';
        setNotification(errorMessage, 'error');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    handleServerExport(exportFormat);
  };

  const renderInput = () => {
    if (!filterField) return <div className="input-placeholder"></div>;
    const fieldType = getFieldType(filterField);

    switch (fieldType) {
      case 'numeric':
        return (
          <div className="input-group">
            <input ref={inputRef} type="number" placeholder="From" value={rangeValues[0]} onChange={(e) => setRangeValues([e.target.value, rangeValues[1]])} className="filter-input"/>
            <input type="number" placeholder="To" value={rangeValues[1]} onChange={(e) => setRangeValues([rangeValues[0], e.target.value])} className="filter-input"/>
          </div>
        );
      case 'date':
        // --- MODIFICATION FOR DATE INPUT ---
        return (
          <div className="input-group">
            <input ref={inputRef} type="text" placeholder="dd-mm-yyyy" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="filter-input"/>
            <input type="text" placeholder="dd-mm-yyyy" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="filter-input"/>
          </div>
        );
      case 'text':
      default:
        return (<input ref={inputRef} type="text" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} placeholder={`Search in ${filterField}...`} className="filter-input text-search"/>);
    }
  };

  const handleFilterFieldChange = (e) => {
    setFilterField(e.target.value);
    setFilterValue("");
    setRangeValues(["", ""]);
    setDateRange({ from: "", to: "" });
  };

  const handleClear = () => {
    setFilterField("");
    setFilterValue("");
    setRangeValues(["", ""]);
    setDateRange({ from: "", to: "" });
    if (typeof onClear === 'function') onClear();
    if (typeof resetSort === 'function') resetSort();
  };

  const handleExportFieldChange = (field) => {
    setSelectedFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const toggleAllFields = () => {
    setSelectedFields(selectedFields.length === headers.length ? [] : headers);
  };

 return (
  <>
    <div className="panel-container">
      <div className="panel-row filter-panel">
        <div className="filter-controls-group">
          <select value={filterField} onChange={handleFilterFieldChange} className="filter-input field-selector">
            <option value="">Select Filter</option>
            {headers.map((h) => (<option key={h} value={h}>{h}</option>))}
          </select>

          {renderInput()}

          <div className="button-group">
            <Button variant="green" onClick={onApply} disabled={!filterField}>Apply</Button>
            <Button variant="danger" onClick={handleClear}>Clear</Button>
          </div>
        </div>
      </div>

      <div className="panel-row export-panel">
        <div className="export-controls-group">
          <div className="input-group filename-group">
            <label htmlFor="filename" className="input-label">File Name:</label>
            <input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="filter-input"
              placeholder="File Name (optional)"
            />
          </div>
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="filter-input format-selector">
            <option value="xlsx">Excel</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
          </select>
          <div className="button-group">
            <Button variant="blue" onClick={handleExport} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export"}
            </Button>
            <Button
              variant={showFieldSelection ? "danger" : "outline"}
              onClick={() => setShowFieldSelection(!showFieldSelection)}>
              {showFieldSelection ? "Hide" : "Columns"}
            </Button>
          </div>
        </div>
      </div>
    </div>

    {showFieldSelection && (
      <div className="field-selection-container">
        <div className="field-selection-header">
          <h3 className="field-selection-title">Select Columns</h3>
          <Button
            variant={selectedFields.length === headers.length ? "danger" : "green"}
            onClick={toggleAllFields}>
            {selectedFields.length === headers.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <div className="field-selection-table-container">
          <table className="field-selection-table">
            <tbody>
              {Array.from({ length: Math.ceil(headers.length / 5) }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.slice(rowIndex * 5, rowIndex * 5 + 5).map(field => (
                    <td key={field}>
                      <label className="field-checkbox">
                        <input type="checkbox" checked={selectedFields.includes(field)} onChange={() => handleExportFieldChange(field)}/>
                        {field}
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
 );
};

export default CombinedPanel;
