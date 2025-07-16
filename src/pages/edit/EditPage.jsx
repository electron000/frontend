import React, { useState, useEffect } from 'react';
import './EditPage.css';

/**
 * A form component to add or edit a row of data with intelligent input fields.
 */
const EditPage = ({ rowData, onSave, onCancel, onDelete, headers, isNew }) => {
  const [formData, setFormData] = useState(rowData);

  useEffect(() => {
    setFormData(rowData);
  }, [rowData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkboxes differently if you were to add them
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm(`Are you sure you want to delete Contract: ${formData['Name of Contract']}?`)) {
      onDelete(formData['SL No']);
    }
  };

  // Exclude 'SL No' from the editable fields
  const editableHeaders = headers.filter(header => header !== 'SL No');

  // Helper function to render the correct input based on the header name
  const renderFormField = (header) => {
    const value = formData[header] || '';
    const commonProps = {
      id: header,
      name: header,
      value: value,
      onChange: handleChange,
      className: "form-input" // A common class for styling
    };

    // --- Logic to determine input type ---

    // 1. Yes/No Dropdown
    if (header === "Quarterly AMC Payment Status" || header === "Post Contract Issues") {
      return (
        <select {...commonProps}>
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }

    // 2. Date Input
    if (header.toLowerCase().includes('date')) {
      // The value for a date input must be in 'YYYY-MM-DD' format.
      // We attempt to format it, but your dummy data is already correct.
      const dateValue = value ? new Date(value).toISOString().split('T')[0] : '';
      return <input type="date" {...commonProps} value={dateValue} />;
    }

    // 3. Numeric Input for amounts
    if (header.includes('(₹)') || header.toLowerCase().includes('amount')) {
      return <input type="number" step="1" placeholder="0" {...commonProps} />;
    }
    
    // 4. Numeric Input for duration
    if (header.toLowerCase().includes('(yr)')) {
        return <input type="number" step="1" placeholder="0" {...commonProps} />;
    }

    // 5. Default Text Input for everything else
    return <input type="text" {...commonProps} />;
  };

  return (
    <div className="edit-page-overlay">
      <div className="edit-page-container">
        <h2>{isNew ? 'Add New Contract' : 'Edit Contract Details'}</h2>
        {!isNew && <p>Serial Number: <strong>{formData['SL No']}</strong></p>}
        
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
            {!isNew ? (
              <button type="button" onClick={handleDelete} className="action-button delete-button">
                Delete Row
              </button>
            ) : (
              <div></div> 
            )}

            <div className="main-actions">
              <button type="button" onClick={onCancel} className="action-button cancel-button">
                Cancel
              </button>
              <button type="submit" className="action-button save-button">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPage;
