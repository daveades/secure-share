import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login, error } = useAuth();
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

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            // TODO: Implement actual login logic
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            console.log('Login attempt:', formData);
            navigate('/dashboard');
        } catch (err) {
            setErrors({ general: 'Login failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Container className="auth-container">
                <Row className="justify-content-center w-100">
                    <Col md={6} lg={5} xl={4}>
                        <div className="auth-card-wrapper">
                            <Card className="shadow-lg border-0">
                                <Card.Body className="p-5">
                                    <div className="text-center mb-4">
                                        <i className="fas fa-shield-alt text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                                        <h2 className="fw-bold">Welcome Back</h2>
                                        <p className="text-muted">Sign in to your Secure Share account</p>
                                    </div>

                                    {errors.general && (
                                        <Alert variant="danger" className="mb-4">
                                            {errors.general}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
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

                                        <Form.Group className="mb-4">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                isInvalid={!!errors.password}
                                                placeholder="Enter your password"
                                                size="lg"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.password}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            className="w-100 mb-3"
                                            disabled={isLoading}
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
                                                    Signing In...
                                                </>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>
                                    </Form>

                                    <div className="text-center">
                                        <p className="text-muted mb-0">
                                            Don't have an account?{' '}
                                            <Link to="/register" className="text-primary fw-bold text-decoration-none">
                                                Create one here
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
    );
};

export default Login;
