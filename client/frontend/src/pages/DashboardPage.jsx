import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';

function DashboardPage({ user }) {
  const [stats, setStats] = useState({
    balance: 0,
    transactions: [],
    recentActivity: []
  });

  useEffect(() => {
    // Fetch user data
    fetch(`http://localhost:3001/api/accounts/${user.username}`)
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({
          ...prev,
          balance: data.balance
        }));
      });

    // Fetch recent transactions
    fetch(`http://localhost:3001/api/transactions/${user.username}`)
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({
          ...prev,
          transactions: data
        }));
      });
  }, [user.username]);

  return (
    <Container fluid className="px-4">
      <h2 className="mb-4">Welcome back, {user.username}</h2>
      
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="stats-card h-100">
            <Card.Body>
              <h6 className="text-uppercase mb-2">Current Balance</h6>
              <h3>${stats.balance.toFixed(2)}</h3>
              <p className="mb-0">Available for transactions</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="stats-card h-100">
            <Card.Body>
              <h6 className="text-uppercase mb-2">Recent Transactions</h6>
              <h3>{stats.transactions.length}</h3>
              <p className="mb-0">In the last 30 days</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="stats-card h-100">
            <Card.Body>
              <h6 className="text-uppercase mb-2">Account Status</h6>
              <h3>Active</h3>
              <p className="mb-0">Your account is in good standing</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="bank-card">
            <Card.Header className="bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Transactions</h5>
                <Button variant="outline-primary" size="sm">
                  <i className="fas fa-download me-1"></i>
                  Export
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {stats.transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{new Date(transaction.timestamp).toLocaleDateString()}</td>
                      <td>
                        {transaction.from_user === user.username
                          ? `Transfer to ${transaction.to_user}`
                          : `Transfer from ${transaction.from_user}`}
                      </td>
                      <td>
                        <span className={`badge ${
                          transaction.from_user === user.username
                            ? 'bg-danger'
                            : 'bg-success'
                        }`}>
                          {transaction.from_user === user.username ? 'Sent' : 'Received'}
                        </span>
                      </td>
                      <td className={
                        transaction.from_user === user.username
                          ? 'text-danger'
                          : 'text-success'
                      }>
                        {transaction.from_user === user.username ? '-' : '+'}
                        ${transaction.amount.toFixed(2)}
                      </td>
                      <td>
                        <span className="badge bg-success">Completed</span>
                      </td>
                    </tr>
                  ))} */}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="bank-card">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="primary">
                  <i className="fas fa-exchange-alt me-2"></i>
                  Make a Transfer
                </Button>
                <Button variant="outline-primary">
                  <i className="fas fa-search me-2"></i>
                  Account Lookup
                </Button>
                <Button variant="outline-primary">
                  <i className="fas fa-file-invoice me-2"></i>
                  View Statements
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="bank-card">
            <Card.Header className="bg-transparent">
              <h5 className="mb-0">Security Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <i className="fas fa-shield-alt text-success me-3 fa-2x"></i>
                <div>
                  <h6 className="mb-0">Account Security</h6>
                  <small className="text-muted">Your account is protected</small>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <i className="fas fa-lock text-success me-3 fa-2x"></i>
                <div>
                  <h6 className="mb-0">Password Strength</h6>
                  <small className="text-muted">Strong password in use</small>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="fas fa-clock text-success me-3 fa-2x"></i>
                <div>
                  <h6 className="mb-0">Last Login</h6>
                  <small className="text-muted">Just now</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardPage;