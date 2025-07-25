import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../utils/api.js';
import './MIS.css';
import ongcLogo from '../../assets/ongc-logo.png';
import UploadPage from '../upload/UploadPage.jsx';
import { Button, CombinedPanel, DataTable, Pagination, SchemaEditor, EditPage } from '../../components/index.js';

const formatDateForAPI = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '';
  const parts = dateString.split(/[-/]/);
  if (parts.length !== 3 || parts[2]?.length !== 4) return '';
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

const Leaderboard = ({ onLogout }) => {
    const [userRole, setUserRole] = useState(null);
    const [view, setView] = useState('data'); 
    const [isSchemaEditorOpen, setIsSchemaEditorOpen] = useState(false);
    const [currentData, setCurrentData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [sortConfig, setSortConfig] = useState({ field: 'SL No', direction: 'asc' });
    const [dynamicHeaders, setDynamicHeaders] = useState([]);
    const [dynamicFieldTypes, setDynamicFieldTypes] = useState({ numeric: [], date: [], text: [] });
    const [selectedFields, setSelectedFields] = useState([]);
    const [filterField, setFilterField] = useState("");
    const [filterValue, setFilterValue] = useState("");
    const [rangeValues, setRangeValues] = useState(["", ""]);
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [activeFilters, setActiveFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
            } catch (error) {
                console.error("Failed to decode token:", error);
                onLogout();
            }
        }
    }, [onLogout]);

    const arraysAreEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    };

    const showNotification = (message, type = 'success', duration = 3000) => {
        const finalMessage = typeof message === 'string' ? message : JSON.stringify(message);
        setNotification({ show: true, message: finalMessage, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), duration);
    };

    const fetchData = useCallback(async (resetSelectedFields = false) => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ page: currentPage, limit: 10, sortField: sortConfig.field, sortDirection: sortConfig.direction, ...activeFilters });
        try {
            const response = await api.get(`/contracts?${params.toString()}`);
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
            if (err.response?.status === 401) {
                showNotification('Session expired. Please log in again.', 'error');
                onLogout();
            } else {
                setError(err.response?.data?.error || "Failed to fetch data. Check backend server status.");
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortConfig, activeFilters, onLogout]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleFilterApply = () => {
        const newFilters = {};
        if (filterField) {
            newFilters.filterField = filterField;
            if (dynamicFieldTypes.numeric?.includes(filterField)) {
                if (rangeValues[0]) newFilters.minRange = rangeValues[0];
                if (rangeValues[1]) newFilters.maxRange = rangeValues[1];
            } else if (dynamicFieldTypes.date?.includes(filterField)) {
                const fromDate = formatDateForAPI(dateRange.from);
                const toDate = formatDateForAPI(dateRange.to);
                if (fromDate) newFilters.fromDate = fromDate;
                if (toDate) newFilters.toDate = toDate;
            } else {
                if (filterValue) newFilters.filterValue = filterValue;
            }
        }
        setActiveFilters(newFilters);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setFilterField(""); setFilterValue(""); setRangeValues(["", ""]); setDateRange({ from: "", to: "" });
        setActiveFilters({}); setCurrentPage(1); setSortConfig({ field: 'SL No', direction: 'asc' });
    };

    const handleSaveRow = async (newOrUpdatedRow) => {
        const wasNewRow = view === 'newRow';
        try {
            if (wasNewRow) { await api.post('/contracts', newOrUpdatedRow); } else { await api.put(`/contracts/${newOrUpdatedRow.id}`, newOrUpdatedRow); }
            setView('data');
            await fetchData();
            showNotification(wasNewRow ? 'Contract Added Successfully' : 'Changes Saved Successfully', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to save the contract.';
            showNotification(errorMessage, 'error', 5000);
        }
    };

    const handleDeleteRow = async (rowId) => {
        try {
            await api.delete(`/contracts/${rowId}`);
            setView('data');
            await fetchData();
            showNotification('Contract Deleted Successfully', 'error');
        } catch (err) {
            showNotification(err.response?.data?.error || 'Failed to delete the contract.', 'error');
        }
    };

    const handleEditClick = useCallback((row) => { setEditingRow(row); setView('editRow'); }, []);

    const handleAddClick = () => {
        const newRowObject = dynamicHeaders.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
        setEditingRow(newRowObject);
        setView('newRow');
    };

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <img src={ongcLogo} alt="ONGC Logo" className="ongc-logo" />
                <div className="header-actions">
                    <Button variant="danger" onClick={onLogout} className="logout-button">Logout</Button>
                </div>
            </div>
            <CombinedPanel {...{ headers: dynamicHeaders, fieldTypes: dynamicFieldTypes, filterField, setFilterField, filterValue, setFilterValue, rangeValues, setRangeValues, dateRange, setDateRange, onApply: handleFilterApply, onClear: handleClearFilters, selectedFields, setSelectedFields, activeFilters, sortConfig, resetSort: () => setSortConfig({ field: 'SL No', direction: 'asc' }), setNotification: showNotification, onLogout }} />
            <div className="data-section">
                {loading && <div className="loading-overlay">Loading...</div>}
                {error && <div className="error-message">{error}</div>}
                {!loading && !error && (
                    !currentData.length && dynamicHeaders.length === 0 ? <div className="no-results">No data found. Please upload an Excel file.</div> :
                    !currentData.length ? <div className="no-results">No records found for the current filter.</div> :
                    <DataTable 
                        {...{ 
                            data: currentData, 
                            headers: dynamicHeaders, 
                            selectedFields, 
                            sortConfig, 
                            setSortConfig, 
                            onEdit: userRole === 'admin' ? handleEditClick : undefined, 
                            fieldTypes: dynamicFieldTypes,
                            onEditSchema: userRole === 'admin' ? () => setIsSchemaEditorOpen(true) : undefined
                        }} 
                    />
                )}
            </div>
            <Pagination totalPages={totalPages} currentPage={currentPage} setPage={setCurrentPage} />
            
            {userRole === 'admin' && (
                <div className="bottom-action-buttons-container">
                    <Button variant="blue" onClick={() => setView('upload')}>Update Database</Button>
                    <Button variant="green" onClick={handleAddClick}>Add Contract</Button>
                </div>
            )}

            {userRole === 'admin' && (view === 'editRow' || view === 'newRow') && (
                <EditPage 
                    rowData={editingRow} 
                    onSave={handleSaveRow} 
                    onCancel={() => setView('data')} 
                    onDelete={() => handleDeleteRow(editingRow.id)} 
                    headers={dynamicHeaders} 
                    isNew={view === 'newRow'}
                    fieldTypes={dynamicFieldTypes} // --- THIS LINE IS THE FIX ---
                />
            )}
            {userRole === 'admin' && view === 'upload' && (
                <UploadPage
                    onCancel={() => setView('data')}
                    onUploadSuccess={() => { setView('data'); setCurrentPage(1); fetchData(true); showNotification('Database Updated Successfully', 'info'); }}
                    onUploadError={(errorMessage) => { setView('data'); showNotification(errorMessage || 'Database Update Failed', 'error', 4000); }}
                />
            )}
            
            {isSchemaEditorOpen && (
                <SchemaEditor 
                    onCancel={() => setIsSchemaEditorOpen(false)}
                    onSchemaUpdate={() => {
                        setIsSchemaEditorOpen(false);
                        fetchData(true);
                    }}
                    showNotification={showNotification}
                />
            )}

            {notification.show && (
                <div className="notification-overlay">
                    <div className={`notification-modal notification-modal--${notification.type}`}><p>{notification.message}</p></div>
                </div>
            )}
        </div>
    );
};
export default Leaderboard;
