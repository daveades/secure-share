import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div>
            {/* Hero Section with Gradient */}
            <section className="hero-gradient">
                <div className="hero-overlay">
                    <Container className="h-100">
                        <Row className="align-items-center justify-content-center h-100">
                            <Col lg={8} xl={6} className="text-center">
                                <div className="hero-content">
                                    <h1 className="hero-title display-2 fw-bold mb-4">
                                        Secure File Sharing
                                        <span className="hero-accent"> Made Simple</span>
                                    </h1>
                                    <p className="hero-subtitle lead mb-5">
                                        Share your files securely with end-to-end encryption.
                                        Your privacy is our priority.
                                    </p>
                                    <div className="hero-buttons d-flex gap-4 justify-content-center flex-wrap">
                                        {!isAuthenticated ? (
                                            <>
                                                <Link to="/register">
                                                    <Button variant="dark" size="lg" className="px-5 py-3">
                                                        Get Started
                                                    </Button>
                                                </Link>
                                                <Link to="/login">
                                                    <Button variant="outline-dark" size="lg" className="px-5 py-3">
                                                        Sign In
                                                    </Button>
                                                </Link>
                                            </>
                                        ) : (
                                            <Link to="/dashboard">
                                                <Button variant="dark" size="lg" className="px-5 py-3">
                                                    Go to Dashboard
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {/* Floating Elements */}
                                <div className="floating-elements">
                                    <div className="floating-icon floating-icon-1">
                                        <i className="fas fa-shield-alt"></i>
                                    </div>
                                    <div className="floating-icon floating-icon-2">
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <div className="floating-icon floating-icon-3">
                                        <i className="fas fa-cloud"></i>
                                    </div>
                                    <div className="floating-icon floating-icon-4">
                                        <i className="fas fa-users"></i>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-5 bg-white">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="display-5 fw-bold text-dark">Why Choose SecureShare?</h2>
                            <p className="lead text-muted">
                                Built with security and simplicity in mind
                            </p>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm feature-card">
                                <Card.Body className="text-center p-4">
                                    <i className="fas fa-lock text-dark mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h5 className="text-dark">End-to-End Encryption</h5>
                                    <p className="text-muted">
                                        Your files are encrypted before they leave your device.
                                        Only you and your recipients can access them.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm feature-card">
                                <Card.Body className="text-center p-4">
                                    <i className="fas fa-clock text-dark mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h5 className="text-dark">Temporary Links</h5>
                                    <p className="text-muted">
                                        Set expiration times for your shared files.
                                        Links automatically expire for added security.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm feature-card">
                                <Card.Body className="text-center p-4">
                                    <i className="fas fa-users text-dark mb-3" style={{ fontSize: '3rem' }}></i>
                                    <h5 className="text-dark">Access Control</h5>
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
            <section className="bg-dark text-white py-5">
                <Container>
                    <Row className="text-center">
                        <Col>
                            <h3 className="mb-4">Ready to start sharing securely?</h3>
                            {!isAuthenticated ? (
                                <Link to="/register">
                                    <Button variant="light" size="lg" className="px-5 py-3">
                                        Create Your Account
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/dashboard">
                                    <Button variant="light" size="lg" className="px-5 py-3">
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
