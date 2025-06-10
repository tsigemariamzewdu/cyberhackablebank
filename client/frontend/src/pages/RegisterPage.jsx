import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegistrationPage.css';

const RegisterPage = ({ addAlert, secureMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const attackExamples = [
    { payload: "alice' --", description: "Comment out validation" },
    { payload: "' OR '1'='1", description: "Always true condition" },
    { payload: "bob' /*", description: "Block comment injection" },
    { payload: "test@example.com' OR 1=1 --", description: "Email field injection" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, secureMode })
      });
      const data = await res.json();
      if (res.ok) {
        addAlert('Registration successful! You can now log in.', 'success');
        navigate('/login');
      } else {
        addAlert(data.error || 'Registration failed', 'danger');
      }
    } catch (err) {
      addAlert('Network error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillExample = (example) => {
    setFormData({ 
      ...formData, 
      username: example,
      email: example.includes('@') ? example : 'test@example.com',
      fullName: 'Test User',
      password: 'password123'
    });
  };

  return (
    <div className="register-container">
      <div className="register-content">
        
        {/* Registration Form */}
        <div className="register-form-section">
          <div className="register-card">
            <div className="register-header">
              <div className="register-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="register-title">
                {secureMode ? 'Secure Registration' : 'Hackable Registration'}
              </h2>
              <p className="register-subtitle">
                {secureMode ? 'Protected with parameterized queries' : 'Vulnerable to SQL injection attacks'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Choose a username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Create a secure password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    Creating Account...
                  </div>
                ) : (
                  <>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="register-footer">
              <p>Already have an account? 
                <Link to="/login" className="login-link">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="info-panel">
          {/* Security Status */}
          <div className={`security-card ${secureMode ? 'secure' : 'vulnerable'}`}>
            <div className="security-header">
              <div className={`security-icon ${secureMode ? 'secure' : 'vulnerable'}`}>
                {secureMode ? (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      Registration uses <strong>parameterized queries</strong> and <strong>input validation</strong> to prevent SQL injection and ensure data integrity.
                    </>
                  ) : (
                    <>
                      Registration is <strong>vulnerable to SQL injection</strong> due to direct SQL concatenation. Try using SQL injection payloads in the form fields!
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
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    onClick={() => fillExample(example.payload)}
                    className="example-button"
                  >
                    <div className="example-content">
                      <code className="example-code">{example.payload}</code>
                      <span className="example-description">{example.description}</span>
                    </div>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="info-tip">
                <div className="tip-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="tip-title">Registration Vulnerabilities:</p>
                  <p className="tip-description">
                    SQL injection in registration forms can lead to unauthorized account creation, data corruption, or complete database compromise.
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

export default RegisterPage;