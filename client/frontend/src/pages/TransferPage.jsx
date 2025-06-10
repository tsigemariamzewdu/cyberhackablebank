// import './TransferPage.css';
import { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

function TransferPage({ user, secureMode }) {
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const attackExamples = [
    "ed'; UPDATE users SET balance = 10000 WHERE username = 'youruser' --",
    "bob'; DROP TABLE users; --",
    "alice' OR 1=1 --",
    "' OR EXISTS(SELECT 1) --"
  ];

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:3001/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUser: user.username,
          toUser,
          amount: parseFloat(amount),
          secureMode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Transfer successful!');
      } else {
        setError(data.error || '❌ Transfer failed');
      }
    } catch (err) {
      setError('❌ Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-container">
      <div className="transfer-grid">
        {/* Transfer Form */}
        <div className="transfer-form-section">
          <div className="transfer-card">
            <div className="transfer-header">
              <div className="transfer-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2M5 12h14M7 12v7a2 2 0 002 2h6a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h2 className="transfer-title">
                {secureMode ? 'Secure Money Transfer' : 'Hackable Money Transfer'}
              </h2>
              <p className="transfer-subtitle">
                {secureMode ? 'Protected money transfer' : 'Vulnerable to SQL injection attacks'}
              </p>
            </div>
            <form onSubmit={handleTransfer} className="transfer-form">
              <div className="form-group">
                <label className="form-label">Recipient Username</label>
                <input
                  type="text"
                  value={toUser}
                  onChange={e => setToUser(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter recipient username"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter amount"
                />
              </div>
              <button
                type="submit"
                className="transfer-button"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    Transferring...
                  </div>
                ) : (
                  'Transfer'
                )}
              </button>
            </form>
            {message && <div className="mt-3 text-success text-center">{message}</div>}
            {error && <div className="mt-3 text-danger text-center">{error}</div>}
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
                    <>Transfers use <strong>parameterized queries</strong> and <strong>transaction safety</strong> to prevent SQL injection and ensure atomicity.</>
                  ) : (
                    <>This transfer is <strong>vulnerable to SQL injection</strong> and <strong>second-order injection</strong>! Try SQLi in the recipient field.</>
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
                    onClick={() => setToUser(example)}
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

export default TransferPage;
