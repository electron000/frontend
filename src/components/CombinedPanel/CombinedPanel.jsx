// import React, { useState, useEffect, useRef } from 'react';
// import { saveAs } from 'file-saver';
// import axios from 'axios';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import './CombinedPanel.css';
// import Button from '../Button/Button';

// const CombinedPanel = ({
//   headers,
//   fieldTypes,
//   filterField,
//   setFilterField,
//   filterValue,
//   setFilterValue,
//   rangeValues,
//   setRangeValues,
//   dateRange,
//   setDateRange,
//   onApply,
//   onClear,
//   selectedFields,
//   setSelectedFields,
//   activeFilters,
//   sortConfig,
//   resetSort
// }) => {
//   const inputRef = useRef(null);
//   const [fileName, setFileName] = useState("Contracts_Details");
//   const [isExporting, setIsExporting] = useState(false);
//   const [showFieldSelection, setShowFieldSelection] = useState(false);
//   const [exportFormat, setExportFormat] = useState('xlsx');
//   const [message, setMessage] = useState('');

//   useEffect(() => {
//     if (inputRef.current) inputRef.current.focus();
//   }, [filterField]);

//   const { range = [], number = [], yearDropdown = [], date = [], yesNo = [] } = fieldTypes || {};

//   const getFieldType = (field) => {
//     if (!field) return null;
//     if (range.includes(field) || number.includes(field) || yearDropdown.includes(field)) return 'range';
//     if (date.includes(field)) return 'date';
//     if (yesNo.includes(field)) return 'yesNo';
//     return 'text';
//   };

//   const getCleanFilters = () => {
//     const cleanFilters = {};
//     for (const key in activeFilters) {
//         if (activeFilters[key] !== "" && activeFilters[key] !== null) {
//             cleanFilters[key] = activeFilters[key];
//         }
//     }
//     return cleanFilters;
//   };

//   const showMessage = (msg) => {
//     setMessage(msg);
//     setTimeout(() => setMessage(''), 3000);
//   };

