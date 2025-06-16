import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // We'll create this CSS file

const LoginPage = ({ secureMode, addAlert, setUser }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [attackExamples] = useState([
    "admin' -- ",
    "' OR '1'='1",
    "' OR 1=1 --",
  "admin' AND SUBSTRING(password,1,1)='a' -- ",
  
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, secureMode })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        addAlert('Login successful!', 'success');

        const role = data.user;
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        addAlert(data.error || 'Login failed', 'danger');
      }
    } catch (err) {
      addAlert('Network error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-grid">
        
        {/* Login Form */}
        <div className="login-form-section">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="login-title">
                {secureMode ? 'Secure Login' : 'Hackable Login'}
              </h2>
              <p className="login-subtitle">
                {secureMode ? 'Protected authentication system' : 'Vulnerable to SQL injection attacks'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="form-input"
                  placeholder="Enter your username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  // type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    Logging in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Information Panel */}
        <div className="info-panel">
          {/* Security Info */}
          <div className={`security-card ${secureMode ? 'secure' : 'vulnerable'}`}>
            <div className="security-header">
              <div className={`security-icon ${secureMode ? 'secure' : 'vulnerable'}`}>
                {secureMode ? (
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="security-title">
                  {secureMode ? 'Defense Mechanism' : 'Security Vulnerability'}
                </h3>
                <p className="security-description">
                  {secureMode ? (
                    <>
                      This login uses <strong>parameterized queries</strong> (prepared statements) to prevent SQL injection. 
                      User input is never directly concatenated into SQL queries.
                    </>
                  ) : (
                    <>
                      This login is <strong>vulnerable to SQL injection</strong>! The system directly concatenates user input 
                      into SQL queries without proper sanitization.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Attack Examples */}
          {!secureMode && (
            <div className="examples-card">
              <div className="examples-header">
                <div className="examples-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="examples-title">SQL Injection Examples</h3>
                  <p className="examples-subtitle">Click any example to auto-fill the form</p>
                </div>
              </div>

              <div className="examples-list">
                {attackExamples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setUsername(example);
                      setPassword('anything');
                    }}
                    className="example-button"
                  >
                    <code className="example-code">{example}</code>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="info-tip">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="tip-title">How it works:</p>
                  <p className="tip-description">
                    These payloads manipulate the SQL query structure, potentially bypassing authentication 
                    or revealing sensitive data from the database.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;