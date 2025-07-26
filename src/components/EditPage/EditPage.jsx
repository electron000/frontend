import React, { useState, useEffect } from 'react';
import './EditPage.css';
import Modal from '../Modal.jsx';
import Button from '../Button.jsx';
import ActionButtons from '../ActionButtons.jsx';

const formatDateForDisplay = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

const formatDateForAPI = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '';
  const parts = dateString.split(/[-/]/);
  if (parts.length !== 3 || parts[2]?.length !== 4) return '';
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};


const EditPage = ({ rowData, onSave, onCancel, headers, isNew, fieldTypes }) => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const formattedData = { ...rowData };
    if (fieldTypes && fieldTypes.date) {
        fieldTypes.date.forEach(dateField => {
            if (formattedData[dateField]) {
                formattedData[dateField] = formatDateForDisplay(formattedData[dateField]);
            }
        });
    }
    setFormData(formattedData);
  }, [rowData, isNew, fieldTypes]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const dataToSend = { ...formData };
    if (fieldTypes && fieldTypes.date) {
        fieldTypes.date.forEach(dateField => {
            if (dataToSend[dateField]) {
                dataToSend[dateField] = formatDateForAPI(dataToSend[dateField]);
            }
        });
    }

    try {
      await onSave(dataToSend);
    } finally {
      setIsSaving(false);
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
            {/* Delete button has been removed from this component */}
            <ActionButtons onSave={handleSave} onCancel={onCancel} loading={isSaving} />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EditPage;
