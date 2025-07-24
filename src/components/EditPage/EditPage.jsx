import React, { useState, useEffect } from 'react';
import './EditPage.css';
import Modal from '../Modal.jsx';
import Button from '../Button.jsx';
import ActionButtons from '../ActionButtons.jsx';

// --- HELPER FUNCTIONS for Date Formatting ---

/**
 * Converts a date string (like yyyy-mm-dd) to dd-mm-yyyy for display.
 */
const formatDateForDisplay = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '';
  // Handles both 'yyyy-mm-dd' and full ISO strings
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // Return empty if date is invalid
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Converts a date string from dd-mm-yyyy to yyyy-mm-dd for the API.
 */
const formatDateForAPI = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '';
  const parts = dateString.split(/[-/]/);
  if (parts.length !== 3 || parts[2]?.length !== 4) return ''; // Basic validation
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};


const EditPage = ({ rowData, onSave, onCancel, onDelete, headers, isNew, fieldTypes }) => {
  const [formData, setFormData] = useState({});
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // When rowData changes, format any date fields for display
    const formattedData = { ...rowData };
    if (fieldTypes && fieldTypes.date) {
        fieldTypes.date.forEach(dateField => {
            if (formattedData[dateField]) {
                formattedData[dateField] = formatDateForDisplay(formattedData[dateField]);
            }
        });
    }
    setFormData(formattedData);

    if (isNew) {
      setIsConfirmingDelete(false);
    }
  }, [rowData, isNew, fieldTypes]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Create a copy of the form data to re-format dates for the API
    const dataToSend = { ...formData };
    if (fieldTypes && fieldTypes.date) {
        fieldTypes.date.forEach(dateField => {
            if (dataToSend[dateField]) {
                dataToSend[dateField] = formatDateForAPI(dataToSend[dateField]);
            }
        });
    }

    try {
      await onSave(dataToSend); // Send the correctly formatted data
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      setIsSaving(true);
      try {
        await onDelete();
        setIsConfirmingDelete(false);
        onCancel();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getFieldType = (field) => {
    if (!fieldTypes) return 'text';
    if (fieldTypes.numeric && fieldTypes.numeric.includes(field)) return 'numeric';
    if (fieldTypes.date && fieldTypes.date.includes(field)) return 'date';
    return 'text';
  };

  const editableHeaders = headers.filter(header => header !== 'SL No' && header !== 'id');

  const renderFormField = (header) => {
    const value = formData[header] || '';
    const commonProps = {
      id: header,
      name: header,
      value: value,
      onChange: handleChange,
      className: "form-input"
    };

    if (header === "Quarterly AMC Payment Status" || header === "Post Contract Issues") {
      return (
        <div className="yes-no-toggle">
          <Button
            variant="toggle-yes"
            isActive={value === 'Yes'}
            onClick={() => handleChange({ target: { name: header, value: 'Yes' } })}
          >
            Yes
          </Button>
          <Button
            variant="toggle-no"
            isActive={value === 'No'}
            onClick={() => handleChange({ target: { name: header, value: 'No' } })}
          >
            No
          </Button>
        </div>
      );
    }

    if (header.includes('Remarks')) {
      return <textarea {...commonProps} />;
    }

    const fieldType = getFieldType(header);

    switch (fieldType) {
      case 'date':
        // Use a text input for dd-mm-yyyy format
        return <input type="text" placeholder="dd-mm-yyyy" {...commonProps} />;
      case 'numeric':
        return <input type="number" step="any" placeholder="0" {...commonProps} />;
      case 'text':
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  return (
    <>
      <Modal title={isNew ? 'Add New Contract' : 'Edit Contract Details'} onCancel={onCancel}>
        {!isNew && <p>Serial Number: <strong>{rowData['SL No']}</strong></p>}

        <form onSubmit={handleSave} className="edit-form">
          <div className="form-grid">
            {editableHeaders.map(header => (
              <div className="form-group" key={header}>
                <label htmlFor={header}>{header}</label>
                {renderFormField(header)}
              </div>
            ))}
          </div>

          <div className="form-actions">
            {!isNew && (
              <Button variant="danger" onClick={handleDeleteClick}>Delete Contract</Button>
            )}
            <ActionButtons onSave={handleSave} onCancel={onCancel} loading={isSaving} />
          </div>
        </form>
      </Modal>

      {isConfirmingDelete && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h3>Are you sure?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirmation-buttons">
              <Button variant="danger" onClick={handleConfirmDelete}>Yes, Delete</Button>
              <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditPage;
