import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-primary text-white hero-section">
                <Container>
                    <Row className="align-items-center min-vh-60">
                        <Col lg={6} className="hero-content">
                            <h1 className="display-4 fw-bold mb-4">
                                Secure File Sharing Made Simple
                            </h1>
                            <p className="lead mb-4">
                                Share your files securely with end-to-end encryption.
                                Your privacy is our priority.
                            </p>
                            <div className="d-flex gap-3 flex-wrap justify-content-lg-start justify-content-center">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/register">
                                            <Button variant="light" size="lg">
                                                Get Started
                                            </Button>
                                        </Link>
                                        <Link to="/login">
                                            <Button variant="outline-light" size="lg">
                                                Sign In
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/dashboard">
                                        <Button variant="light" size="lg">
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Col>
                        <Col lg={6} className="hero-icon">
                            <div className="d-flex justify-content-lg-end justify-content-center align-items-center h-100">
                                <i className="fas fa-shield-alt" style={{ fontSize: '8rem', opacity: 0.7 }}></i>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="py-5">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold">Why Choose SecureShare?</h2>
                            <p className="lead text-muted">
                                Built with security and simplicity in mind
                            </p>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="text-center p-4">
                                    <i className="fas fa-lock text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h5>End-to-End Encryption</h5>
                                    <p className="text-muted">
                                        Your files are encrypted before they leave your device.
                                        Only you and your recipients can access them.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="text-center p-4">
                                    <i className="fas fa-clock text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h5>Temporary Links</h5>
                                    <p className="text-muted">
                                        Set expiration times for your shared files.
                                        Links automatically expire for added security.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="text-center p-4">
                                    <i className="fas fa-users text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h5>Access Control</h5>
                                    <p className="text-muted">
                                        Control who can access your files with
                                        password protection and user permissions.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="bg-light py-5">
                <Container>
                    <Row className="text-center">
                        <Col>
                            <h3 className="mb-4">Ready to start sharing securely?</h3>
                            {!isAuthenticated ? (
                                <Link to="/register">
                                    <Button variant="primary" size="lg">
                                        Create Your Account
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/dashboard">
                                    <Button variant="primary" size="lg">
                                        Upload Your First File
                                    </Button>
                                </Link>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Home;
