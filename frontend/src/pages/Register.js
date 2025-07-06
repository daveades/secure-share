import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            // TODO: Implement actual registration logic
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            console.log('Registration attempt:', formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setErrors({ general: 'Registration failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-gradient-page">
            <div className="auth-gradient-overlay">
                <Container className="h-100 d-flex align-items-center justify-content-center">
                    <Row className="justify-content-center w-100">
                        <Col md={6} lg={5} xl={4}>
                            <div className="auth-card-wrapper">
                                <Card className="shadow-lg border-0 auth-glass-card">
                                    <Card.Body className="p-5">
                                        <div className="text-center mb-4">
                                            <i className="fas fa-file-shield text-dark mb-3" style={{ fontSize: '3rem' }}></i>
                                            <h2 className="fw-bold text-dark">Create Account</h2>
                                            <p className="text-muted">Join SecureShare for safe file sharing</p>
                                        </div>

                                        {success && (
                                            <Alert variant="success" className="mb-4">
                                                <i className="fas fa-check-circle me-2"></i>
                                                Account created successfully! Redirecting to login...
                                            </Alert>
                                        )}

                                        {errors.general && (
                                            <Alert variant="danger" className="mb-4">
                                                {errors.general}
                                            </Alert>
                                        )}

                                        <Form onSubmit={handleSubmit}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Full Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.name}
                                                    placeholder="Enter your full name"
                                                    size="lg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.name}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Email Address</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.email}
                                                    placeholder="Enter your email"
                                                    size="lg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.email}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.password}
                                                    placeholder="Create a strong password"
                                                    size="lg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.password}
                                                </Form.Control.Feedback>
                                                <Form.Text className="text-muted">
                                                    Must be at least 8 characters with uppercase, lowercase, and number
                                                </Form.Text>
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label>Confirm Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.confirmPassword}
                                                    placeholder="Confirm your password"
                                                    size="lg"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.confirmPassword}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Button
                                                type="submit"
                                                variant="dark"
                                                size="lg"
                                                className="w-100 mb-3"
                                                disabled={isLoading || success}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            className="me-2"
                                                        />
                                                        Creating Account...
                                                    </>
                                                ) : success ? (
                                                    <>
                                                        <i className="fas fa-check me-2"></i>
                                                        Account Created!
                                                    </>
                                                ) : (
                                                    'Create Account'
                                                )}
                                            </Button>
                                        </Form>

                                        <div className="text-center">
                                            <p className="text-muted mb-0">
                                                Already have an account?{' '}
                                                <Link to="/login" className="text-dark fw-bold text-decoration-none">
                                                    Sign in here
                                                </Link>
                                            </p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default Register;
