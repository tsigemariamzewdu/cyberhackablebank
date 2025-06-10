import { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';


const LoginPage = ({ secureMode, addAlert, setUser }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [attackExamples, setAttackExamples] = useState([
    "admin' --",
    "' OR '1'='1",
    "' OR 1=1 --",
    "admin' /*"
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, secureMode })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        addAlert('Login successful!', 'success');

        // Navigate based on role
        const role = data.user;
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        addAlert(data.error || 'Login failed', 'danger');
      }
    } catch (err) {
      addAlert('Network error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Col md={6} lg={4}>
        <Card className="bank-card">
          <Card.Body>
            <h3 className="mb-4 text-center" style={{ color: 'var(--primary-color)' }}>
              <i className="fas fa-sign-in-alt me-2"></i>Login to SecureBank
            </h3>
            <Form onSubmit={handleSubmit} autoComplete="off">
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                className="w-100 btn-primary"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={6}>
        <Card>
          <Card.Header>
            <h4 className="mb-0">SQL Injection Examples</h4>
            <small>Try these in username field (password can be anything)</small>
          </Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              {attackExamples.map((example, index) => (
                <ListGroup.Item 
                  key={index} 
                  action 
                  onClick={() => {
                    setUsername(example);
                    setPassword('anything');
                  }}
                  className="d-flex align-items-center py-3"
                >
                  <code className="me-auto">{example}</code>
                  <i className="bi bi-chevron-right"></i>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>

        {/* {user && (
          <Card className="mt-4">
            <Card.Header>User Information</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6>Username</h6>
                  <p className="text-muted">{user.username}</p>
                </div>
                <div>
                  <h6>Balance</h6>
                  <p className="text-muted">${user.balance.toFixed(2)}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        )} */}
      </Col>
    </Row>
  );
};

export default LoginPage;