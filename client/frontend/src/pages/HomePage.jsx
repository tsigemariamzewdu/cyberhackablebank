import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function HomePage({ user }) {
  return (
    <Row className="justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Col md={10} lg={8}>
        <Card className="bank-card text-center p-4">
          <Card.Body>
            <h1 className="mb-3" style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
              <i className="fas fa-university me-2"></i>Welcome to SecureBank
            </h1>
            <h4 className="mb-4" style={{ color: 'var(--primary-dark)' }}>
              The modern, educational banking platform for learning about <span style={{ color: 'var(--accent-color)' }}>SQL Injection</span> attacks and defenses.
            </h4>
            <p className="mb-4" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
              Explore a real-world inspired banking system, toggle between secure and hackable modes, and see the impact of security best practices in action.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {!user && (
                <Button as={Link} to="/register" className="btn-primary btn-lg">
                  <i className="fas fa-user-plus me-2"></i>Get Started
                </Button>
              )}
              <Button as={Link} to="/attack-lab" className="btn-outline-primary btn-lg">
                <i className="fas fa-bug me-2"></i>Try Attack Lab
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default HomePage;