import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from 'docx';

// MODIFICATION: Removed the internal sortConfig state and getSortedData function.
// The component now expects the 'data' prop to be pre-sorted by the parent.
const ExportButtons = ({ data, headers, selectedFields, setSelectedFields }) => {
  const [fileName, setFileName] = useState("Contracts Details");
  const [isExporting, setIsExporting] = useState(false);
  const [showFieldSelection, setShowFieldSelection] = useState(false);

  const handleFieldChange = (field) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const toggleAllFields = () => {
    setSelectedFields(selectedFields.length === headers.length ? [] : headers);
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // Directly use the 'data' prop, which is now pre-sorted.
      const csvContent = [selectedFields.join(",")].concat(
        data.map(row =>
          selectedFields.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(",")
        )
      );
      const blob = new Blob([csvContent.join("\n")], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${fileName}.csv`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Contracts Details");
      worksheet.addRow(selectedFields);

      // Directly use the 'data' prop.
      data.forEach(row => worksheet.addRow(selectedFields.map(h => row[h] || "")));

      worksheet.columns = selectedFields.map(h => {
        const max = Math.max(h.length, ...data.map(r => (r[h] || '').toString().length));
        return { width: Math.min(50, max * 0.8 + 2) };
      });

      worksheet.getRow(1).eachCell(cell => cell.font = { bold: true });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }), `${fileName}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      const numCols = selectedFields.length;
      let format = 'a4';
      if (numCols > 10) format = 'a3';
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format });

      const scale = Math.max(0.45, 1 - (numCols / 30));
      const fontSize = 10 * scale;
      const titleSize = 16 * scale;
      const cellPadding = 2.5 * scale;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(titleSize);
      doc.text(fileName.replace(/_/g, ' '), 14, 14);

      autoTable(doc, {
        startY: 22,
        head: [selectedFields.map(h => h.replace(/\s*\(₹\)/, ' (INR)'))],
        body: data.map(row => selectedFields.map(h => row[h]?.toString() || "")),
        theme: 'grid',
        tableWidth: 'auto',
        margin: { top: 30, left: 10, right: 10 },
        styles: { fontSize, fontStyle: 'normal', font: 'helvetica', halign: 'center', valign: 'middle', textColor: [26, 26, 26], lineColor: [210, 210, 210], lineWidth: 0.3, fillColor: [249, 249, 246], cellPadding },
        headStyles: { fontSize: fontSize + 1.2, fontStyle: 'bold', textColor: [255, 255, 255], fillColor: [45, 106, 79], halign: 'center', valign: 'middle', cellPadding },
        alternateRowStyles: { fillColor: [233, 242, 239] },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.setTextColor(120);
          doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }
      });

      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Export failed. Try reducing the number of selected fields.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToDocx = async () => {
    setIsExporting(true);
    try {
      const colWidths = selectedFields.map(h => {
        const maxLength = Math.max(h.length, ...data.map(r => (r[h] || '').toString().length));
        return Math.min(8000, Math.max(1500, 6000 / selectedFields.length + maxLength * 100));
      });

      const headerRow = new TableRow({ children: selectedFields.map((h, i) => new TableCell({ width: { size: colWidths[i], type: WidthType.DXA }, children: [new Paragraph(h)] })) });
      const dataRows = data.map(row => new TableRow({ children: selectedFields.map((h, i) => new TableCell({ width: { size: colWidths[i], type: WidthType.DXA }, children: [new Paragraph(row[h]?.toString() || "")] })) }));

      const doc = new Document({ sections: [{ children: [ new Paragraph({ text: fileName.replace(/_/g, ' '), heading: "Heading1" }), new Table({ rows: [headerRow, ...dataRows] }) ] }] });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName}.docx`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllFormats = async () => {
    setIsExporting(true);
    try {
      await exportToCSV();
      await exportToExcel();
      await exportToPDF();
      await exportToDocx();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="export-panel-row">
        <div className="filename-group">
          <label htmlFor="filename" className="font-semibold mr-4">File Name: </label>
          <input
            id="filename"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="filename-input"
            placeholder="Enter file name"
          />
        </div>

        <div className="export-btn-group">
          <button onClick={exportToCSV} className="export-btn csv" disabled={isExporting}>CSV</button>
          <button onClick={exportToExcel} className="export-btn excel" disabled={isExporting}>Excel</button>
          <button onClick={exportToPDF} className="export-btn pdf" disabled={isExporting}>PDF</button>
          <button onClick={exportToDocx} className="export-btn word" disabled={isExporting}>Word</button>
          <button onClick={exportAllFormats} className="export-btn all" disabled={isExporting}>All</button>
          <button 
            onClick={() => setShowFieldSelection(!showFieldSelection)} 
            className="export-btn preview"
          >
            {showFieldSelection ? "Hide" : "Columns"}
          </button>
        </div>
      </div>

      {isExporting && (
        <p className="exporting-message">Exporting file(s)... Please wait.</p>
      )}

      {showFieldSelection && (
        <div className="field-selection-container">
          <div className="export-heading-container">
            <h3 className="export-heading">SELECT COLUMNS</h3>
          </div>
          <div className="field-selection-table-container">
            <table className="field-selection-table">
              <tbody>
                {Array.from({ length: Math.ceil(headers.length / 5) }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.slice(rowIndex * 5, rowIndex * 5 + 5).map((field) => (
                      <td key={field}>
                        <label className="field-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(field)}
                            onChange={() => handleFieldChange(field)}
                          />
                          {field}
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="select-button-container">
            <button
              onClick={toggleAllFields}
              className={`select-toggle-btn ${
                selectedFields.length === headers.length ? "deselect-state" : "select-state"
              }`}
            >
              {selectedFields.length === headers.length ? "Deselect" : "Select"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButtons;