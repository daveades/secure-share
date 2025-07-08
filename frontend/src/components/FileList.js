import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { fileAPI } from '../services/api';

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [includeExpired, setIncludeExpired] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [includeExpired]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fileAPI.getMyFiles(includeExpired);
            if (response.data.success) {
                setFiles(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch files');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (fileId, filename) => {
        try {
            const response = await fileAPI.downloadFile(fileId);

            // Create blob and download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Refresh files to update download count
            fetchFiles();
        } catch (error) {
            setError(error.response?.data?.message || 'Download failed');
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const response = await fileAPI.deleteFile(fileId);
            if (response.data.success) {
                setSuccess('File deleted successfully');
                fetchFiles();
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Delete failed');
        }
    };

    const handleShare = (file) => {
        setSelectedFile(file);
        setShowShareModal(true);
    };

    const copyShareLink = () => {
        if (selectedFile && selectedFile.access_token) {
            const shareUrl = `${window.location.origin}/share/${selectedFile.access_token}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                setSuccess('Share link copied to clipboard!');
                setShowShareModal(false);
            }).catch(() => {
                setError('Failed to copy link');
            });
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const isExpired = (expirationDate) => {
        return new Date(expirationDate) < new Date();
    };

    const getStatusBadge = (file) => {
        if (!file.is_active) {
            return <Badge bg="secondary">Inactive</Badge>;
        }
        if (isExpired(file.expiration_date)) {
            return <Badge bg="warning">Expired</Badge>;
        }
        if (file.download_limit && file.download_count >= file.download_limit) {
            return <Badge bg="danger">Limit Reached</Badge>;
        }
        return <Badge bg="success">Active</Badge>;
    };

    if (loading) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading your files...</p>
            </div>
        );
    }

    return (
        <div className="file-list-container">
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

            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Your Files</h5>
                    <div className="d-flex gap-2 align-items-center">
                        <Form.Check
                            type="checkbox"
                            id="include-expired"
                            label="Include expired files"
                            checked={includeExpired}
                            onChange={(e) => setIncludeExpired(e.target.checked)}
                        />
                        <Button variant="outline-primary" size="sm" onClick={fetchFiles}>
                            <i className="fas fa-sync-alt me-1"></i>
                            Refresh
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    {files.length === 0 ? (
                        <div className="text-center p-4">
                            <i className="fas fa-folder-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <h6>No files found</h6>
                            <p className="text-muted">Upload some files to get started</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>File Name</th>
                                        <th>Size</th>
                                        <th>Upload Date</th>
                                        <th>Expires</th>
                                        <th>Downloads</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file) => (
                                        <tr key={file.file_id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-file text-muted me-2"></i>
                                                    <div>
                                                        <div className="fw-bold">{file.original_filename}</div>
                                                        {file.has_password && (
                                                            <Badge bg="info" size="sm">
                                                                <i className="fas fa-lock me-1"></i>
                                                                Protected
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{formatFileSize(file.file_size)}</td>
                                            <td>{formatDate(file.upload_date)}</td>
                                            <td>{formatDate(file.expiration_date)}</td>
                                            <td>
                                                {file.download_count}
                                                {file.download_limit && ` / ${file.download_limit}`}
                                            </td>
                                            <td>{getStatusBadge(file)}</td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleDownload(file.file_id, file.original_filename)}
                                                        disabled={!file.is_active || isExpired(file.expiration_date)}
                                                        title="Download"
                                                    >
                                                        <i className="fas fa-download"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => handleShare(file)}
                                                        disabled={!file.is_active || isExpired(file.expiration_date)}
                                                        title="Share"
                                                    >
                                                        <i className="fas fa-share-alt"></i>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(file.file_id)}
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Share Modal */}
            <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Share File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedFile && (
                        <div>
                            <h6>{selectedFile.original_filename}</h6>
                            <p className="text-muted">
                                Share this link to allow others to download your file:
                            </p>
                            <Form.Control
                                type="text"
                                readOnly
                                value={`${window.location.origin}/share/${selectedFile.access_token}`}
                                className="mb-3"
                            />
                            <div className="alert alert-info">
                                <small>
                                    <i className="fas fa-info-circle me-1"></i>
                                    This link will expire on {formatDate(selectedFile.expiration_date)}
                                    {selectedFile.has_password && (
                                        <><br /><i className="fas fa-lock me-1"></i>This file is password protected</>
                                    )}
                                    {selectedFile.download_limit && (
                                        <><br /><i className="fas fa-download me-1"></i>Download limit: {selectedFile.download_limit}</>
                                    )}
                                </small>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowShareModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={copyShareLink}>
                        <i className="fas fa-copy me-2"></i>
                        Copy Link
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FileList;
