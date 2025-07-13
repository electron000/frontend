import React, { useState, useEffect, useMemo } from 'react';
import './Leaderboard.css';
import ongcLogo from '../../assets/ongc-logo.png';

import { FilterPanel, DataTable, ExportButtons, Pagination } from "../../components";

const fieldTypes = {
  range: [
    "Contract Value (₹)",
    "Invoice Submitted & Amount Claimed (₹)",
    "Amount Passed (₹)",
    "Deduction (₹)",
    "PBG Amount (₹)",
    "Security Deposit Amount (₹)",
    "AMC Charges for Entire Duration (₹)",
    "Yearly Outflow as per OLA (₹)"
  ],
  date: [
    "Date of Commissioning",
    "Warranty End Date",
    "AMC Start Date",
    "AMC End Date"
  ],
  yesNo: [
    "Quarterly AMC Payment Status",
    "Post Contract Issues"
  ],
  number: [
    "SL No"
  ],
  yearDropdown: [
    "Warranty Duration (Yr)",
    "AMC Duration (Yr)"
  ],
  text: [
    "DISHA File No",
    "OLA No",
    "PR No",
    "PO No",
    "Name of Contract",
    "Brief Objective",
    "Name of Contractor",
    "------------------------- Remarks -------------------------"
  ]
};

const headers = [
  "SL No",
  "Name of Contract",
  "Name of Contractor",
  "Brief Objective",
  "DISHA File No",
  "Contract Value (₹)",
  "Date of Commissioning",
  "Warranty Duration (Yr)",
  "Warranty End Date",
  "AMC Duration (Yr)",
  "AMC Start Date",
  "AMC End Date",
  "Quarterly AMC Payment Status",
  "AMC Charges for Entire Duration (₹)",
  "PR No",
  "PO No",
  "OLA No",
  "Yearly Outflow as per OLA (₹)",
  "PBG Amount (₹)",
  "Security Deposit Amount (₹)",
  "Invoice Submitted & Amount Claimed (₹)",
  "Amount Passed (₹)",
  "Deduction (₹)",
  "Post Contract Issues",
  "------------------------- Remarks -------------------------"
];

const pad = (num) => (num < 10 ? `0${num}` : `${num}`);

const generateDummyData = () => {
  const data = [];
  for (let i = 1; i <= 500; i++) {
    const year = 2020 + (i % 10);
    const nextYear = year + 1;
    const yearAfter = year + 2;
    const month = pad((i % 12) + 1);
    const day = pad((i % 28) + 1);

    data.push({
      "SL No": i,
      "Name of Contract": `Contract ${i} - Name`,
      "Name of Contractor": `Contractor ${i} Ltd`,
      "Brief Objective": `Objective for contract ${i}`,
      "DISHA File No": 100000 + i,
      "Contract Value (₹)": i * 100000,
      "Date of Commissioning": `${year}-${month}-${day}`,
      "Warranty Duration (Yr)": (i % 5) + 1,
      "Warranty End Date": `${nextYear}-${month}-${day}`,
      "AMC Duration (Yr)": (i % 4) + 1,
      "AMC Start Date": `${nextYear}-${month}-${day}`,
      "AMC End Date": `${yearAfter}-${month}-${day}`,
      "Quarterly AMC Payment Status": i % 2 === 0 ? "Yes" : "No",
      "AMC Charges for Entire Duration (₹)": i * 10000,
      "PR No": 300000 + i,
      "PO No": 400000 + i,
      "OLA No": 200000 + i,
      "Yearly Outflow as per OLA (₹)": i * 5000,
      "PBG Amount (₹)": i * 5000,
      "Security Deposit Amount (₹)": i * 2000,
      "Invoice Submitted & Amount Claimed (₹)": i * 2000,
      "Amount Passed (₹)": i * 1800,
      "Deduction (₹)": i * 100,
      "Post Contract Issues": i % 3 === 0 ? "Yes" : "No",
      "------------------------- Remarks -------------------------": `Remarks fvjgvygvgv gvuhbhub ggyuuyb kjhjvyugbilub kugygbor contract${i}`
    });
  }
  return data;
};

const Leaderboard = () => {
  const [originalData, setOriginalData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [rangeValues, setRangeValues] = useState(["", ""]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFields, setSelectedFields] = useState(headers); // New state for selected columns
  const rowsPerPage = 15;
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

  useEffect(() => {
    try {
      const dummyData = generateDummyData();
      setOriginalData(dummyData);
      setCurrentData(dummyData);
    } catch (error) {
      setError("Error loading data. Please try again later.");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterApply = () => {
    let filtered = [...originalData];

    if (filterField) {
      // Handle Sl No range filtering
      if (filterField === "SL No" && rangeValues[0] !== "" && rangeValues[1] !== "") {
        const min = parseInt(rangeValues[0], 10);
        const max = parseInt(rangeValues[1], 10);
        filtered = filtered.filter(row => {
          const val = parseInt(row[filterField], 10);
          return val >= min && val <= max;
        });
      }
      // Handle other range filters (like money)
      else if (fieldTypes.range.includes(filterField)) {
        const [min, max] = rangeValues;
        filtered = filtered.filter(row => {
          const val = parseFloat(row[filterField]) || 0;
          const isMinValid = min !== "" ? val >= parseFloat(min) : true;
          const isMaxValid = max !== "" ? val <= parseFloat(max) : true;
          return isMinValid && isMaxValid;
        });
      }
      // Date range filtering
      else if (fieldTypes.date.includes(filterField)) {
        const from = dateRange.from ? new Date(dateRange.from) : null;
        const to = dateRange.to ? new Date(dateRange.to) : null;

        filtered = filtered.filter(row => {
          const val = new Date(row[filterField] || "");
          const isAfterFrom = from ? val >= from : true;
          const isBeforeTo = to ? val <= to : true;
          return isAfterFrom && isBeforeTo;
        });
      }
      // Additional filters for numeric and year-based fields
      else {
        filtered = filtered.filter(row =>
          row[filterField]?.toString().toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    }

    setCurrentData(filtered);
    setCurrentPage(1);
  };

  const resetSort = () => setSortConfig({ field: "SL No", direction: "asc" });

  const handleClearFilters = () => {
    setFilterField("");
    setFilterValue("");
    setRangeValues(["", ""]);
    setDateRange({ from: "", to: "" });
    setCurrentData(originalData);
    setCurrentPage(1);
    resetSort();
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return currentData.slice(start, start + rowsPerPage);
  }, [currentData, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(currentData.length / rowsPerPage);
  }, [currentData, rowsPerPage]);

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="leaderboard-container">
      <img src={ongcLogo} alt="ONGC Logo" className="ongc-logo" />

      <div style={{ marginBottom: "10px" }}>
        <FilterPanel
          headers={headers}
          fieldTypes={fieldTypes}
          filterField={filterField}
          setFilterField={setFilterField}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          rangeValues={rangeValues}
          setRangeValues={setRangeValues}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onApply={handleFilterApply}
          onClear={handleClearFilters}
          resetSort={resetSort}
        />
      </div>

      <div className="export-fields-container" style={{ marginBottom: "24px" }}>
        <ExportButtons
          data={currentData}
          headers={headers}
          selectedFields={selectedFields}
          setSelectedFields={setSelectedFields}
        />
      </div>

      {/* Data Table and Pagination */}
      {!paginatedData.length && (
        <div className="no-results">No matching records found.</div>
      )}

      {!!paginatedData.length && (
        <>
          <DataTable
            data={paginatedData}
            headers={headers}
            selectedFields={selectedFields}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            setPage={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Leaderboard;