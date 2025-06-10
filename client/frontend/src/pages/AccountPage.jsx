// import './AccountPage.css';
import { useState } from 'react';
import { Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';

function AccountPage({ user, secureMode }) {
  const [lookupUser, setLookupUser] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const attackExamples = [
    "' UNION SELECT username, password, balance, role, email, full_name, created_at, 1 FROM users --",
    "' OR 1=1 --",
    "' OR 'a'='a",
    "' OR EXISTS(SELECT 1) --"
  ];

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAccount(null);
    try {
      const res = await fetch(`http://localhost:3001/api/accounts/${lookupUser}?secureMode=${secureMode}`);
      const data = await res.json();
      if (res.ok) {
        setAccount(data);
      } else {
        setError(data.error || 'Account not found');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-container">
      <div className="account-grid">
        {/* Account Lookup Form */}
        <div className="account-form-section">
          <div className="account-card">
            <div className="account-header">
              <div className="account-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="account-title">
                {secureMode ? 'Secure Account Lookup' : 'Hackable Account Lookup'}
              </h2>
              <p className="account-subtitle">
                {secureMode ? 'Protected account lookup' : 'Vulnerable to SQL injection attacks'}
              </p>
            </div>
            <form onSubmit={handleLookup} className="account-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={lookupUser}
                  onChange={e => setLookupUser(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter username to lookup"
                />
              </div>
              <button
                type="submit"
                className="account-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    Looking up...
                  </div>
                ) : (
                  'Lookup Account'
                )}
              </button>
            </form>
            {error && <div className="mt-3 text-danger text-center">{error}</div>}
            {account && (
              <div className="account-table-container">
                <table className="account-table">
                  <tbody>
                    <tr>
                      <th>Username</th>
                      <td>{account.username}</td>
                    </tr>
                    <tr>
                      <th>Balance</th>
                      <td>${account.balance.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* Information Panel */}
        <div className="info-panel">
          <div className={`security-card ${secureMode ? 'secure' : 'vulnerable'}`}>
            <div className="security-header">
              <div className={`security-icon ${secureMode ? 'secure' : 'vulnerable'}`}>{secureMode ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}</div>
              <div>
                <h3 className="security-title">
                  {secureMode ? 'Defense Mechanism' : 'Security Vulnerability'}
                </h3>
                <p className="security-description">
                  {secureMode ? (
                    <>Account lookup uses <strong>parameterized queries</strong> to prevent SQL injection and UNION-based attacks.</>
                  ) : (
                    <>This lookup is <strong>vulnerable to SQL injection</strong>! Try a UNION-based attack.</>
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
                    onClick={() => setLookupUser(example)}
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
                    These payloads manipulate the SQL query structure, potentially bypassing authentication or revealing sensitive data from the database.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;