import React, { useState } from 'react';
import { Container, Row, Col, Card, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('upload');
    const [refreshFileList, setRefreshFileList] = useState(false);

    const handleFileUpload = (uploadedFile) => {
        // Trigger refresh of file list
        setRefreshFileList(prev => !prev);
        // Switch to files tab to show uploaded file
        setActiveTab('files');
    };

    return (
        <div className="dashboard-page">
            <Container fluid className="py-4">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2>Welcome back, {user?.username}!</h2>
                                <p className="text-muted mb-0">Manage your secure file shares</p>
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
                            className="mb-3"
                        >
                            <Tab eventKey="upload" title={<><i className="fas fa-upload me-2"></i>Upload Files</>}>
                                <Card>
                                    <Card.Header>
                                        <h5 className="mb-0">Upload New Files</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <FileUpload onFileUpload={handleFileUpload} />
                                    </Card.Body>
                                </Card>
                            </Tab>
                            <Tab eventKey="files" title={<><i className="fas fa-folder me-2"></i>My Files</>}>
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