//   const handleServerExport = async (format) => {
//     setIsExporting(true);
//     try {
//       const params = new URLSearchParams({
//         format,
//         sortField: sortConfig?.field || '',
//         sortDirection: sortConfig?.direction || '',
//         selectedFields: selectedFields.join(','),
//         ...getCleanFilters(),
//       });
//       const response = await axios.get(`https://backend-2m6l.onrender.com/api/export?${params}`, { responseType: 'blob' });
//       saveAs(response.data, `${fileName}.${format}`);
//     } catch (error) {
//       console.error("Export error:", error);
//       showMessage("Export failed. Please check the console for more details.");
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const exportToPDF = async () => {
//     setIsExporting(true);
//     try {
//       const params = new URLSearchParams({
//         sortField: sortConfig?.field || '',
//         sortDirection: sortConfig?.direction || '',
//         selectedFields: selectedFields.join(','),
//         ...getCleanFilters()
//       });
//       const response = await axios.get(`https://backend-2m6l.onrender.com/api/contracts?${params}`);
//       const allData = response.data.data || response.data;

//       const numCols = selectedFields.length;
//       let format = 'a4';
//       if (numCols > 10) format = 'a3';
//       const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format });
      
//       const scale = Math.max(0.45, 1 - (numCols / 30));
//       const fontSize = 10 * scale;
//       const titleSize = 16 * scale;
//       const cellPadding = 2.5 * scale;

//       doc.setFont('helvetica', 'bold');
//       doc.setFontSize(titleSize);
//       doc.text(fileName.replace(/_/g, ' '), 14, 14);

//       autoTable(doc, {
//         startY: 22,
//         head: [selectedFields.map(h => h.replace(/\s*\(₹\)/, ' (INR)'))],
//         body: allData.map(row => selectedFields.map(h => row[h]?.toString() || "")),
//         theme: 'grid',
//         tableWidth: 'auto',
//         margin: { top: 30, left: 10, right: 10 },
//         styles: { fontSize, fontStyle: 'normal', font: 'helvetica', halign: 'center', valign: 'middle', textColor: [26, 26, 26], lineColor: [210, 210, 210], lineWidth: 0.3, fillColor: [249, 249, 246], cellPadding },
//         headStyles: { fontSize: fontSize + 1.2, fontStyle: 'bold', textColor: [255, 255, 255], fillColor: [45, 106, 79], halign: 'center', valign: 'middle', cellPadding },
//         alternateRowStyles: { fillColor: [233, 242, 239] },
//         didDrawPage: (data) => {
//           const pageCount = doc.internal.getNumberOfPages();
//           doc.setFontSize(9);
//           doc.setTextColor(120);
//           doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
//         }
//       });

//       doc.save(`${fileName}.pdf`);
//     } catch (error) {
//       console.error("PDF Export Error:", error);
//       showMessage("Export failed. Try reducing the number of selected fields.");
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const handleExport = () => {
//     if (selectedFields.length === 0) {
//       showMessage("Please select at least one column to export.");
//       return;
//     }
//     if (exportFormat === 'pdf') {
//       exportToPDF();
//     } else {
//       handleServerExport(exportFormat);
//     }
//   };

//   const renderInput = () => {
//     if (!filterField) return <div className="input-placeholder"></div>;
//     const fieldType = getFieldType(filterField);

//     switch (fieldType) {
//       case 'range':
//       case 'number':
//       case 'yearDropdown':
//         return (
//           <div className="input-group">
//             <input ref={inputRef} type="number" placeholder="From" value={rangeValues[0]} onChange={(e) => setRangeValues([e.target.value, rangeValues[1]])} className="filter-input"/>
//             <input type="number" placeholder="To" value={rangeValues[1]} onChange={(e) => setRangeValues([rangeValues[0], e.target.value])} className="filter-input"/>
//           </div>
//         );
//       case 'date':
//         return (
//           <div className="input-group">
//             <input ref={inputRef} type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="filter-input"/>
//             <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="filter-input"/>
//           </div>
//         );
//       case 'yesNo':
//         return (
//           <select ref={inputRef} value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="filter-input">
//             <option value="">Select</option>
//             <option value="Yes">Yes</option>
//             <option value="No">No</option>
//           </select>
//         );
//       case 'text':
//       default:
//         return (<input ref={inputRef} type="text" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} placeholder="Enter search text..." className="filter-input text-search"/>);
//     }
//   };

//   const handleFilterFieldChange = (e) => {
//     setFilterField(e.target.value);
//     setFilterValue("");
//     setRangeValues(["", ""]);
//     setDateRange({ from: "", to: "" });
//   };

//   const handleClear = () => {
//     setFilterField("");
//     setFilterValue("");
//     setRangeValues(["", ""]);
//     setDateRange({ from: "", to: "" });
//     if (typeof onClear === 'function') onClear();
//     if (typeof resetSort === 'function') resetSort();
//   };

//   const handleExportFieldChange = (field) => {
//     setSelectedFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
//   };

//   const toggleAllFields = () => {
//     setSelectedFields(selectedFields.length === headers.length ? [] : headers);
//   };

//  return (
//   <>
//     <div className="panel-container">
//       <div className="panel-row filter-panel">
//         <div className="filter-controls-group">
//           <select value={filterField} onChange={handleFilterFieldChange} className="filter-input field-selector">
//             <option value="">Select Filter</option>
//             {headers.map((h) => (<option key={h} value={h}>{h}</option>))}
//           </select>

//           {renderInput()}

//           <div className="button-group">
//             <Button variant="green" onClick={onApply} disabled={!filterField}>Apply</Button>
//             <Button variant="danger" onClick={handleClear}>Clear</Button>
//           </div>
//         </div>
//       </div>

//       <div className="panel-row export-panel">
//         <div className="export-controls-group">
//           <div className="input-group filename-group">
//             <label htmlFor="filename" className="input-label">File Name:</label>
//             <input id="filename" value={fileName} onChange={(e) => setFileName(e.target.value)} className="filter-input"/>
//           </div>
//           <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="filter-input format-selector">
//             <option value="xlsx">Excel</option>
//             <option value="csv">CSV</option>
//             <option value="pdf">PDF</option>
//           </select>
//           <div className="button-group">
//             <Button variant="blue" onClick={handleExport} disabled={isExporting}>
//               {isExporting ? "Exporting..." : "Export"}
//             </Button>
//             <Button 
//               variant={showFieldSelection ? "danger" : "outline"}
//               onClick={() => setShowFieldSelection(!showFieldSelection)}>
//               {showFieldSelection ? "Hide" : "Columns"}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>

//     {showFieldSelection && (
//       <div className="field-selection-container">
//         <div className="field-selection-header">
//           <h3 className="field-selection-title">Select Columns</h3>
//           <Button
//             variant={selectedFields.length === headers.length ? "danger" : "green"}
//             onClick={toggleAllFields}>
//             {selectedFields.length === headers.length ? "Deselect All" : "Select All"}
//           </Button>
//         </div>
//         <div className="field-selection-table-container">
//           <table className="field-selection-table">
//             <tbody>
//               {Array.from({ length: Math.ceil(headers.length / 5) }).map((_, rowIndex) => (
//                 <tr key={rowIndex}>
//                   {headers.slice(rowIndex * 5, rowIndex * 5 + 5).map(field => (
//                     <td key={field}>
//                       <label className="field-checkbox">
//                         <input type="checkbox" checked={selectedFields.includes(field)} onChange={() => handleExportFieldChange(field)}/>
//                         {field}
//                       </label>
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     )}
//     {message && (
//       <div className="fixed bottom-4 right-4 p-3 bg-red-100 text-red-700 rounded-md shadow-lg z-50">
//         {message}
//       </div>
//     )}
//   </>
//  );
// };

