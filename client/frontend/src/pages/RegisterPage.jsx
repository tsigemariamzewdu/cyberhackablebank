import { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = ({ addAlert, secureMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, secureMode })
      });
      const data = await res.json();
      if (res.ok) {
        addAlert('Registration successful! You can now log in.', 'success');
        navigate('/login');
      } else {
        addAlert(data.error || 'Registration failed', 'danger');
      }
    } catch (err) {
      addAlert('Network error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Row className="justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Col md={7} lg={5}>
        <Card className="bank-card">
          <Card.Body>
            <h3 className="mb-4 text-center" style={{ color: 'var(--primary-color)' }}>
              <i className="fas fa-user-plus me-2"></i>{secureMode ? 'Secure Registration' : 'Hackable Registration'}
            </h3>
            <Form onSubmit={handleSubmit} autoComplete="off">
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                className="w-100 btn-primary"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Form>
            <div className="mt-3 text-center">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={5} className="d-flex align-items-center">
        <Alert
          variant={secureMode ? 'info' : 'danger'}
          style={{ background: 'var(--accent-light)', color: '#fff', width: '100%' }}
        >
          {secureMode ? (
            <>
              <strong>Defense Mechanisms:</strong> <br />
              Registration uses <b>parameterized queries</b> and <b>input validation</b> to prevent SQL injection and ensure data integrity.
            </>
          ) : (
            <>
              <strong>Vulnerability:</strong> <br />
              Registration is <b>vulnerable to SQL injection</b> due to direct SQL concatenation. Try using SQL injection payloads in the username or email fields!
            </>
          )}
        </Alert>
      </Col>
    </Row>
  );
};

export default RegisterPage;