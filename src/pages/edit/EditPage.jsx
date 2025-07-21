import React, { useState, useEffect } from 'react';
// Assuming 'EditPage.css' will be modified to remove button styles
import './EditPage.css';

/**
 * A form component to add or edit a row of data with intelligent input fields.
 */
const EditPage = ({ rowData, onSave, onCancel, onDelete, headers, isNew }) => {
  const [formData, setFormData] = useState(rowData);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setFormData(rowData);
    if (isNew) {
      setIsConfirmingDelete(false);
    }
  }, [rowData, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(formData.id);
    }
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
          {/* MODIFIED: Using generic button classes for the toggle */}
          <button
            type="button"
            className={`btn btn--toggle-yes ${value === 'Yes' ? 'active' : ''}`}
            onClick={() => handleChange({ target: { name: header, value: 'Yes' } })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`btn btn--toggle-no ${value === 'No' ? 'active' : ''}`}
            onClick={() => handleChange({ target: { name: header, value: 'No' } })}
          >
            No
          </button>
        </div>
      );
    }

    if (header.toLowerCase().includes('date')) {
      const dateValue = value && !isNaN(new Date(value)) ? new Date(value).toISOString().split('T')[0] : '';
      return <input type="date" {...commonProps} value={dateValue} />;
    }

    if (header.includes('(₹)') || header.toLowerCase().includes('amount') || header.toLowerCase().includes('(yr)')) {
      return <input type="number" step="1" placeholder="0" {...commonProps} />;
    }

    if (header.includes('Remarks')) {
      return <textarea {...commonProps} />;
    }
    
    return <input type="text" {...commonProps} />;
  };

  return (
    <div className="edit-page-overlay">
      <div className="edit-page-container">
        <button onClick={onCancel} className="close-button" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2>{isNew ? 'Add New Contract' : 'Edit Contract Details'}</h2>
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
                  {/* MODIFIED: Using generic button classes */}
                  <button type="button" onClick={handleConfirmDelete} className="btn btn--danger">
                    Yes, Delete
                  </button>
                  <button type="button" onClick={() => setIsConfirmingDelete(false)} className="btn btn--outline">
                    Cancel
                  </button>
                </div>
              ) : (
                // MODIFIED: Using generic button classes
                <button type="button" onClick={handleDeleteClick} className="btn btn--danger">
                  Delete Row
                </button>
              )
            ) : (
              <div></div> // Empty div to maintain layout
            )}

            <div className="main-actions">
              {/* MODIFIED: Using generic button classes */}
              <button type="submit" className="btn btn--green">
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
