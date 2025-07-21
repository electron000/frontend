import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Assuming 'Leaderboard.css' will be modified to remove button styles
import './Leaderboard.css';
import ongcLogo from '../../assets/ongc-logo.png';
import EditPage from '../edit/EditPage';
import UploadPage from '../upload/UploadPage';
import { DataTable, Pagination, CombinedPanel } from "../../components";

const API_URL = 'https://backend-2m6l.onrender.com/api/contracts';

const Leaderboard = ({ onLogout }) => {
  const [currentData, setCurrentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortConfig, setSortConfig] = useState({ field: 'SL No', direction: 'asc' });
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [rangeValues, setRangeValues] = useState(["", ""]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dynamicHeaders, setDynamicHeaders] = useState([]);
  const [dynamicFieldTypes, setDynamicFieldTypes] = useState({});
  const [selectedFields, setSelectedFields] = useState([]); 
  const [editingDisplaySlNo, setEditingDisplaySlNo] = useState(null);

  const arraysAreEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  };

  const fetchData = useCallback(async (resetSelectedFields = false) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: currentPage,
      limit: 10,
      sortField: sortConfig.field,
      sortDirection: sortConfig.direction,
      ...activeFilters,
    });
    try {
      const response = await axios.get(`${API_URL}?${params.toString()}`);
      const fetchedData = response.data.data || [];
      const fetchedTotalPages = response.data.totalPages || 0;

      setCurrentData(fetchedData);
      setTotalPages(fetchedTotalPages);

      if (fetchedData.length === 0 && currentPage > 1 && currentPage > fetchedTotalPages) {
        setCurrentPage(fetchedTotalPages > 0 ? fetchedTotalPages : 1);
      }

      if (response.data.headers && response.data.fieldTypes) {
        const newHeaders = response.data.headers;
        const newFieldTypes = response.data.fieldTypes;

        setDynamicHeaders(prevHeaders => 
          arraysAreEqual(prevHeaders, newHeaders) ? prevHeaders : newHeaders
        );
        
        setDynamicFieldTypes(newFieldTypes); 
        
        setSelectedFields(prevSelected => 
          (resetSelectedFields || prevSelected.length === 0) ? newHeaders : prevSelected
        );

      } else {
        setDynamicHeaders([]);
        setDynamicFieldTypes({});
        setSelectedFields([]); 
        setError("Backend did not provide headers or fieldTypes metadata.");
      }

    } catch (err) {
      console.error("Fetch data error:", err);
      if (err.response) {
        setError(`Failed to fetch data: ${err.response.status} - ${err.response.data?.error || err.response.statusText}`);
      } else if (err.request) {
        setError("Failed to fetch data: No response from server. Check network connection or backend server status.");
      } else {
        setError(`Failed to fetch data: ${err.message}. Please ensure the backend server is running and provides headers/fieldTypes.`);
      }
      setCurrentData([]);
      setTotalPages(0);
      setDynamicHeaders([]);
      setDynamicFieldTypes({});
      setSelectedFields([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortConfig, activeFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterApply = () => {
    const newFilters = {};
    if (filterField) {
      newFilters.filterField = filterField;
      if (dynamicFieldTypes.range?.includes(filterField) || dynamicFieldTypes.number?.includes(filterField) || dynamicFieldTypes.yearDropdown?.includes(filterField)) {
        newFilters.minRange = rangeValues[0];
        newFilters.maxRange = rangeValues[1];
      } else if (dynamicFieldTypes.date?.includes(filterField)) {
        newFilters.fromDate = dateRange.from;
        newFilters.toDate = dateRange.to;
      } else {
        newFilters.filterValue = filterValue;
      }
    }
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterField("");
    setFilterValue("");
    setRangeValues(["", ""]);
    setDateRange({ from: "", to: "" });
    setActiveFilters({});
    setCurrentPage(1);
    setSortConfig({ field: 'SL No', direction: 'asc' });
  };

  const handleResetSort = useCallback(() => {
    setSortConfig({ field: 'SL No', direction: 'asc' });
  }, []);

  const handleSave = async (newOrUpdatedRow) => {
    const config = { headers: { 'Content-Type': 'application/json' } };
    try {
      if (isNewRow) {
        await axios.post(API_URL, newOrUpdatedRow, config);
      } else {
        await axios.put(`${API_URL}/${newOrUpdatedRow.id}`, newOrUpdatedRow, config);
      }
      setIsEditing(false);
      fetchData();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save the contract.");
    }
  };

  const handleDeleteRow = async (rowId) => {
    try {
      await axios.delete(`${API_URL}/${rowId}`);
      setIsEditing(false);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete the contract.");
    }
  };

  const handleEditClick = useCallback((row, sl) => {
    setIsNewRow(false);
    setEditingRow(row);
    setEditingDisplaySlNo(sl);
    setIsEditing(true);
  }, []);

  const handleAddClick = () => {
    setIsNewRow(true);
    const newRowObject = dynamicHeaders.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
    setEditingRow(newRowObject);
    setEditingDisplaySlNo(null);
    setIsEditing(true);
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <img src={ongcLogo} alt="ONGC Logo" className="ongc-logo" />
        {/* MODIFIED: Using generic button classes */}
        <button onClick={onLogout} className="btn btn--danger logout-button">Logout</button>
      </div>

      <CombinedPanel
        headers={dynamicHeaders}
        fieldTypes={dynamicFieldTypes}
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
        selectedFields={selectedFields}
        setSelectedFields={setSelectedFields}
        activeFilters={activeFilters}
        sortConfig={sortConfig}
        resetSort={handleResetSort}
      />

      <div className="data-section">
        {loading && <div className="loading-overlay">Loading...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          !currentData.length && dynamicHeaders.length === 0 ? (
            <div className="no-results">No data or headers found. Please upload an Excel file.</div>
          ) : !currentData.length ? (
            <div className="no-results">No records found for the current filter.</div>
          ) : (
            <DataTable
              data={currentData}
              headers={dynamicHeaders}
              selectedFields={selectedFields}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              onEdit={handleEditClick}
              currentPage={currentPage}
              rowsPerPage={10}
              fieldTypes={dynamicFieldTypes}
            />
          )
        )}
      </div>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setPage={setCurrentPage}
      />

      <div className="bottom-action-buttons-container">
        {/* MODIFIED: Using generic button classes */}
        <button onClick={handleAddClick} className="btn btn--green">+ New</button>
        <button onClick={() => setShowUploadModal(true)} className="btn btn--blue">Upload</button>
      </div>

      {isEditing && (
        <EditPage
          rowData={editingRow}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          onDelete={() => handleDeleteRow(editingRow.id)}
          headers={dynamicHeaders}
          isNew={isNewRow}
          displaySlNo={editingDisplaySlNo}
        />
      )}

      {showUploadModal && (
        <UploadPage
          onCancel={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            setShowUploadModal(false);
            setCurrentPage(1);
            fetchData(true);
          }}
        />
      )}
    </div>
  );
};

export default Leaderboard;
