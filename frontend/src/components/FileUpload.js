import React, { useState, useRef } from 'react';
import { Button, ProgressBar, Alert, Form, Row, Col, Modal } from 'react-bootstrap';
import config from '../config/config';
import { fileAPI } from '../services/api';

const FileUpload = ({ onFileUpload }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [uploadOptions, setUploadOptions] = useState({
        expirationHours: 24,
        password: '',
        downloadLimit: ''
    });
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
        setSuccess(null);

        try {
            const uploadedFiles = [];

            // Process each file
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                
                // Prepare upload options
                const options = {
                    expirationHours: uploadOptions.expirationHours,
                    onProgress: (progressEvent) => {
                        const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        const totalProgress = ((i * 100) + fileProgress) / selectedFiles.length;
                        setUploadProgress(totalProgress);
                    }
                };

                if (uploadOptions.password) {
                    options.password = uploadOptions.password;
                }
                if (uploadOptions.downloadLimit) {
                    options.downloadLimit = parseInt(uploadOptions.downloadLimit);
                }

                // Upload file
                const response = await fileAPI.uploadFile(file, options);
                
                if (response.data.success) {
                    uploadedFiles.push({
                        ...response.data.data,
                        uploadDate: new Date().toISOString()
                    });
                } else {
                    throw new Error(response.data.message || 'Upload failed');
                }
            }

            // Success
            setSuccess(`Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`);
            
            // Call parent callback
            if (onFileUpload) {
                uploadedFiles.forEach(file => onFileUpload(file));
            }

            // Reset form
            setSelectedFiles([]);
            setUploadProgress(0);
            setUploadOptions({
                expirationHours: 24,
                password: '',
                downloadLimit: ''
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Upload failed:', error);
            setError(error.response?.data?.message || error.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleShowOptions = () => {
        if (selectedFiles.length === 0) {
            setError('Please select files first');
            return;
        }
        setShowOptionsModal(true);
    };

    const handleOptionsChange = (field, value) => {
        setUploadOptions(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="file-upload-container">
            {error && (
                <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" className="mb-3" dismissible onClose={() => setSuccess(null)}>
                    {success}
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
                            variant="outline-primary"
                            onClick={handleShowOptions}
                            disabled={uploading}
                            className="flex-shrink-0"
                        >
                            <i className="fas fa-cog me-2"></i>
                            Options
                        </Button>
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
                            className="flex-shrink-0"
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Upload Options Modal */}
            <Modal show={showOptionsModal} onHide={() => setShowOptionsModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Options</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col>
                                <Form.Label>Expiration Time</Form.Label>
                                <Form.Select
                                    value={uploadOptions.expirationHours}
                                    onChange={(e) => handleOptionsChange('expirationHours', parseInt(e.target.value))}
                                >
                                    {config.EXPIRATION_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Label>Password Protection (Optional)</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter password to protect files"
                                    value={uploadOptions.password}
                                    onChange={(e) => handleOptionsChange('password', e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Leave empty for no password protection
                                </Form.Text>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Label>Download Limit (Optional)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="Maximum number of downloads"
                                    value={uploadOptions.downloadLimit}
                                    onChange={(e) => handleOptionsChange('downloadLimit', e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    Leave empty for unlimited downloads
                                </Form.Text>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowOptionsModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => {
                        setShowOptionsModal(false);
                        handleUpload();
                    }}>
                        Upload Files
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FileUpload;
