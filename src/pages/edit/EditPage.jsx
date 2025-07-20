import React, { useState, useEffect } from 'react';
import './EditPage.css'; // Assuming your CSS is in this file

/**
 * A form component to add or edit a row of data with intelligent input fields.
 */
const EditPage = ({ rowData, onSave, onCancel, onDelete, headers, isNew }) => {
  const [formData, setFormData] = useState(rowData);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // State for delete confirmation

  useEffect(() => {
    setFormData(rowData);
    // Reset delete confirmation state when rowData or isNew changes
    if (isNew) {
      setIsConfirmingDelete(false);
    }
  }, [rowData, isNew]);

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

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true); // Show confirmation prompt
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(formData.id); // Assuming 'id' is the unique identifier for deletion
    }
  };

  // Exclude 'SL No' and 'id' from the editable fields
  const editableHeaders = headers.filter(header => header !== 'SL No' && header !== 'id');

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

    // 1. Yes/No Toggle Buttons (as seen in the image)
    if (header === "Quarterly AMC Payment Status" || header === "Post Contract Issues") {
      return (
        <div className="yes-no-toggle">
          <button
            type="button"
            className={`yes-button ${value === 'Yes' ? 'active' : ''}`}
            onClick={() => handleChange({ target: { name: header, value: 'Yes' } })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`no-button ${value === 'No' ? 'active' : ''}`}
            onClick={() => handleChange({ target: { name: header, value: 'No' } })}
          >
            No
          </button>
        </div>
      );
    }

    // 2. Date Input
    if (header.toLowerCase().includes('date')) {
      // The value for a date input must be in 'YYYY-MM-DD' format.
      const dateValue = value && !isNaN(new Date(value)) ? new Date(value).toISOString().split('T')[0] : '';
      return <input type="date" {...commonProps} value={dateValue} />;
    }

    // 3. Numeric Input for amounts and durations
    if (header.includes('(₹)') || header.toLowerCase().includes('amount') || header.toLowerCase().includes('(yr)')) {
      return <input type="number" step="1" placeholder="0" {...commonProps} />;
    }

    // 4. Textarea for Remarks
    if (header.includes('Remarks')) {
      return <textarea {...commonProps} />;
    }
    
    // 5. Default Text Input for everything else
    return <input type="text" {...commonProps} />;
  };

  return (
    <div className="edit-page-overlay">
      <div className="edit-page-container">
        {/* Close button (X button) */}
        <button onClick={onCancel} className="close-button" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2>{isNew ? 'Add New Contract' : 'Edit Contract Details'}</h2>
        {/* Display Serial Number if not a new entry */}
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
            {!isNew ? (
              isConfirmingDelete ? (
                <div className="confirmation-group">
                  <span>Are you sure?</span>
                  <button type="button" onClick={handleConfirmDelete} className="action-button confirm-delete-button">
                    Yes, Delete
                  </button>
                  <button type="button" onClick={() => setIsConfirmingDelete(false)} className="action-button cancel-delete-button">
                    Cancel
                  </button>
                </div>
              ) : (
                <button type="button" onClick={handleDeleteClick} className="action-button delete-button">
                  Delete Row
                </button>
              )
            ) : (
              <div></div> // Empty div to maintain layout if no delete button
            )}

            <div className="main-actions">
              {/* The cancel button is removed from here as the 'X' button serves this purpose */}
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
