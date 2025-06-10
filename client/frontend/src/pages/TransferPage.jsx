import { useState } from 'react';
import { Form, Button, Card, Alert, Container, FloatingLabel } from 'react-bootstrap';
import axios from 'axios';

const TransferPage = ({ user, addAlert }) => {
  const [formData, setFormData] = useState({
    toUser: '',
    amount: '',
    memo: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/transfer', {
        fromUser: user.username,
        toUser: formData.toUser,
        amount: parseFloat(formData.amount),
        memo: formData.memo
      });
      addAlert('Transfer successful!', 'success');
      setFormData({ toUser: '', amount: '', memo: '' });
    } catch (error) {
      addAlert(error.response?.data?.error || 'Transfer failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '600px' }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4>Transfer Money</h4>
          <p className="text-muted mb-0">Send money to other users</p>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <FloatingLabel controlId="toUser" label="Recipient Username" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Recipient Username"
                value={formData.toUser}
                onChange={(e) => setFormData({...formData, toUser: e.target.value})}
                required
              />
            </FloatingLabel>

            <FloatingLabel controlId="amount" label="Amount" className="mb-3">
              <Form.Control
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </FloatingLabel>

            <FloatingLabel controlId="memo" label="Memo (Optional)" className="mb-3">
              <Form.Control
                as="textarea"
                placeholder="Memo"
                style={{ height: '100px' }}
                value={formData.memo}
                onChange={(e) => setFormData({...formData, memo: e.target.value})}
              />
            </FloatingLabel>

            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Transfer Money'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TransferPage;