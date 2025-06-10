import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage({ user }) {
  return (
    <div className="homepage">
      <div className="container">
        
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-icon">
            🏦
          </div>
          
          <h1>SecureBank</h1>
          
          <h2>
            Learn about <span className="highlight">SQL Injection</span> attacks and defenses
          </h2>
          
          <p>
            Practice cybersecurity in a safe environment. Toggle between secure and vulnerable modes 
            to understand how attacks work and how to prevent them.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="features">
          <div className="card">
            <div className="card-icon secure">🛡️</div>
            <h3>Secure Mode</h3>
            <p>See how proper security protects against SQL injection attacks.</p>
          </div>

          <div className="card">
            <div className="card-icon vulnerable">⚠️</div>
            <h3>Vulnerable Mode</h3>
            <p>Learn by trying real SQL injection attacks in a safe environment.</p>
          </div>

          <div className="card">
            <div className="card-icon lab">⚡</div>
            <h3>Attack Lab</h3>
            <p>Practice ethical hacking with guided tutorials and scenarios.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions">
          {!user && (
            <Link to="/register" className="btn primary">
              Get Started
            </Link>
          )}
          
          <Link to="/attack-lab" className="btn secondary">
            Try Attack Lab
          </Link>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat">
            <div className="number">100%</div>
            <div className="label">Safe Learning</div>
          </div>
          
          <div className="stat">
            <div className="number">10+</div>
            <div className="label">Attack Scenarios</div>
          </div>
          
          <div className="stat">
            <div className="number">Real-time</div>
            <div className="label">Security Feedback</div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>⚠️ Educational purposes only - Practice ethical hacking responsibly</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;