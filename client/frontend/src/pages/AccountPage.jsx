import { useState } from 'react';
import { Card, Form, Button, Row, Col, Table } from 'react-bootstrap';

function AccountPage({ user }) {
  const [lookupUser, setLookupUser] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAccount(null);
    try {
      const res = await fetch(`http://localhost:3001/api/accounts/${lookupUser}?secureMode=true`);
      const data = await res.json();
      if (res.ok) {
        setAccount(data);
      } else {
        setError(data.error || 'Account not found');
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
              <i className="fas fa-search me-2"></i>Account Lookup
            </h3>
            <Form onSubmit={handleLookup} autoComplete="off">
              <Form.Group className="mb-4">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={lookupUser}
                  onChange={e => setLookupUser(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="w-100 btn-primary" disabled={loading}>
                {loading ? 'Looking up...' : 'Lookup Account'}
              </Button>
            </Form>
            {error && <div className="mt-3 text-danger text-center">{error}</div>}
            {account && (
              <Table bordered className="mt-4">
                <tbody>
                  <tr>
                    <th>Username</th>
                    <td>{account.username}</td>
                  </tr>
                  <tr>
                    <th>Balance</th>
                    <td>${account.balance.toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default AccountPage;