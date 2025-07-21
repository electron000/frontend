import React, { useState } from 'react';
// Assuming 'UploadPage.css' will be modified to remove button styles
import './UploadPage.css';

function UploadPage({ onCancel, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (file) => {
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      setUploadStatus({ message: '', type: '' });
    } else {
      setSelectedFile(null);
      setUploadStatus({ message: 'Please select or drop a valid .xlsx file.', type: 'error' });
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
      setUploadStatus({ message: 'No file selected. Please choose an Excel file.', type: 'error' });
      return;
    }

    setLoading(true);
    setUploadStatus({ message: 'Uploading file...', type: '' });
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://backend-2m6l.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUploadStatus({ message: data.message || 'File uploaded and database updated successfully!', type: 'success' });
        setSelectedFile(null);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setUploadStatus({ message: data.error || 'File upload failed. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      setUploadStatus({ message: 'Network error or server is unreachable.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onCancel}>
      <div className="upload-page-container" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCancel} className="upload-page-close-button">&times;</button>
        <h2 className="upload-page-title">Upload Contract Data</h2>
        
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

        {/* MODIFIED: Using generic button classes */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="btn btn--blue"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>

        {uploadStatus.message && (
          <p className={uploadStatus.type === 'success' ? 'upload-page-status-success' : 'upload-page-status-error'}>
            {uploadStatus.message}
          </p>
        )}

        <p className="upload-page-note">
          * Uploading a new file will replace all existing contract data.
        </p>
      </div>
    </div>
  );
}

export default UploadPage;
