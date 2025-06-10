const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const morgan = require('morgan');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Database setup
const db = new sqlite3.Database(':memory:');

// Initialize database with vulnerable schema
// db.serialize(() => {
//   db.run(`
//     CREATE TABLE users (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       username TEXT NOT NULL,
//       password TEXT NOT NULL,
//       balance REAL DEFAULT 0.0
//     )
//   `);

//   db.run(`
//     CREATE TABLE transactions (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       from_user TEXT NOT NULL,
//       to_user TEXT NOT NULL,
//       amount REAL NOT NULL,
//       timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
//     )
//   `);

//   // Insert some test data
//   db.run("INSERT INTO users (username, password, balance) VALUES ('alice', 'alice123', 1000)");
//   db.run("INSERT INTO users (username, password, balance) VALUES ('bob', 'bob456', 500)");
//   db.run("INSERT INTO users (username, password, balance) VALUES ('admin', 'supersecret', 10000)");
// });

// Update database initialization
db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      balance REAL DEFAULT 0.0,
      role TEXT DEFAULT 'user',
      full_name TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create admin user
  db.run("INSERT INTO users (username, password, balance, role) VALUES ('admin', 'admin123', 10000, 'admin')");

  db.run(`
    CREATE TABLE user_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});
app.post('/api/register', (req, res) => {
  const { username, password, email, fullName ,secureMode} = req.body;
  
  if (secureMode) {
    // Secure registration
    db.run(
      "INSERT INTO users (username, password, email, full_name) VALUES (?, ?, ?, ?)",
      [username, password, email, fullName],
      function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Registration successful' });
      }
    );
  } else {
    // Vulnerable registration
    const query = `INSERT INTO users (username, password, email, full_name) VALUES ('${username}', '${password}', '${email}', '${fullName}')`;
    db.run(query, function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Registration successful' });
    });
  }
});

// Vulnerable login endpoint (SQLi possible)
app.post('/api/login', (req, res) => {
  const { username, password, secureMode } = req.body;
  
  if (secureMode) {
    // Secure version
    db.get(
      "SELECT id, username, balance, role FROM users WHERE username = ? AND password = ?", 
      [username, password],
      (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        res.json({ message: 'Login successful', user });
      }
    );
  } else {
    // Vulnerable version
    const query = `SELECT id, username, balance, role FROM users WHERE username = '${username}' AND password = '${password}'`;
    db.get(query, (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ message: 'Login successful', user });
    });
  }
});

app.get('/api/accounts/:username', (req, res) => {
  const { username } = req.params;
  const { secureMode } = req.query;
  
  if (secureMode === 'true') {
    // Secure version - parameterized query
    db.get(
      "SELECT username, balance FROM users WHERE username = ?",
      [username],
      (err, account) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
      }
    );
  } else {
    // Vulnerable version - string concatenation
    const query = `SELECT username, balance FROM users WHERE username = '${username}'`;
    console.log('Executing vulnerable query:', query);
    
    // Use db.all instead of db.get to return multiple rows
    db.all(query, (err, accounts) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!accounts || accounts.length === 0) return res.status(404).json({ error: 'Account not found' });
      
      // Return all rows for UNION attacks
      res.json(accounts.length === 1 ? accounts[0] : accounts);
    });
  }
});
// Add authentication middleware
const authenticate = (req, res, next) => {
  // In a real app, you'd use proper session/JWT authentication
  // This is simplified for demonstration
  next();
};

// Admin users endpoint
app.get('/api/admin/users', authenticate, (req, res) => {
  if (secureMode) {
    db.all("SELECT * FROM users", [], (err, users) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(users);
    });
  } else {
    // Vulnerable version
    db.all("SELECT * FROM users", (err, users) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(users);
    });
  }
});
// Add this endpoint to get user transactions
app.get('/api/transactions/:username', (req, res) => {
  const { username } = req.params;
  
  db.all(
    `SELECT * FROM transactions 
     WHERE from_user = ? OR to_user = ? 
     ORDER BY timestamp DESC`,
    [username, username],
    (err, transactions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(transactions);
    }
  );
});

// Vulnerable transfer endpoint (second-order SQLi possible)
app.post('/api/transfer', (req, res) => {
  const { fromUser, toUser, amount, secureMode } = req.body;
  
  if (secureMode) {
    // Secure version with transaction and parameterized queries
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      // Check if sender has enough balance
      db.get(
        "SELECT balance FROM users WHERE username = ?",
        [fromUser],
        (err, sender) => {
          if (err) return rollback(res, err);
          if (!sender || sender.balance < amount) {
            return rollback(res, 'Insufficient funds or invalid sender');
          }
          
          // Update sender balance
          db.run(
            "UPDATE users SET balance = balance - ? WHERE username = ?",
            [amount, fromUser],
            (err) => {
              if (err) return rollback(res, err);
              
              // Update recipient balance
              db.run(
                "UPDATE users SET balance = balance + ? WHERE username = ?",
                [amount, toUser],
                (err) => {
                  if (err) return rollback(res, err);
                  
                  // Record transaction
                  db.run(
                    "INSERT INTO transactions (from_user, to_user, amount) VALUES (?, ?, ?)",
                    [fromUser, toUser, amount],
                    (err) => {
                      if (err) return rollback(res, err);
                      
                      db.run("COMMIT");
                      res.json({ message: 'Transfer successful' });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  } else {
    // Vulnerable version with string concatenation
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      
      // Vulnerable balance check
      const checkBalanceQuery = `SELECT balance FROM users WHERE username = '${fromUser}'`;
      db.get(checkBalanceQuery, (err, sender) => {
        if (err) return rollback(res, err);
        if (!sender || sender.balance < amount) {
          return rollback(res, 'Insufficient funds or invalid sender');
        }
        
        // Vulnerable update queries
        const updateSenderQuery = `UPDATE users SET balance = balance - ${amount} WHERE username = '${fromUser}'`;
        const updateRecipientQuery = `UPDATE users SET balance = balance + ${amount} WHERE username = '${toUser}'`;
        const recordTransactionQuery = `INSERT INTO transactions (from_user, to_user, amount) VALUES ('${fromUser}', '${toUser}', ${amount})`;
        
        db.run(updateSenderQuery, (err) => {
          if (err) return rollback(res, err);
          
          db.run(updateRecipientQuery, (err) => {
            if (err) return rollback(res, err);
            
            db.run(recordTransactionQuery, (err) => {
              if (err) return rollback(res, err);
              
              db.run("COMMIT");
              res.json({ message: 'Transfer successful' });
            });
          });
        });
      });
    });
  }
});

// Helper function for transaction rollback
function rollback(res, error) {
  db.run("ROLLBACK");
  res.status(500).json({ error: error.toString() });
}

// Blind SQL injection endpoint
app.get('/api/check-username', (req, res) => {
  const { username, secureMode } = req.query;
  
  if (secureMode === 'true') {
    // Secure version
    db.get(
      "SELECT COUNT(*) as exists FROM users WHERE username = ?",
      [username],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ exists: result.exists > 0 });
      }
    );
  } else {
    // Vulnerable version - boolean-based blind SQL injection
    const query = `SELECT COUNT(*) as exists FROM users WHERE username = '${username}'`;
    db.get(query, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ exists: result.exists > 0 });
    });
  }
});

// Time-based blind SQL injection endpoint
app.get('/api/check-admin', (req, res) => {
  const { username, secureMode } = req.query;
  
  if (secureMode === 'true') {
    // Secure version
    db.get(
      "SELECT role FROM users WHERE username = ?",
      [username],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ isAdmin: result && result.role === 'admin' });
      }
    );
  } else {
    // Vulnerable version - time-based blind SQL injection
    const query = `SELECT CASE WHEN (SELECT role FROM users WHERE username = '${username}') = 'admin' THEN 1 ELSE 0 END`;
    db.get(query, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ isAdmin: result === 1 });
    });
  }
});

// Second-order SQL injection endpoints
app.post('/api/comments', (req, res) => {
  const { username, comment, secureMode } = req.body;
  
  if (secureMode) {
    // Secure version
    db.run(
      "INSERT INTO user_comments (username, comment) VALUES (?, ?)",
      [username, comment],
      function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Comment added successfully' });
      }
    );
  } else {
    // Vulnerable version
    const query = `INSERT INTO user_comments (username, comment) VALUES ('${username}', '${comment}')`;
    db.run(query, function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Comment added successfully' });
    });
  }
});

// Get comments with second-order SQL injection vulnerability
app.get('/api/comments/:username', (req, res) => {
  const { username } = req.params;
  const { secureMode } = req.query;
  
  if (secureMode === 'true') {
    // Secure version
    db.all(
      "SELECT * FROM user_comments WHERE username = ?",
      [username],
      (err, comments) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(comments);
      }
    );
  } else {
    // Vulnerable version
    const query = `SELECT * FROM user_comments WHERE username = '${username}'`;
    db.all(query, (err, comments) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(comments);
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Hackable Bank backend running on http://localhost:${PORT}`);
});