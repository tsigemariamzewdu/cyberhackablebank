import { Card, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = ({ user }) => {
  return (
    <div className="container mt-4">
      <Card>
        <Card.Header>
          <h3>Welcome {user ? user.username : 'to Hackable Bank'}</h3>
        </Card.Header>
        <Card.Body>
          {user ? (
            <>
              <h5>Your Balance: ${user.balance.toFixed(2)}</h5>
              <div className="d-grid gap-2 mt-4">
                <Button as={Link} to="/account" variant="primary" size="lg">
                  Account Lookup
                </Button>
                <Button as={Link} to="/transfer" variant="success" size="lg">
                  Money Transfer
                </Button>
                {user.role === 'admin' && (
                  <Button as={Link} to="/admin" variant="dark" size="lg">
                    Admin Dashboard
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <h5>Please login or register to continue</h5>
              <div className="d-grid gap-2 mt-4" style={{ maxWidth: '300px', margin: '0 auto' }}>
                <Button as={Link} to="/login" variant="primary" size="lg">
                  Login
                </Button>
                <Button as={Link} to="/register" variant="secondary" size="lg">
                  Register
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default HomePage;