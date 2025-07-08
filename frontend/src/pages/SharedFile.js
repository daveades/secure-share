import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { fileAPI } from '../services/api';

const SharedFile = () => {
    const { accessToken } = useParams();
    const [fileInfo, setFileInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [password, setPassword] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        if (accessToken) {
            fetchFileInfo();
        }
    }, [accessToken]);

    const fetchFileInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fileAPI.getSharedFileInfo(accessToken);
            
            if (response.data.success) {
                setFileInfo(response.data.data);
                setShowPasswordForm(response.data.data.has_password);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to load file information');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!fileInfo) return;

        try {
            setDownloading(true);
            setError(null);

            const response = await fileAPI.downloadSharedFile(
                accessToken, 
                fileInfo.has_password ? password : null
            );

            // Create blob and download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileInfo.original_filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Refresh file info to update download count
            fetchFileInfo();

        } catch (error) {
            setError(error.response?.data?.message || 'Download failed');
        } finally {
            setDownloading(false);
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

    const getFileIcon = (type) => {
        if (type.includes('image')) return 'fas fa-image text-info';
        if (type.includes('pdf')) return 'fas fa-file-pdf text-danger';
        if (type.includes('video')) return 'fas fa-video text-warning';
        if (type.includes('audio')) return 'fas fa-music text-success';
        if (type.includes('text')) return 'fas fa-file-alt text-secondary';
        return 'fas fa-file text-muted';
    };

    const isExpired = (expirationDate) => {
        return new Date(expirationDate) < new Date();
    };

    const canDownload = () => {
        if (!fileInfo) return false;
        if (isExpired(fileInfo.expiration_date)) return false;
        if (fileInfo.download_limit && fileInfo.download_count >= fileInfo.download_limit) return false;
        return true;
    };

    if (loading) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <Spinner animation="border" role="status" className="mb-3">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <h5>Loading file information...</h5>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (error && !fileInfo) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="text-center">
                            <Card.Body className="py-5">
                                <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                                <h4>File Not Found</h4>
                                <p className="text-muted">{error}</p>
                                <Button variant="primary" href="/">
                                    Go to Homepage
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card>
                        <Card.Header className="text-center bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="fas fa-share-alt me-2"></i>
                                Shared File
                            </h4>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}

                            {fileInfo && (
                                <>
                                    {/* File Info */}
                                    <div className="text-center mb-4">
                                        <i className={`${getFileIcon(fileInfo.file_type)} mb-3`} style={{ fontSize: '4rem' }}></i>
                                        <h5 className="mb-2">{fileInfo.original_filename}</h5>
                                        <div className="d-flex justify-content-center gap-3 text-muted">
                                            <span>
                                                <i className="fas fa-hdd me-1"></i>
                                                {formatFileSize(fileInfo.file_size)}
                                            </span>
                                            <span>
                                                <i className="fas fa-calendar me-1"></i>
                                                {formatDate(fileInfo.upload_date)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* File Status */}
                                    <div className="mb-4">
                                        <Row className="text-center">
                                            <Col>
                                                <div className="border rounded p-3">
                                                    <div className="text-muted small">Expires</div>
                                                    <div className="fw-bold">
                                                        {isExpired(fileInfo.expiration_date) ? (
                                                            <Badge bg="danger">Expired</Badge>
                                                        ) : (
                                                            formatDate(fileInfo.expiration_date)
                                                        )}
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col>
                                                <div className="border rounded p-3">
                                                    <div className="text-muted small">Downloads</div>
                                                    <div className="fw-bold">
                                                        {fileInfo.download_count}
                                                        {fileInfo.download_limit && ` / ${fileInfo.download_limit}`}
                                                    </div>
                                                </div>
                                            </Col>
                                            {fileInfo.has_password && (
                                                <Col>
                                                    <div className="border rounded p-3">
                                                        <div className="text-muted small">Protection</div>
                                                        <div className="fw-bold">
                                                            <Badge bg="info">
                                                                <i className="fas fa-lock me-1"></i>
                                                                Password
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Col>
                                            )}
                                        </Row>
                                    </div>

                                    {/* Password Form */}
                                    {showPasswordForm && canDownload() && (
                                        <div className="mb-4">
                                            <Form>
                                                <Form.Group>
                                                    <Form.Label>
                                                        <i className="fas fa-lock me-2"></i>
                                                        This file is password protected
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        placeholder="Enter password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                                                    />
                                                </Form.Group>
                                            </Form>
                                        </div>
                                    )}

                                    {/* Download Button */}
                                    <div className="text-center">
                                        {canDownload() ? (
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                onClick={handleDownload}
                                                disabled={downloading || (fileInfo.has_password && !password)}
                                                className="px-4"
                                            >
                                                {downloading ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                        Downloading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-download me-2"></i>
                                                        Download File
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="text-center">
                                                <i className="fas fa-ban text-danger mb-3" style={{ fontSize: '2rem' }}></i>
                                                <h6 className="text-danger">
                                                    {isExpired(fileInfo.expiration_date) 
                                                        ? 'This file has expired' 
                                                        : 'Download limit reached'}
                                                </h6>
                                                <p className="text-muted">This file is no longer available for download.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </Card.Body>
                        <Card.Footer className="text-center text-muted">
                            <small>
                                <i className="fas fa-shield-alt me-1"></i>
                                Powered by SecureShare
                            </small>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SharedFile;
