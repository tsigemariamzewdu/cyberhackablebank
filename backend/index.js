const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection for MAMP
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'hackable_bank',
  port: 3306, // MAMP's default MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // Enable multiple statements for SQL injection testing
});

// Initialize database tables
async function initializeDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to MySQL via MAMP");

    // Create users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0,
        role VARCHAR(20) DEFAULT 'user',
        email VARCHAR(100),
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_user VARCHAR(50) NOT NULL,
        to_user VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create admin user if not exists
    const [adminCheck] = await conn.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (adminCheck.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await conn.query(
        'INSERT INTO users (username, password, balance, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 10000, 'admin']
      );
      console.log('👑 Admin user created');
    }
    conn.release();
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
}

initializeDatabase();
// ... existing code ...

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, email, full_name, secureMode } = req.body;
  try {
    const conn = await pool.getConnection();
    const [existing] = await conn.query('SELECT 1 FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Username already taken' });
    }
    console.log('secureMode received:', secureMode);
    let toStore = password;
    if (secureMode === true || secureMode === 'true') {
      toStore = await bcrypt.hash(password, 10);
    }
    await conn.query(
      'INSERT INTO users (username, password, email, full_name) VALUES (?, ?, ?, ?)',
      [username, toStore, email, full_name]
    );
    conn.release();
    res.json({ message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password, secureMode } = req.body;
  console.log(secureMode)
  try {
    const conn = await pool.getConnection();
    if (secureMode === 'true' || secureMode==true) {
      // Secure version
      const [result] = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
      console.log(result)
      const user = result[0];
      if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        conn.release();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ username: user.username, role: user.role }, 'your-secret-key');
      conn.release();
      res.json({ token, user: { username: user.username, role: user.role } });
    } else {
      // Insecure: check plain text
      const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      console.log('Executing query:', query);
      const [result] = await conn.query(query);
      const user = result[0];
      if (!user) {
        conn.release();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ username: user.username, role: user.role }, 'your-secret-key');
      conn.release();
      res.json({ token, user: { username: user.username, role: user.role } });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// // Apply security middleware globally or to specific routes
// app.use(helmet()); // Basic security headers (part of WAF approach)

// // Rate limiting (part of WAF approach)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 login attempts per window
//   message: 'Too many login attempts, please try again later'
// });

