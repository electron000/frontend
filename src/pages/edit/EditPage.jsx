import React, { useState, useEffect } from 'react';
import './EditPage.css';
import { Button, Modal } from '../../components';

const EditPage = ({ rowData, onSave, onCancel, onDelete, headers, isNew, displaySlNo }) => {
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

  // MODIFIED: handleSave is now simpler
  const handleSave = (e) => {
    e.preventDefault();
    onSave(formData);
    // The notification and closing logic is now handled by the parent
  };

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      await onDelete(formData.id);
      setIsConfirmingDelete(false);
      onCancel();
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
    <>
      <Modal title={isNew ? 'Add New Contract' : 'Edit Contract Details'} onCancel={onCancel}>
        {!isNew && <p>Serial Number: <strong>{displaySlNo}</strong></p>}
        
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
                <Button variant="danger" onClick={handleDeleteClick}>Delete Row</Button>
            ) : (
              null
            )}

            <div className="main-actions">
              <Button type="submit" variant="green">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {isConfirmingDelete && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h3>Are you sure?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirmation-buttons">
              <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleConfirmDelete}>Yes, Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVED: The notification JSX is no longer here */}
    </>
  );
};

export default EditPage;