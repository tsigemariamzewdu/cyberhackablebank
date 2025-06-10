import { useState } from 'react';
import { Card, Form, Button, Table, Container, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AccountPage = ({ user, addAlert }) => {
  const [username, setUsername] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/api/accounts/${username}`
      );
      setAccount(response.data);
    } catch (error) {
      setAccount(null);
      addAlert('Account not found', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '800px' }}>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <h4>Account Lookup</h4>
          <p className="text-muted mb-0">Find other users to transfer money</p>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleLookup} className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Search'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {account && (
        <Card className="shadow-sm">
          <Card.Header className="bg-white">
            <h5>Account Details</h5>
          </Card.Header>
          <Card.Body>
            <Table borderless>
              <tbody>
                <tr>
                  <td><strong>Username:</strong></td>
                  <td>{account.username}</td>
                </tr>
                <tr>
                  <td><strong>Account Since:</strong></td>
                  <td>{new Date(account.created_at).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AccountPage;