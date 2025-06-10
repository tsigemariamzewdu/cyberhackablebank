import { useEffect, useState } from 'react';
import { Card, Table, Row, Col } from 'react-bootstrap';

function AdminPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/users?secureMode=true')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <Row className="justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Col md={10} lg={8}>
        <Card className="bank-card">
          <Card.Body>
            <h3 className="mb-4 text-center" style={{ color: 'var(--primary-color)' }}>
              <i className="fas fa-user-shield me-2"></i>Admin Panel
            </h3>
            <Table bordered hover responsive>
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
                    <td>{user.role}</td>
                    <td>${user.balance?.toFixed(2)}</td>
                    <td>{user.email}</td>
                    <td>{user.full_name}</td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default AdminPage;