import { useState } from 'react';

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
    <div className="account-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div className="account-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Account Lookup Form */}
        <div className="account-form-section">
          <div className="account-card" style={{ 
            background: '#fff', 
            borderRadius: '8px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
            padding: '20px'
          }}>
            <div className="account-header" style={{ marginBottom: '20px' }}>
              <div className="account-icon" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '48px', 
                height: '48px', 
                background: '#f0f5ff', 
                borderRadius: '50%', 
                marginBottom: '10px'
              }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="account-title" style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                margin: '0 0 5px 0'
              }}>
                {secureMode ? 'Secure Account Lookup' : 'Hackable Account Lookup'}
              </h2>
              <p className="account-subtitle" style={{ 
                color: '#666', 
                margin: '0'
              }}>
                {secureMode ? 'Protected account lookup' : 'Vulnerable to SQL injection attacks'}
              </p>
            </div>
            <form onSubmit={handleLookup} className="account-form">
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label" style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: '500'
                }}>Username</label>
                <input
                  type="text"
                  value={lookupUser}
                  onChange={e => setLookupUser(e.target.value)}
                  required
                  className="form-input"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    fontSize: '14px'
                  }}
                  placeholder="Enter username to lookup"
                />
              </div>
              <button
                type="submit"
                className="account-button"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#4a6cf7', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid rgba(255,255,255,0.3)', 
                      borderTopColor: 'white', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Looking up...
                  </>
                ) : (
                  'Lookup Account'
                )}
              </button>
            </form>
            {error && <div style={{ 
              marginTop: '15px', 
              color: '#e53e3e', 
              textAlign: 'center', 
              padding: '10px', 
              background: '#fff5f5', 
              borderRadius: '4px'
            }}>{error}</div>}
            {account && (
              <div className="account-table-container" style={{ marginTop: '20px' }}>
                <table className="account-table" style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse'
                }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <th style={{ 
                        padding: '10px', 
                        textAlign: 'left', 
                        width: '30%'
                      }}>Username</th>
                      <td style={{ padding: '10px' }}>{account.username}</td>
                    </tr>
                    <tr>
                      <th style={{ 
                        padding: '10px', 
                        textAlign: 'left'
                      }}>Balance</th>
                     <td style={{ padding: '10px' }}>${parseFloat(account.balance || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* Information Panel */}
        <div className="info-panel">
          <div className={`security-card ${secureMode ? 'secure' : 'vulnerable'}`} style={{ 
            background: '#fff', 
            borderRadius: '8px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div className="security-header" style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px'
            }}>
              <div className={`security-icon ${secureMode ? 'secure' : 'vulnerable'}`} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '36px', 
                height: '36px', 
                background: secureMode ? '#f0fff4' : '#fff5f5', 
                borderRadius: '50%',
                flexShrink: '0'
              }}>{secureMode ? (
                <svg width="20" height="20" fill="none" stroke="#38a169" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="#e53e3e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}</div>
              <div>
                <h3 className="security-title" style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '600', 
                  margin: '0 0 5px 0'
                }}>
                  {secureMode ? 'Defense Mechanism' : 'Security Vulnerability'}
                </h3>
                <p className="security-description" style={{ 
                  color: '#666', 
                  margin: '0',
                  fontSize: '0.9rem'
                }}>
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
            <div className="examples-card" style={{ 
              background: '#fff', 
              borderRadius: '8px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
              padding: '20px'
            }}>
              <div className="examples-header" style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                marginBottom: '15px'
              }}>
                <div className="examples-icon" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '36px', 
                  height: '36px', 
                  background: '#fff7ed', 
                  borderRadius: '50%',
                  flexShrink: '0'
                }}>
                  <svg width="18" height="18" fill="none" stroke="#dd6b20" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="examples-title" style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: '600', 
                    margin: '0 0 5px 0'
                  }}>SQL Injection Examples</h3>
                  <p className="examples-subtitle" style={{ 
                    color: '#666', 
                    margin: '0',
                    fontSize: '0.9rem'
                  }}>Click any example to auto-fill the form</p>
                </div>
              </div>
              <div className="examples-list" style={{ 
                display: 'grid', 
                gap: '10px',
                marginBottom: '20px'
              }}>
                {attackExamples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setLookupUser(example)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '10px 12px', 
                      background: '#f7fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <code style={{ 
                      fontSize: '0.8rem', 
                      color: '#4a5568', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis'
                    }}>{example}</code>
                    <svg width="16" height="16" fill="none" stroke="#718096" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="info-tip" style={{ 
                display: 'flex', 
                gap: '12px', 
                padding: '12px', 
                background: '#f0f9ff', 
                borderRadius: '4px'
              }}>
                <svg width="18" height="18" fill="none" stroke="#3182ce" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="tip-title" style={{ 
                    fontWeight: '500', 
                    margin: '0 0 5px 0',
                    fontSize: '0.9rem'
                  }}>How it works:</p>
                  <p className="tip-description" style={{ 
                    color: '#4a5568', 
                    margin: '0',
                    fontSize: '0.85rem'
                  }}>
                    These payloads manipulate the SQL query structure, potentially bypassing authentication or revealing sensitive data from the database.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AccountPage;