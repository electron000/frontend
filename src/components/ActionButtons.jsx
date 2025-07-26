import React from 'react';
import Button from './Button.jsx';

const ActionButtons = ({ onSave, onCancel, loading, isSubmit = true }) => {
  return (
    <div className="action-buttons-group">
      <Button type={isSubmit ? "submit" : "button"} variant="green" onClick={isSubmit ? null : onSave} disabled={loading}>
        {loading ? <div className="loading-spinner"></div> : 'Save Changes'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
    </div>
  );
};

export default ActionButtons;
