import React, { useState, useRef } from 'react';
import { Button, ProgressBar, Alert } from 'react-bootstrap';
import config from '../config/config';

const FileUpload = ({ onFileUpload }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        // Check file size
        if (file.size > config.MAX_FILE_SIZE) {
            return `File "${file.name}" is too large. Maximum size is ${formatFileSize(config.MAX_FILE_SIZE)}.`;
        }

        // Check file type
        const isValidType = config.SUPPORTED_FILE_TYPES.some(type => {
            if (type.includes('*')) {
                const baseType = type.split('/')[0];
                return file.type.startsWith(baseType);
            }
            return file.type === type;
        });

        if (!isValidType) {
            return `File type "${file.type}" is not supported.`;
        }

        return null;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = [];
        let errorMessages = [];

        fileArray.forEach(file => {
            const error = validateFile(file);
            if (error) {
                errorMessages.push(error);
            } else {
                validFiles.push(file);
            }
        });

        if (errorMessages.length > 0) {
            setError(errorMessages.join(' '));
            return;
        }

        setError(null);
        setSelectedFiles(validFiles);
    };

    const handleFileSelect = (e) => {
        handleFiles(e.target.files);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const simulateUploadProgress = () => {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    resolve();
                }
                setUploadProgress(Math.min(progress, 100));
            }, 200);
        });
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select files first');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Simulate upload with progress
            await simulateUploadProgress();

            // Process each file
            for (const file of selectedFiles) {
                console.log('Uploading file:', file);

                if (onFileUpload) {
                    onFileUpload({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        uploadDate: new Date().toISOString()
                    });
                }
            }

            // Reset form
            setSelectedFiles([]);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Upload failed:', error);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="file-upload-container">
            {error && (
                <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Drag and Drop Area */}
            <div
                className={`file-drop-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="d-none"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    accept={config.SUPPORTED_FILE_TYPES.join(',')}
                />

                <div className="text-center">
                    {uploading ? (
                        <>
                            <i className="fas fa-spinner fa-spin text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5>Uploading Files...</h5>
                            <ProgressBar
                                now={uploadProgress}
                                className="mb-2"
                                style={{ height: '8px' }}
                                animated
                            />
                            <p className="text-muted">{Math.round(uploadProgress)}% Complete</p>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-cloud-upload-alt text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5>Drag & Drop Files Here</h5>
                            <p className="text-muted mb-3">or click to browse</p>
                            <Button variant="outline-primary" size="sm">
                                <i className="fas fa-folder-open me-2"></i>
                                Choose Files
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && !uploading && (
                <div className="selected-files mt-3">
                    <h6 className="mb-2">Selected Files ({selectedFiles.length})</h6>
                    <div className="files-list">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                <div className="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-file text-muted me-2"></i>
                                        <div>
                                            <div className="fw-bold">{file.name}</div>
                                            <small className="text-muted">{formatFileSize(file.size)}</small>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex gap-2 mt-3">
                        <Button
                            variant="primary"
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-grow-1"
                        >
                            <i className="fas fa-upload me-2"></i>
                            Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
                        </Button>
                        <Button
                            variant="outline-secondary"
                            onClick={() => setSelectedFiles([])}
                            disabled={uploading}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
