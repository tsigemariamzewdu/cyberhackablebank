import { useState } from 'react';
import { Form, Button, Card, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const LoginPage = ({ secureMode, addAlert,setUser }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [attackExamples, setAttackExamples] = useState([
    "admin' --",
    "' OR '1'='1",
    "' OR 1=1 --",
    "admin' /*"
  ]);
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:3001/api/login', {
      username,
      password,
      secureMode
    });

    setUser(response.data.user);
 // console.log(response.data.user) // Set user globally
    addAlert(response.data.message, 'success');

    // Navigate based on role
    const role = response.data.user;
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }

  } catch (error) {
    addAlert(error.response?.data?.error || 'Login failed', 'danger');
  }
};

  return (
    <div className='page-container'>
      <Row>
      <Col lg={6}>
        <Card>
          <Card.Header>
            <h3 className="mb-0">Login</h3>
            <small className={`text-${secureMode ? 'success' : 'danger'}`}>
              {secureMode ? 'Secure Mode (Parameterized Queries)' : 'Vulnerable Mode (String Concatenation)'}
            </small>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Login
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
    </div>
  );
};

export default LoginPage;