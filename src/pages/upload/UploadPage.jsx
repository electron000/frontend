// import React, { useState } from 'react';
// import './UploadPage.css';
// import { Button, Modal } from '../../components';

// function UploadPage({ onCancel, onUploadSuccess, onUploadError }) {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [internalError, setInternalError] = useState('');

//   const validateAndSetFile = (file) => {
//     if (file && file.name.endsWith('.xlsx')) {
//       setSelectedFile(file);
//       setInternalError('');
//     } else {
//       setSelectedFile(null);
//       setInternalError('Please select or drop a valid .xlsx file.');
//     }
//   };

//   const handleFileChange = (event) => {
//     validateAndSetFile(event.target.files[0]);
//   };

//   const handleDragEnter = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(true);
//   };
//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   };
//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };
//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     validateAndSetFile(file);
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) {
//       setInternalError('No file selected. Please choose an Excel file.');
//       return;
//     }

//     setLoading(true);
//     setInternalError('');
//     const formData = new FormData();
//     formData.append('file', selectedFile);

//     try {
//       const response = await fetch('https://backend-2m6l.onrender.com/api/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       // MODIFIED: We must read the JSON response first to check for logical errors.
//       const data = await response.json();

//       // This is the critical check:
//       // It ensures the network request was OK (status 200-299)
//       // AND that the server's response does NOT contain an 'error' field.
//       if (response.ok && !data.error) {
//         if (onUploadSuccess) onUploadSuccess();
//       } else {
//         // This will now catch both network errors and logical errors from the server.
//         if (onUploadError) onUploadError();
//       }
//     } catch (error) {
//       console.error('Error during file upload:', error);
//       if (onUploadError) onUploadError();
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal title="Upload Contract Data" onCancel={onCancel}>
//       <div 
//         className={`drop-zone ${isDragging ? 'dragging' : ''}`}
//         onDragEnter={handleDragEnter}
//         onDragLeave={handleDragLeave}
//         onDragOver={handleDragOver}
//         onDrop={handleDrop}
//       >
//         <input
//           type="file"
//           id="excel-upload"
//           accept=".xlsx"
//           onChange={handleFileChange}
//           className="upload-page-input-file"
//         />
//         <label htmlFor="excel-upload" className="drop-zone-label">
//           <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
//           {selectedFile ? (
//             <span>Selected: <strong>{selectedFile.name}</strong></span>
//           ) : (
//             <span>Drag & Drop your .xlsx file here, or <strong>click to select</strong></span>
//           )}
//         </label>
//       </div>

//       <div className="upload-page-actions">
//         <Button
//           variant="blue"
//           onClick={handleUpload}
//           disabled={!selectedFile || loading}
//         >
//           {loading ? 'Uploading...' : 'Upload'}
//         </Button>

//         {internalError && (
//           <p className="upload-page-status-error">{internalError}</p>
//         )}

//         <p className="upload-page-note">
//           * Uploading a new file will replace all existing contract data.
//         </p>
//       </div>
//     </Modal>
//   );
// }

// export default UploadPage;


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
      setInternalError('Please select or drop a valid .xlsx file.');
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
      
      // ADDED: This will show us the exact server response in the developer console
      console.log('Server Response:', data);

      // This is our current guess for what a "success" looks like
      if (response.ok && !data.error) {
        if (onUploadSuccess) onUploadSuccess();
      } else {
        if (onUploadError) onUploadError();
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      if (onUploadError) onUploadError();
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