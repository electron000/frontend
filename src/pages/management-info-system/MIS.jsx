import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../utils/api.js';
import './MIS.css';
import mainsysLogo from '../../assets/mainsys.png'; // Assuming you have a mainsys.png logo
import { Button, CombinedPanel, DataTable, Pagination, SchemaEditor, EditPage, UploadPage} from '../../components/index.js';

const formatDateForAPI = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '';
  const parts = dateString.split(/[-/]/);
  if (parts.length !== 3 || parts[2]?.length !== 4) return '';
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

const MIS = ({ onLogout }) => {
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
    const [rowToDelete, setRowToDelete] = useState(null);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const dataSectionRef = useRef(null);
    const scrollPositionRef = useRef(0);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
            } catch (error) {
                console.error("Failed to decode token:", error);
                handleLogout();
            }
        }
    }, [onLogout]);

    const arraysAreEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    };

    const showNotification = (message, type = 'success', duration = 1500) => {
        const finalMessage = typeof message === 'string' ? message : JSON.stringify(message);
        setNotification({ show: true, message: finalMessage, type });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), duration);
    };

    const fetchData = useCallback(async (resetSelectedFields = false) => {
        if (dataSectionRef.current) {
            scrollPositionRef.current = dataSectionRef.current.scrollTop;
        }
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
                handleLogout();
            } else {
                setError(err.response?.data?.error || "Failed to fetch data. Check backend server status.");
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortConfig, activeFilters, onLogout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!loading && dataSectionRef.current) {
            dataSectionRef.current.scrollTop = scrollPositionRef.current;
        }
    }, [loading, currentData]);

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
        setCurrentPage(1);
        setActiveFilters(newFilters);
    };

    const handleClearFilters = () => {
        setFilterField(""); setFilterValue(""); setRangeValues(["", ""]); setDateRange({ from: "", to: "" });
        setActiveFilters({}); setCurrentPage(1); setSortConfig({ field: 'SL No', direction: 'asc' });
    };

    const handleSaveRow = async (newOrUpdatedRow) => {
        const wasNewRow = view === 'newRow';
        setView('data');

        try {
            if (wasNewRow) {
                await api.post('/contracts', newOrUpdatedRow);
                showNotification('Contract Added Successfully', 'success');
                setSortConfig({ field: 'SL No', direction: 'desc' });
                setCurrentPage(1);
            } else {
                await api.put(`/contracts/${newOrUpdatedRow.id}`, newOrUpdatedRow);
                showNotification('Changes Saved Successfully', 'success');
                fetchData();
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to save the contract.';
            showNotification(errorMessage, 'error', 3000);
            fetchData();
        }
    };

    const handleDeleteClick = (row) => {
        setRowToDelete(row);
        setIsConfirmingDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (!rowToDelete) return;
        const originalData = [...currentData];
        const rowIdToDelete = rowToDelete.id;

        setCurrentData(prevData => prevData.filter(row => row.id !== rowIdToDelete));
        setIsConfirmingDelete(false);
        setRowToDelete(null);

        try {
            await api.delete(`/contracts/${rowIdToDelete}`);
            showNotification('Contract Deleted Successfully', 'error');
            if (originalData.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchData();
            }
        } catch (err) {
            setCurrentData(originalData);
            showNotification(err.response?.data?.error || 'Failed to delete the contract.', 'error', 3000);
        }
    };

    const handleCancelDelete = () => {
        setIsConfirmingDelete(false);
        setRowToDelete(null);
    };

    const handleEditClick = useCallback((row) => { setEditingRow(row); setView('editRow'); }, []);

    const handleAddClick = () => {
        const newRowObject = dynamicHeaders.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
        setEditingRow(newRowObject);
        setView('newRow');
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        onLogout();
    };

    return (
        <div className="mis-container">
            <div className="mis-header">
                <img src={mainsysLogo} alt="Mainsys Logo" className="mainsys-logo" />
                <div className="header-actions">
                    <Button variant="danger" onClick={handleLogout} className="logout-button" disabled={isLoggingOut}>
                        {isLoggingOut ? <div className="loading-spinner"></div> : 'Logout'}
                    </Button>
                </div>
            </div>
            <CombinedPanel {...{ headers: dynamicHeaders, fieldTypes: dynamicFieldTypes, filterField, setFilterField, filterValue, setFilterValue, rangeValues, setRangeValues, dateRange, setDateRange, onApply: handleFilterApply, onClear: handleClearFilters, selectedFields, setSelectedFields, activeFilters, sortConfig, resetSort: () => setSortConfig({ field: 'SL No', direction: 'asc' }), setNotification: showNotification, onLogout: handleLogout }} />
            <div className="data-section" ref={dataSectionRef}>
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
                {error && <div className="error-message">{error}</div>}
                {!error && (
                    !loading && !currentData.length ? (
                        <div className="no-results">
                            {dynamicHeaders.length === 0 ? "No data found. Please upload an Excel file." : "No records found for the current filter."}
                        </div>
                    ) : (
                        <DataTable
                            {...{
                                data: currentData,
                                headers: dynamicHeaders,
                                selectedFields,
                                sortConfig,
                                setSortConfig,
                                onEdit: userRole === 'admin' ? handleEditClick : undefined,
                                onDelete: userRole === 'admin' ? handleDeleteClick : undefined,
                                fieldTypes: dynamicFieldTypes,
                                onEditSchema: userRole === 'admin' ? () => setIsSchemaEditorOpen(true) : undefined
                            }}
                        />
                    )
                )}
            </div>
            <Pagination totalPages={totalPages} currentPage={currentPage} setPage={setCurrentPage} />

            {userRole === 'admin' && (
                <div className="bottom-action-buttons-container">
                    <Button variant="blue" onClick={() => setView('upload')}>Update</Button>
                    <Button variant="green" onClick={handleAddClick}>+ Contract</Button>
                </div>
            )}

            {userRole === 'admin' && (view === 'editRow' || view === 'newRow') && (
                <EditPage
                    rowData={editingRow}
                    onSave={handleSaveRow}
                    onCancel={() => setView('data')}
                    onDelete={() => handleDeleteClick(editingRow)}
                    headers={dynamicHeaders}
                    isNew={view === 'newRow'}
                    fieldTypes={dynamicFieldTypes}
                />
            )}
            {userRole === 'admin' && view === 'upload' && (
                <UploadPage
                    onCancel={() => setView('data')}
                    onUploadSuccess={(message) => { setView('data'); setCurrentPage(1); fetchData(true); showNotification(message || 'Database Updated Successfully', 'info'); }}
                    onUploadError={(errorMessage) => { setView('data'); showNotification(errorMessage || 'Upload Unsuccessful.', 'error', 3000); }}
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

            {isConfirmingDelete && (
                <div className="confirmation-overlay">
                    <div className="confirmation-modal">
                        <h3>Are you sure?</h3>
                        <p>Do you really want to delete this contract? This action cannot be undone.</p>
                        <div className="confirmation-buttons">
                            <Button variant="danger" onClick={handleConfirmDelete}>Yes, Delete</Button>
                            <Button variant="outline" onClick={handleCancelDelete}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default MIS;
