import React, { useState } from 'react';
import './UploadPage.css';
import { Button, Modal } from '../../components';

function UploadPage({ onCancel, onUploadSuccess, onUploadError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState('');

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

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
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
      const response = await fetch('https://backend-2m6l.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Server Response:', data);

      if (response.ok && !data.error) {
        if (onUploadSuccess) onUploadSuccess();
      } else {
        if (onUploadError) onUploadError(data.error); 
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      if (onUploadError) onUploadError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Upload Contract Data" onCancel={onCancel}>
       <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="excel-upload"
          accept=".xlsx"
          onChange={handleFileChange}
          className="upload-page-input-file"
        />
        <label htmlFor="excel-upload" className="drop-zone-label">
          <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          {selectedFile ? (
            <span>Selected: <strong>{selectedFile.name}</strong></span>
          ) : (
            <span>Drag & Drop your .xlsx file here, or <strong>click to select</strong></span>
          )}
        </label>
      </div>

      <div className="upload-page-actions">
        <Button
          variant="blue"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </Button>

        {internalError && (
          <p className="upload-page-status-error">{internalError}</p>
        )}

        <p className="upload-page-note">
          * Uploading a new file will replace all existing contract data.
        </p>
      </div>
    </Modal>
  );
}

export default UploadPage;