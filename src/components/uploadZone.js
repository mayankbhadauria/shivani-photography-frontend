import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

const UploadContainer = styled.div`
  margin: 20px 0;
`;

const DropzoneArea = styled.div`
  border: 3px dashed ${props => props.isDragActive ? '#007bff' : '#ccc'};
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragActive ?
    'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' :
    'rgba(255, 255, 255, 0.9)'
  };

  &:hover {
    border-color: #007bff;
    background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(0, 123, 255, 0.1);
  }

  .upload-icon {
    font-size: 3rem;
    margin-bottom: 20px;
    color: ${props => props.isDragActive ? '#007bff' : '#666'};
  }

  .upload-text {
    font-size: 18px;
    color: #333;
    margin-bottom: 10px;
    font-weight: 500;
  }

  .upload-subtext {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
  }

  .file-types {
    font-size: 12px;
    color: #888;
    font-style: italic;
  }
`;

const UploadProgress = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  border: 2px solid #007bff;

  .progress-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .progress-text {
    font-size: 18px;
    color: #333;
    margin-bottom: 10px;
    font-weight: 500;
  }

  .progress-subtext {
    font-size: 14px;
    color: #666;
  }
`;

const FilePreview = styled.div`
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 15px;

  .preview-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #333;
  }

  .file-list {
    max-height: 150px;
    overflow-y: auto;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 5px;
    margin-bottom: 5px;
    font-size: 14px;

    .file-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .file-name {
      font-weight: 500;
      color: #333;
    }

    .file-size {
      color: #666;
    }

    .remove-btn {
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 3px;
      padding: 4px 8px;
      font-size: 12px;
      cursor: pointer;

      &:hover {
        background: #c82333;
      }
    }
  }

  .upload-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 15px;
    width: 100%;
    font-weight: 500;

    &:hover {
      background: #218838;
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }
`;

const UploadZone = ({ onUpload, uploading }) => {
  const [selectedFiles, setSelectedFiles] = React.useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    // Add new files to existing selection
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true,
    disabled: uploading
  });

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    await onUpload(selectedFiles);
    setSelectedFiles([]); // Clear selection after upload
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (uploading) {
    return (
      <UploadContainer>
        <UploadProgress>
          <div className="progress-icon">🔄</div>
          <div className="progress-text">Uploading your photos...</div>
          <div className="progress-subtext">
            Please wait while we process your images and create thumbnails
          </div>
        </UploadProgress>
      </UploadContainer>
    );
  }

  return (
    <UploadContainer>
      <DropzoneArea {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <div className="upload-icon">
          {isDragActive ? '📤' : '📸'}
        </div>
        <div className="upload-text">
          {isDragActive ? 'Drop your photos here!' : 'Add Photos to Your Portfolio'}
        </div>
        <div className="upload-subtext">
          Drag & drop images here, or click to select files
        </div>
        <div className="file-types">
          Supports: JPG, JPEG, PNG, GIF, BMP, WEBP
        </div>
      </DropzoneArea>

      {selectedFiles.length > 0 && (
        <FilePreview>
          <div className="preview-title">
            📁 Selected Files ({selectedFiles.length})
          </div>
          <div className="file-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({formatFileSize(file.size)})</span>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFile(index)}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
          >
            🚀 Upload {selectedFiles.length} Photo{selectedFiles.length !== 1 ? 's' : ''}
          </button>
        </FilePreview>
      )}
    </UploadContainer>
  );
};

export default UploadZone;