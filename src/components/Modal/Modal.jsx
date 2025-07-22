import React from 'react';

const Modal = ({ children, onCancel, title }) => {
  const handleContainerClick = (e) => e.stopPropagation();

  return (
    <div className="edit-page-overlay" onClick={onCancel}>
      <div className="edit-page-container" onClick={handleContainerClick}>
        <button onClick={onCancel} className="close-button" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        
        {title && <h2>{title}</h2>}
        
        {children}
      </div>
    </div>
  );
};

export default Modal;