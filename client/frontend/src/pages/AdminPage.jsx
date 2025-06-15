import { useEffect, useState } from 'react';
import { Card, Table, Row, Col, Tabs, Tab, Badge, Form } from 'react-bootstrap';
import { FiUsers, FiActivity, FiRefreshCw, FiDollarSign, FiTrendingUp, FiSearch } from 'react-icons/fi';

/* Add this CSS to the top of the file or to your main CSS file */
/* You can move this to App.css or a dedicated CSS file if preferred */

const tabStyles = `
.admin-tabs .nav-link.active {
  background-color: #2563eb !important;
  color: #fff !important;
  border-radius: 6px 6px 0 0 !important;
  font-weight: 500;
}
.admin-tabs .nav-link {
  color: #2563eb !important;
  background: none !important;
  font-weight: 500;
}
`;

if (typeof document !== 'undefined' && !document.getElementById('admin-tabs-style')) {
  const style = document.createElement('style');
  style.id = 'admin-tabs-style';
  style.innerHTML = tabStyles;
  document.head.appendChild(style);
}

function AdminPage({ secureMode }) {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalTransactions: 0,
    recentTransactions: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const usersResponse = await fetch(`http://localhost:3001/api/admin/users?secureMode=${secureMode}`);
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Fetch transactions
      const transactionsResponse = await fetch(`http://localhost:3001/api/admin/transactions?secureMode=${secureMode}`);
      if (!transactionsResponse.ok) throw new Error('Failed to fetch transactions');
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData);

      // Calculate statistics
      const totalBalance = usersData.reduce((sum, user) => sum + (parseFloat(user.balance) || 0), 0);
      const recentTransactions = transactionsData.slice(0, 5); // Get 5 most recent transactions

      setStats({
        totalUsers: usersData.length,
        totalBalance,
        totalTransactions: transactionsData.length,
        recentTransactions
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [secureMode]);

  const filteredTransactions = transactions.filter(transaction => 
    transaction.from_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.to_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id?.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>{error}</p>
        <button className="btn btn-outline-danger" onClick={fetchData}>
          <FiRefreshCw className="me-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-user-shield me-2"></i>Admin Dashboard
        </h2>
        <button className="btn btn-outline-primary" onClick={fetchData}>
          <FiRefreshCw className="me-2" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-gradient-primary me-3">
                  <FiUsers className="text-white" size={24} />
                </div>
                <h6 className="mb-0 text-muted">Total Users</h6>
              </div>
              <h3 className="mb-0 fw-bold">{stats.totalUsers}</h3>
              <p className="text-success mb-0 mt-2">
                <FiTrendingUp className="me-1" />
                Active accounts
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-gradient-success me-3">
                  <FiDollarSign className="text-white" size={24} />
                </div>
                <h6 className="mb-0 text-muted">Total Balance</h6>
              </div>
              <h3 className="mb-0 fw-bold">${stats.totalBalance.toFixed(2)}</h3>
              <p className="text-muted mb-0 mt-2">
                Combined user balances
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-gradient-info me-3">
                  <FiActivity className="text-white" size={24} />
                </div>
                <h6 className="mb-0 text-muted">Total Transactions</h6>
              </div>
              <h3 className="mb-0 fw-bold">{stats.totalTransactions}</h3>
              <p className="text-muted mb-0 mt-2">
                All-time transactions
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-lg mb-4">
        <Card.Header className="bg-transparent border-0 p-4">
          <h5 className="mb-0">
            <FiActivity className="me-2" />
            Recent Transactions
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.from_user}</td>
                    <td>{transaction.to_user}</td>
                    <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                    <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Users and Transactions Tabs */}
      <Tabs defaultActiveKey="transactions" className="mb-4 admin-tabs">
        <Tab eventKey="transactions" title={
          <span>
            <FiActivity className="me-2" />
            All Transactions ({transactions.length})
          </span>
        }>
          <Card className="border-0 shadow-lg">
            <Card.Body>
              <div className="mb-4">
                <Form.Group className="d-flex align-items-center">
                  <FiSearch className="me-2 text-muted" />
                  <Form.Control
                    type="text"
                    placeholder="Search by username or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-light"
                  />
                </Form.Group>
              </div>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr style={{ backgroundColor: '#343a40', color: '#fff' }}>
                      <th>ID</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>{transaction.from_user}</td>
                        <td>{transaction.to_user}</td>
                        <td>${parseFloat(transaction.amount).toFixed(2)}</td>
                        <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="users" title={
          <span>
            <FiUsers className="me-2" />
            Users ({users.length})
          </span>
        }>
          <Card className="border-0 shadow-lg">
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Balance</th>
                      <th>Email</th>
                      <th>Full Name</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={idx}>
                        <td>{user.username}</td>
                        <td>
                          <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td>
                          {typeof user.balance === 'number' 
                            ? `$${user.balance.toFixed(2)}` 
                            : 'N/A'}
                        </td>
                        <td>{user.email || 'N/A'}</td>
                        <td>{user.full_name || 'N/A'}</td>
                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

export default AdminPage;