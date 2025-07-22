import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Leaderboard.css';
import ongcLogo from '../../assets/ongc-logo.png';
import EditPage from '../edit/EditPage';
import UploadPage from '../upload/UploadPage';
import { Button, CombinedPanel, DataTable, Pagination } from '../../components';

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
  const [dynamicFieldTypes, setDynamicFieldTypes] = useState({ numeric: [], date: [], text: [] });
  const [selectedFields, setSelectedFields] = useState([]); 

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

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
      const { data, totalPages: fetchedTotalPages, headers, fieldTypes } = response.data;

      setCurrentData(data || []);
      setTotalPages(fetchedTotalPages || 0);

      if ((data || []).length === 0 && currentPage > 1 && currentPage > fetchedTotalPages) {
        setCurrentPage(fetchedTotalPages > 0 ? fetchedTotalPages : 1);
      }

      if (headers && fieldTypes) {
        setDynamicHeaders(prev => arraysAreEqual(prev, headers) ? prev : headers);
        setDynamicFieldTypes(fieldTypes); 
        setSelectedFields(prev => (resetSelectedFields || prev.length === 0) ? headers : prev);
      } else {
        setError("Backend did not provide required metadata (headers, fieldTypes).");
      }
    } catch (err) {
      console.error("Fetch data error:", err);
      setError(err.response?.data?.error || "Failed to fetch data. Check backend server status.");
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
      if (dynamicFieldTypes.numeric?.includes(filterField)) {
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
    const wasNewRow = isNewRow;
    try {
      if (wasNewRow) {
        await axios.post(API_URL, newOrUpdatedRow, config);
      } else {
        await axios.put(`${API_URL}/${newOrUpdatedRow.id}`, newOrUpdatedRow, config);
      }
      setIsEditing(false);
      await fetchData();
      const message = wasNewRow ? 'New Contract Added Successfully' : 'Changes Have Been Saved';
      setNotification({ show: true, message, type: 'success' });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 2000);
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save the contract");
    }
  };

  const handleDeleteRow = async (rowId) => {
    try {
      await axios.delete(`${API_URL}/${rowId}`);
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete the contract");
    }
  };

  const handleEditClick = useCallback((row) => {
    setIsNewRow(false);
    setEditingRow(row);
    setIsEditing(true);
  }, []);

  const handleAddClick = () => {
    setIsNewRow(true);
    const newRowObject = dynamicHeaders.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
    setEditingRow(newRowObject);
    setIsEditing(true);
  };

  const handleUploadError = (errorMessage) => {
    setShowUploadModal(false); 
    setNotification({ 
      show: true, 
      message: errorMessage || 'Database update was Unsuccessful', 
      type: 'error' 
    });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <img src={ongcLogo} alt="ONGC Logo" className="ongc-logo" />
        <Button variant="danger" onClick={onLogout} className="logout-button">Logout</Button>
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
        setNotification={setNotification}
      />

      <div className="data-section">
        {loading && <div className="loading-overlay">Loading...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          !currentData.length && dynamicHeaders.length === 0 ? (
            <div className="no-results">No data found. Please upload an Excel file.</div>
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
        <Button variant="blue" onClick={() => setShowUploadModal(true)}>Update Database</Button>
        <Button variant="green" onClick={handleAddClick}>Add Contract</Button>
      </div>

      {isEditing && (
        <EditPage
          rowData={editingRow}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          onDelete={() => handleDeleteRow(editingRow.id)}
          headers={dynamicHeaders}
          isNew={isNewRow}
        />
      )}

      {showUploadModal && (
        <UploadPage
          onCancel={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            setShowUploadModal(false);
            setCurrentPage(1);
            fetchData(true);
            setNotification({ show: true, message: 'Database Updated Successfully', type: 'info' });
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 2000);
          }}
          onUploadError={handleUploadError}
        />
      )}
      
      {notification.show && (
        <div className="notification-overlay">
          <div className={`notification-modal notification-modal--${notification.type}`}>
            <p>{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;