// Input validation middleware
const validateLoginInput = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Secure login route with added protections
app.post('/api/login', validateLoginInput, async (req, res) => {
  const { username, password, secureMode } = req.body;
  
  try {
    const conn = await pool.getConnection();
    
    if (secureMode === 'true' || secureMode === true) {
      // Secure version with all protections
      const [result] = await conn.query(
        'SELECT * FROM users WHERE username = ?', 
        [username]
      );
      
      const user = result[0];
      if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
        conn.release();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { username: user.username, role: user.role }, 
        'your-secret-key',
        { expiresIn: '1h' } // Token expiration
      );
      
      conn.release();
      res.json({ 
        token, 
        user: { 
          username: user.username, 
          role: user.role 
        } 
      });
    } else {
      // Insecure version remains untouched
      const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      console.log('Executing query:', query);
      const [result] = await conn.query(query);
      const user = result[0];
      if (!user) {
        conn.release();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ username: user.username, role: user.role }, 'your-secret-key');
      conn.release();
      res.json({ token, user: { username: user.username, role: user.role } });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ... existing code ...

// Account lookup endpoint
app.get('/api/accounts/:username', async (req, res) => {
  const { username } = req.params;
  const { secureMode } = req.query;
  try {
    const conn = await pool.getConnection();
    if (secureMode === 'true') {
      // Secure version
      const [result] = await conn.query('SELECT username, balance FROM users WHERE username = ?', [username]);
      const account = result[0];
      if (!account) {
        conn.release();
        return res.status(404).json({ error: 'Account not found' });
      }
      conn.release();
      res.json(account);
    } else {
      // Vulnerable version
      const query = `SELECT * FROM users WHERE username = '${username}'`;
      console.log('⚠️ Executing vulnerable query:', query);
      const [result] = await conn.query(query);
      console.log(result[0])
      if (!result || result.length === 0) {
        conn.release();
        return res.status(404).json({ error: 'Account not found' });
      }
      conn.release();
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfer endpoint
app.post('/api/transfer', async (req, res) => {
  const { fromUser, toUser, amount, secureMode } = req.body;
  const conn = await pool.getConnection();
  
  try {
    if (secureMode === 'true') {
      // Secure version with transaction
      await conn.beginTransaction();
      
      // Check sender balance
      const [sender] = await conn.query(
        'SELECT balance FROM users WHERE username = ? FOR UPDATE', 
        [fromUser]
      );
      
      if (!sender[0] || sender[0].balance < amount) {
        await conn.rollback();
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      // Check recipient exists
      const [recipient] = await conn.query(
        'SELECT 1 FROM users WHERE username = ?', 
        [toUser]
      );
      
      if (recipient.length === 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'Recipient not found' });
      }

      // Execute transfers
      await conn.query(
        'UPDATE users SET balance = balance - ? WHERE username = ?',
        [amount, fromUser]
      );
      
      await conn.query(
        'UPDATE users SET balance = balance + ? WHERE username = ?',
        [amount, toUser]
      );
      
      await conn.query(
        'INSERT INTO transactions (from_user, to_user, amount) VALUES (?, ?, ?)',
        [fromUser, toUser, amount]
      );
      
      await conn.commit();
      res.json({ message: 'Transfer successful' });
    } else {
      // Vulnerable version - execute statements separately but still vulnerable to SQLi
      // Vulnerable query 1 - check balance and deduct
      await conn.query(
        `UPDATE users SET balance = balance - ${amount} WHERE username = '${fromUser}' AND balance >= ${amount}`
      );
      
      // Vulnerable query 2 - add to recipient
      await conn.query(
        `UPDATE users SET balance = balance + ${amount} WHERE username = '${toUser}'`
      );
      
      // Vulnerable query 3 - record transaction
      await conn.query(
        `INSERT INTO transactions (from_user, to_user, amount) VALUES ('${fromUser}', '${toUser}', ${amount})`
      );
      
      res.json({ message: 'Transfer successful' });
    }
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Get user transactions
app.get('/api/transactions/:username', async (req, res) => {
  const { username } = req.params;
  const { secureMode } = req.query;
  try {
    const conn = await pool.getConnection();
    if (secureMode === 'true') {
      // Secure version
      const [result] = await conn.query(
        'SELECT * FROM transactions WHERE from_user = ? OR to_user = ? ORDER BY timestamp DESC LIMIT 10',
        [username, username]
      );
      conn.release();
      res.json(result);
    } else {
      // Vulnerable version
      const query = `SELECT * FROM transactions WHERE from_user = '${username}' OR to_user = '${username}' ORDER BY timestamp DESC LIMIT 10`;
      console.log('⚠️ Executing vulnerable query:', query);
      const [result] = await conn.query(query);
      conn.release();
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  const { secureMode } = req.query;
  try {
    const conn = await pool.getConnection();
    if (secureMode === 'true') {
      // Secure version
      const [result] = await conn.query('SELECT username, role, balance, email, full_name, created_at FROM users');
      conn.release();
      res.json(result);
    } else {
      // Vulnerable version
      const query = 'SELECT * FROM users';
      console.log('⚠️ Executing vulnerable query:', query);
      const [result] = await conn.query(query);
      conn.release();
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/transactions', async (req, res) => {
  const { secureMode } = req.query;
  try {
    const conn = await pool.getConnection();
    if (secureMode === 'true') {
      // Secure version
      const [result] = await conn.query('SELECT * FROM transactions ORDER BY timestamp DESC');
      conn.release();
      res.json(result);
    } else {
      // Vulnerable version
      const query = 'SELECT * FROM transactions ORDER BY timestamp DESC';
      console.log('⚠️ Executing vulnerable query:', query);
      const [result] = await conn.query(query);
      conn.release();
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});