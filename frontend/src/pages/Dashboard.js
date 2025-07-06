import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, ProgressBar, Alert, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import config from '../config/config';

const Dashboard = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [shareSettings, setShareSettings] = useState({
        password: '',
        expiresIn: 24,
        allowDownloads: true
    });
    const [stats, setStats] = useState({
        totalFiles: 0,
        totalSize: 0,
        activeShares: 0
    });

    useEffect(() => {
        // Update stats when files change
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const activeShares = files.filter(file => file.shareLink).length;
        setStats({
            totalFiles: files.length,
            totalSize,
            activeShares
        });
    }, [files]);

    const handleFileUpload = (uploadedFile) => {
        const newFile = {
            ...uploadedFile,
            id: Date.now(),
            uploadDate: new Date(),
            shareLink: null,
            downloads: 0,
            status: 'uploaded'
        };
        setFiles(prev => [newFile, ...prev]);
    };

    const handleShare = (file) => {
        setSelectedFile(file);
        setShowShareModal(true);
    };

    const generateShareLink = () => {
        if (!selectedFile) return;

        const shareLink = `${window.location.origin}/share/${selectedFile.id}?token=${Math.random().toString(36).substr(2)}`;

        const updatedFile = {
            ...selectedFile,
            shareLink,
            shareSettings: { ...shareSettings },
            sharedAt: new Date()
        };

        setFiles(prev => prev.map(file =>
            file.id === selectedFile.id ? updatedFile : file
        ));

        setShowShareModal(false);
        setSelectedFile(null);
    };

    const handleDelete = (fileId) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            setFiles(prev => prev.filter(file => file.id !== fileId));
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type.includes('image')) return 'fas fa-image text-info';
        if (type.includes('pdf')) return 'fas fa-file-pdf text-danger';
        if (type.includes('video')) return 'fas fa-video text-warning';
        if (type.includes('audio')) return 'fas fa-music text-success';
        if (type.includes('text')) return 'fas fa-file-alt text-secondary';
        return 'fas fa-file text-muted';
    };

    return (
        <div className="dashboard-page">
            <Container fluid className="py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="mb-1 text-dark">Dashboard</h2>
                                <p className="text-muted mb-0">Welcome back, {user?.name || 'User'}!</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Button variant="outline-dark" size="sm">
                                    <i className="fas fa-cog me-2"></i>Settings
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Stats Cards */}
                <Row className="mb-4">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm stats-card files-card">
                            <Card.Body className="text-center">
                                <i className="fas fa-file-upload mb-2" style={{ fontSize: '2rem' }}></i>
                                <h4 className="mb-1">{stats.totalFiles}</h4>
                                <p className="mb-0" style={{ opacity: 0.9 }}>Total Files</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm stats-card storage-card">
                            <Card.Body className="text-center">
                                <i className="fas fa-hdd mb-2" style={{ fontSize: '2rem' }}></i>
                                <h4 className="mb-1">{formatFileSize(stats.totalSize)}</h4>
                                <p className="mb-0" style={{ opacity: 0.9 }}>Storage Used</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm stats-card shares-card">
                            <Card.Body className="text-center">
                                <i className="fas fa-share-alt mb-2" style={{ fontSize: '2rem' }}></i>
                                <h4 className="mb-1">{stats.activeShares}</h4>
                                <p className="mb-0" style={{ opacity: 0.9 }}>Active Shares</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Main Content */}
                <Row>
                    {/* File Upload Section */}
                    <Col lg={4} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className="bg-transparent border-0">
                                <h5 className="mb-0 text-dark">
                                    <i className="fas fa-cloud-upload-alt me-2"></i>
                                    Upload Files
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <FileUpload onFileUpload={handleFileUpload} />

                                <div className="mt-3 p-3 bg-light rounded">
                                    <small className="text-muted">
                                        <strong>Upload Limits:</strong><br />
                                        Max file size: {formatFileSize(config.MAX_FILE_SIZE)}<br />
                                        Supported formats: Images, PDFs, Documents, Videos
                                    </small>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Files List */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-transparent border-0">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 text-dark">
                                        <i className="fas fa-folder-open me-2"></i>
                                        Your Files
                                    </h5>
                                    {files.length > 0 && (
                                        <Button variant="outline-dark" size="sm">
                                            <i className="fas fa-download me-2"></i>
                                            Download All
                                        </Button>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {files.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-cloud-upload-alt text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                        <p className="text-muted mb-0">No files uploaded yet.</p>
                                        <p className="text-muted">Start by uploading your first file!</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <Table hover className="mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>File</th>
                                                    <th>Size</th>
                                                    <th>Uploaded</th>
                                                    <th>Status</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {files.map((file) => (
                                                    <tr key={file.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <i className={`${getFileIcon(file.type)} me-2`}></i>
                                                                <div>
                                                                    <div className="fw-bold">{file.name}</div>
                                                                    <small className="text-muted">{file.type}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{formatFileSize(file.size)}</td>
                                                        <td>
                                                            <small>{new Date(file.uploadDate).toLocaleDateString()}</small>
                                                        </td>
                                                        <td>
                                                            {file.shareLink ? (
                                                                <Badge bg="dark">
                                                                    <i className="fas fa-share me-1"></i>Shared
                                                                </Badge>
                                                            ) : (
                                                                <Badge bg="light" text="dark">Private</Badge>
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            <div className="btn-group btn-group-sm">
                                                                <Button
                                                                    variant="outline-dark"
                                                                    size="sm"
                                                                    onClick={() => handleShare(file)}
                                                                    title="Share file"
                                                                >
                                                                    <i className="fas fa-share"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="outline-dark"
                                                                    size="sm"
                                                                    title="Download file"
                                                                >
                                                                    <i className="fas fa-download"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(file.id)}
                                                                    title="Delete file"
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
                    </Col>
                </Row>

                {/* Share Modal */}
                <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="text-dark">
                            <i className="fas fa-share me-2"></i>
                            Share File
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedFile && (
                            <>
                                <div className="mb-3 p-3 bg-light rounded">
                                    <div className="d-flex align-items-center">
                                        <i className={`${getFileIcon(selectedFile.type)} me-2`}></i>
                                        <div>
                                            <strong>{selectedFile.name}</strong>
                                            <br />
                                            <small className="text-muted">{formatFileSize(selectedFile.size)}</small>
                                        </div>
                                    </div>
                                </div>

                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Password Protection (Optional)</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter password for file protection"
                                            value={shareSettings.password}
                                            onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Expires In</Form.Label>
                                        <Form.Select
                                            value={shareSettings.expiresIn}
                                            onChange={(e) => setShareSettings(prev => ({ ...prev, expiresIn: parseInt(e.target.value) }))}
                                        >
                                            {config.EXPIRATION_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Allow downloads"
                                            checked={shareSettings.allowDownloads}
                                            onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownloads: e.target.checked }))}
                                        />
                                    </Form.Group>
                                </Form>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowShareModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="dark" onClick={generateShareLink}>
                            <i className="fas fa-link me-2"></i>
                            Generate Share Link
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Dashboard;
