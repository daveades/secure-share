import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { fileAPI } from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshFileList, setRefreshFileList] = useState(false);
    const [stats, setStats] = useState({
        totalFiles: 0,
        totalShares: 0,
        storageUsed: 0,
        recentActivity: []
    });

    useEffect(() => {
        fetchDashboardStats();
    }, [refreshFileList]);

    const fetchDashboardStats = async () => {
        try {
            // Fetch files to calculate stats
            const response = await fileAPI.getMyFiles(false);
            if (response.data.success) {
                const files = response.data.data;
                const totalFiles = files.length;
                const totalShares = files.reduce((sum, file) => sum + (file.download_count || 0), 0);
                const storageUsed = files.reduce((sum, file) => sum + (file.size || 0), 0);

                setStats({
                    totalFiles,
                    totalShares,
                    storageUsed,
                    recentActivity: files.slice(0, 3) // Get 3 most recent files
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        }
    };

    const handleFileUpload = (uploadedFile) => {
        // Trigger refresh of file list and stats
        setRefreshFileList(prev => !prev);
        // Switch to files tab to show uploaded file
        setActiveTab('files');
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="dashboard-page">
            <Container fluid className="py-4">
                {/* Enhanced Header */}
                <Row className="mb-5">
                    <Col>
                        <div className="dashboard-header">
                            <div className="header-content">
                                <h1 className="dashboard-title">
                                    {getGreeting()}, {user?.username}! 👋
                                </h1>
                                <p className="dashboard-subtitle">
                                    Welcome to your secure file sharing dashboard
                                </p>
                            </div>
                            <div className="header-actions">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => setActiveTab('upload')}
                                    className="quick-upload-btn"
                                >
                                    <i className="fas fa-cloud-upload-alt me-2"></i>
                                    Quick Upload
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Main Content */}
                <Row>
                    <Col>
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="dashboard-tabs mb-4"
                        >
                            <Tab
                                eventKey="overview"
                                title={
                                    <span className="tab-title">
                                        <i className="fas fa-chart-line me-2"></i>
                                        Overview
                                    </span>
                                }
                            >
                                {/* Stats Cards */}
                                <Row className="mb-4">
                                    <Col md={4} className="mb-3">
                                        <Card className="stats-card files-card h-100">
                                            <Card.Body className="text-center">
                                                <div className="stats-icon">
                                                    <i className="fas fa-file-alt"></i>
                                                </div>
                                                <h3 className="stats-number">{stats.totalFiles}</h3>
                                                <p className="stats-label">Total Files</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <Card className="stats-card shares-card h-100">
                                            <Card.Body className="text-center">
                                                <div className="stats-icon">
                                                    <i className="fas fa-share-alt"></i>
                                                </div>
                                                <h3 className="stats-number">{stats.totalShares}</h3>
                                                <p className="stats-label">Total Downloads</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4} className="mb-3">
                                        <Card className="stats-card storage-card h-100">
                                            <Card.Body className="text-center">
                                                <div className="stats-icon">
                                                    <i className="fas fa-hdd"></i>
                                                </div>
                                                <h3 className="stats-number">{formatFileSize(stats.storageUsed)}</h3>
                                                <p className="stats-label">Storage Used</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Quick Actions */}
                                <Row className="mb-4">
                                    <Col>
                                        <Card className="quick-actions-card">
                                            <Card.Header>
                                                <h5 className="mb-0">
                                                    <i className="fas fa-bolt me-2"></i>
                                                    Quick Actions
                                                </h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col md={6} className="mb-3">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="lg"
                                                            className="w-100 action-btn"
                                                            onClick={() => setActiveTab('upload')}
                                                        >
                                                            <i className="fas fa-upload me-2"></i>
                                                            Upload New File
                                                        </Button>
                                                    </Col>
                                                    <Col md={6} className="mb-3">
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="lg"
                                                            className="w-100 action-btn"
                                                            onClick={() => setActiveTab('files')}
                                                        >
                                                            <i className="fas fa-folder-open me-2"></i>
                                                            View All Files
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Recent Activity */}
                                {stats.recentActivity.length > 0 && (
                                    <Row>
                                        <Col>
                                            <Card className="recent-activity-card">
                                                <Card.Header>
                                                    <h5 className="mb-0">
                                                        <i className="fas fa-clock me-2"></i>
                                                        Recent Activity
                                                    </h5>
                                                </Card.Header>
                                                <Card.Body>
                                                    <div className="activity-list">
                                                        {stats.recentActivity.map((file, index) => (
                                                            <div key={file.id} className="activity-item">
                                                                <div className="activity-icon">
                                                                    <i className="fas fa-file"></i>
                                                                </div>
                                                                <div className="activity-content">
                                                                    <div className="activity-title">{file.filename}</div>
                                                                    <div className="activity-meta">
                                                                        Uploaded • {formatFileSize(file.size)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                )}
                            </Tab>

                            <Tab
                                eventKey="upload"
                                title={
                                    <span className="tab-title">
                                        <i className="fas fa-cloud-upload-alt me-2"></i>
                                        Upload Files
                                    </span>
                                }
                            >
                                <Card className="upload-card">
                                    <Card.Header className="upload-header">
                                        <h5 className="mb-0">
                                            <i className="fas fa-cloud-upload-alt me-2"></i>
                                            Upload New Files
                                        </h5>
                                        <small className="text-muted">Drag and drop files or click to browse</small>
                                    </Card.Header>
                                    <Card.Body className="upload-body">
                                        <FileUpload onFileUpload={handleFileUpload} />
                                    </Card.Body>
                                </Card>
                            </Tab>

                            <Tab
                                eventKey="files"
                                title={
                                    <span className="tab-title">
                                        <i className="fas fa-folder me-2"></i>
                                        My Files ({stats.totalFiles})
                                    </span>
                                }
                            >
                                <FileList key={refreshFileList} />
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Dashboard;