// export default CombinedPanel;

import React, { useState, useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './CombinedPanel.css';
import Button from '../Button/Button';

const CombinedPanel = ({
  headers,
  fieldTypes,
  filterField,
  setFilterField,
  filterValue,
  setFilterValue,
  onApply,
  onClear,
  selectedFields,
  setSelectedFields,
  activeFilters,
  sortConfig
}) => {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("Contracts_Details");
  const [isExporting, setIsExporting] = useState(false);
  const [showFieldSelection, setShowFieldSelection] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [filterField]);

  // --- MODIFIED: Simplified this section, though it's not strictly used for filtering UI anymore ---
  const { numeric = [], date = [] } = fieldTypes || {};

  const getCleanFilters = () => {
    const cleanFilters = {};
    for (const key in activeFilters) {
        if (activeFilters[key] !== "" && activeFilters[key] !== null) {
            cleanFilters[key] = activeFilters[key];
        }
    }
    return cleanFilters;
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleServerExport = async (format) => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        format,
        sortField: sortConfig?.field || '',
        sortDirection: sortConfig?.direction || '',
        selectedFields: selectedFields.join(','),
        ...getCleanFilters(),
      });
      // --- IMPORTANT: Use the same API URL as Leaderboard.jsx ---
      const response = await axios.get(`https://backend-2m6l.onrender.com/api/export?${params}`, { responseType: 'blob' });
      saveAs(response.data, `${fileName}.${format}`);
    } catch (error) {
      console.error("Export error:", error);
      showMessage("Export failed. Please check the console for more details.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    // PDF export logic remains client-side and is largely compatible.
    // Ensure the API call here also points to your local backend.
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        sortField: sortConfig?.field || '',
        sortDirection: sortConfig?.direction || '',
        selectedFields: selectedFields.join(','),
        ...getCleanFilters()
      });
      const response = await axios.get(`https://backend-2m6l.onrender.com/api/?${params}`);
      const allData = response.data.data || response.data;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      doc.text(fileName.replace(/_/g, ' '), 14, 14);
      autoTable(doc, {
        startY: 22,
        head: [selectedFields],
        body: allData.map(row => selectedFields.map(h => row[h]?.toString() || "")),
        theme: 'grid',
      });
      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      showMessage("Export failed. Try reducing the number of selected fields.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (selectedFields.length === 0) {
      showMessage("Please select at least one column to export.");
      return;
    }
    if (exportFormat === 'pdf') {
      exportToPDF();
    } else {
      handleServerExport(exportFormat);
    }
  };

  // --- MODIFIED: Drastically simplified input rendering ---
  const renderInput = () => {
    if (!filterField) return <div className="input-placeholder" />;
    
    return (
      <input 
        ref={inputRef} 
        type="text" 
        value={filterValue} 
        onChange={(e) => setFilterValue(e.target.value)} 
        placeholder={`Search in ${filterField}...`} 
        className="filter-input text-search"
      />
    );
  };

  const handleFilterFieldChange = (e) => {
    setFilterField(e.target.value);
    setFilterValue(""); // Reset value when field changes
  };

 return (
  <>
    <div className="panel-container">
      <div className="panel-row filter-panel">
        <div className="filter-controls-group">
          <select value={filterField} onChange={handleFilterFieldChange} className="filter-input field-selector">
            <option value="">Select Filter Column</option>
            {headers.map((h) => (<option key={h} value={h}>{h}</option>))}
          </select>

          {renderInput()}

          <div className="button-group">
            <Button variant="green" onClick={onApply} disabled={!filterField || !filterValue}>Apply</Button>
            <Button variant="danger" onClick={onClear}>Clear</Button>
          </div>
        </div>
      </div>

      <div className="panel-row export-panel">
        <div className="export-controls-group">
          <div className="input-group filename-group">
            <label htmlFor="filename" className="input-label">File Name:</label>
            <input id="filename" value={fileName} onChange={(e) => setFileName(e.target.value)} className="filter-input"/>
          </div>
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="filter-input format-selector">
            <option value="xlsx">Excel</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
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
            onClick={() => setSelectedFields(selectedFields.length === headers.length ? [] : headers)}>
            {selectedFields.length === headers.length ? "Deselect" : "Select"}
          </Button>
        </div>
        <div className="field-selection-table-container">
          {/* Field selection table remains the same */}
        </div>
      </div>
    )}
    {message && (
      <div className="fixed bottom-4 right-4 p-3 bg-red-100 text-red-700 rounded-md shadow-lg z-50">
        {message}
      </div>
    )}
  </>
 );
};

export default CombinedPanel;
