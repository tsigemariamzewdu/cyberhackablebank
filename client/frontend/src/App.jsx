import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Container, Nav, Navbar, Alert, Form, Button } from 'react-bootstrap';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import TransferPage from './pages/TransferPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import './theme.css';
import './App.css';

function App() {
  const [secureMode, setSecureMode] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null);

  // Dynamically set body class for theme
  useEffect(() => {
    if (secureMode) {
      document.body.classList.remove('hackable-mode');
    } else {
      document.body.classList.add('hackable-mode');
    }
  }, [secureMode]);

  const addAlert = (message, variant = 'info') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  const handleLogout = () => {
    setUser(null);
    addAlert('You have been logged out', 'success');
  };

  return (
    <div className="app-container">
      <Navbar bg="dark" variant="dark" expand="lg" className="navbar-fullwidth">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            <i
              className="fas fa-university me-2"
              style={{ color: 'var(--primary-color)' }}
            ></i>
            {secureMode ? 'SecureBank' : 'Hackable Bank'}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                <i className="fas fa-home me-1"></i>
                Home
              </Nav.Link>
              {!user && (
                <Nav.Link as={Link} to="/login">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login
                </Nav.Link>
              )}
              {!user && (
                <Nav.Link as={Link} to="/register">
                  <i className="fas fa-user-plus me-1"></i>
                  Register
                </Nav.Link>
              )}
              {user && (
                <Nav.Link as={Link} to="/dashboard">
                  <i className="fas fa-tachometer-alt me-1"></i>
                  Dashboard
                </Nav.Link>
              )}
              {user && (
                <Nav.Link as={Link} to="/account">
                  <i className="fas fa-search me-1"></i>
                  Account Lookup
                </Nav.Link>
              )}
              {user && (
                <Nav.Link as={Link} to="/transfer">
                  <i className="fas fa-exchange-alt me-1"></i>
                  Money Transfer
                </Nav.Link>
              )}
              {user?.role === 'admin' && (
                <Nav.Link as={Link} to="/admin">
                  <i className="fas fa-user-shield me-1"></i>
                  Admin
                </Nav.Link>
              )}
            </Nav>
            <div className="d-flex align-items-center">
              {user && (
                <div className="text-light me-3">
                  <i className="fas fa-user-circle me-1"></i>
                  {user.username}
                </div>
              )}
              <Form className="d-flex me-3">
                <Form.Check
                  type="switch"
                  id="secure-mode-switch"
                  label={
                    <span className="text-white">
                      <i className="fas fa-shield-alt me-1"></i>
                      Secure Mode
                    </span>
                  }
                  checked={secureMode}
                  onChange={() => setSecureMode(!secureMode)}
                />
              </Form>
              {user && (
                <Button
                  variant="outline-light"
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Logout
                </Button>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="main-content">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            dismissible
            onClose={() => {
              setAlerts(prev => prev.filter(a => a.id !== alert.id));
            }}
          >
            {alert.message}
          </Alert>
        ))}

        <Routes>
          <Route path="/" element={<HomePage user={user} secureMode={secureMode} />} />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <LoginPage secureMode={secureMode} addAlert={addAlert} setUser={setUser} />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? <Navigate to="/dashboard" /> : <RegisterPage addAlert={addAlert} secureMode={secureMode} />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === 'admin' ? (
                  <Navigate to="/admin" />
                ) : (
                  <DashboardPage user={user} secureMode={secureMode} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/account"
            element={user ? <AccountPage user={user} secureMode={secureMode} /> : <Navigate to="/login" />}
          />
          <Route
            path="/transfer"
            element={user ? <TransferPage user={user} secureMode={secureMode} /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user?.role === 'admin' ? <AdminPage secureMode={secureMode} /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;