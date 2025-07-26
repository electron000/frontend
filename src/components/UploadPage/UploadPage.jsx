import React, { useState } from 'react';
import './UploadPage.css';
import Modal from '../Modal.jsx';
import Button from '../Button.jsx';
import api from '../../utils/api.js';

const RevertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"></polyline>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
    </svg>
);

function UploadPage({ onCancel, onUploadSuccess, onUploadError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState('');
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);

  const validateAndSetFile = (file) => {
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      setInternalError('');
    } else {
      setSelectedFile(null);
      setInternalError('Please select or drop a valid .xlsx file');
    }
  };

  const handleFileChange = (event) => {
    validateAndSetFile(event.target.files[0]);
  };

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setInternalError('No file selected. Please choose an Excel file.');
      return;
    }
    setLoading(true);
    setInternalError('');
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await api.post('/upload', formData);
      if (response.status === 200 && !response.data.error) {
        if (onUploadSuccess) onUploadSuccess(response.data.message);
      } else {
        if (onUploadError) onUploadError(response.data.error || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      const errorMessage = error.response?.data?.error || 'A network error occurred. Please try again.';
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
    setShowRevertConfirm(false);
    setIsReverting(true);
    setInternalError('');
    try {
      const response = await api.post('/revert');
      if (response.status === 200 && !response.data.error) {
        if (onUploadSuccess) onUploadSuccess(response.data.message || 'Successfully reverted to the previous version.');
      } else {
        if (onUploadError) onUploadError(response.data.error || 'An unknown error occurred during revert.');
      }
    } catch (error) {
      console.error('Error during revert:', error);
      const errorMessage = error.response?.data?.error || 'A network error occurred. Please try again.';
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <Modal title="Update Contract Data" onCancel={onCancel} showTopActions={true}>
      <div className="upload-page-top-actions">
          <button onClick={() => setShowRevertConfirm(true)} className="revert-button" title="Revert to Previous" disabled={isReverting || loading}>
              {isReverting ? <div className="loading-spinner"></div> : <RevertIcon />}
          </button>
      </div>
       <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
      >
        <input type="file" id="excel-upload" accept=".xlsx" onChange={handleFileChange} className="upload-page-input-file" />
        <label htmlFor="excel-upload" className="drop-zone-label">
          <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          {selectedFile ? ( <span>Selected: <strong>{selectedFile.name}</strong></span> ) : ( <span>Drag & Drop your .xlsx file here, or <strong>click to select</strong></span> )}
        </label>
      </div>

      <div className="upload-page-actions">
        <Button variant="blue" onClick={handleUpload} disabled={!selectedFile || loading || isReverting}>
          {loading ? <div className="loading-spinner"></div> : 'Upload New File'}
        </Button>
      </div>

      {internalError && ( <p className="upload-page-status-error">{internalError}</p> )}
      <p className="upload-page-note"> * Uploading a new file will create a backup of the current version. You can revert to the last backup.</p>

      {showRevertConfirm && (
        <div className="confirmation-overlay">
            <div className="confirmation-modal">
                <h3>Revert to Previous Version?</h3>
                <p>This will replace the current data with the most recent backup. This action cannot be undone.</p>
                <div className="confirmation-buttons">
                    <Button variant="danger" onClick={handleRevert}>Yes, Revert</Button>
                    <Button variant="outline" onClick={() => setShowRevertConfirm(false)}>Cancel</Button>
                </div>
            </div>
        </div>
      )}
    </Modal>
  );
}

export default UploadPage;
