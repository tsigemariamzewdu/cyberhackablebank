import { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

function TransferPage({ user }) {
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:3001/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUser: user.username, toUser, amount: parseFloat(amount), secureMode: true })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Transfer successful!');
      } else {
        setError(data.error || 'Transfer failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Col md={7} lg={5}>
        <Card className="bank-card">
          <Card.Body>
            <h3 className="mb-4 text-center" style={{ color: 'var(--primary-color)' }}>
              <i className="fas fa-exchange-alt me-2"></i>Money Transfer
            </h3>
            <Form onSubmit={handleTransfer} autoComplete="off">
              <Form.Group className="mb-3">
                <Form.Label>Recipient Username</Form.Label>
                <Form.Control
                  type="text"
                  value={toUser}
                  onChange={e => setToUser(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100 btn-primary" disabled={loading}>
                {loading ? 'Transferring...' : 'Transfer'}
              </Button>
            </Form>
            {message && <div className="mt-3 text-success text-center">{message}</div>}
            {error && <div className="mt-3 text-danger text-center">{error}</div>}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default TransferPage;