const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet()); // Basic security headers

// Create two separate connection pools
const securePool = mysql.createPool({
  host: '127.0.0.1',
  user: 'bank_app_secure', // Limited privilege user
  password: 'secure_password',
  database: 'hackable_bank',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false // Disabled for security
});

const insecurePool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root', // Full privilege user
  password: 'root',
  database: 'hackable_bank',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // Enabled for SQL injection testing
});

// Function to get the appropriate pool based on mode
function getPool(secureMode) {
  return secureMode === true || secureMode === 'true' ? securePool : insecurePool;
}

// Initialize database tables (run once with admin privileges)
async function initializeDatabase() {
  let conn;
  try {
    conn = await insecurePool.getConnection();
    console.log("✅ Connected to MySQL with admin privileges");

    // Create database if not exists (commented out as it's created in your pool config)
    // await conn.query('CREATE DATABASE IF NOT EXISTS hackable_bank');
    // await conn.query('USE hackable_bank');

    // Create tables first
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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_user VARCHAR(50) NOT NULL,
        to_user VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Now create and configure the limited user
    await conn.query(`
      CREATE USER IF NOT EXISTS 'bank_app_secure'@'localhost' IDENTIFIED BY 'secure_password'
    `);
    
    // Grant privileges on existing tables
    await conn.query(`
      GRANT SELECT, INSERT, UPDATE ON hackable_bank.users TO 'bank_app_secure'@'localhost'
    `);
    
    await conn.query(`
      GRANT SELECT, INSERT ON hackable_bank.transactions TO 'bank_app_secure'@'localhost'
    `);

    // Flush privileges to apply changes
    await conn.query('FLUSH PRIVILEGES');

    // Insert test data
    const [adminCheck] = await conn.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (adminCheck.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await conn.query(
        'INSERT INTO users (username, password, balance, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 10000, 'admin']
      );
      console.log('👑 Admin user created');
    }

    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    throw err; // Re-throw to prevent app from starting with bad DB state
  } finally {
    if (conn) conn.release();
  }
}

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: 'Too many attempts, please try again later'
});

// Registration endpoint
app.post('/api/register', authLimiter, async (req, res) => {
  const { username, password, email, full_name, secureMode } = req.body;
  
  try {
    const pool = getPool(secureMode);
    const conn = await pool.getConnection();
    
    // Check if username exists
    const [existing] = await conn.query(
      'SELECT 1 FROM users WHERE username = ?', 
      [username]
    );
    
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password in secure mode
    const toStore = secureMode === true || secureMode === 'true' 
      ? await bcrypt.hash(password, 10) 
      : password;

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
app.post('/api/login', authLimiter, async (req, res) => {
  const { username, password, secureMode } = req.body;
  
  try {
    const pool = getPool(secureMode);
    const conn = await pool.getConnection();
    
    if (secureMode === true || secureMode === 'true') {
      // Secure version with input validation
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        conn.release();
        return res.status(400).json({ 
          error: 'Invalid username format' 
        });
      }
      
      const [result] = await conn.query(
        'SELECT * FROM users WHERE username = ?', 
        [username]
      );
      
      const user = result[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        conn.release();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { username: user.username, role: user.role }, 
        'your-secret-key',
        { expiresIn: '1h' }
      );
      
      conn.release();
      res.json({ 
        token,
        user: {
          username: user.username,
          role: user.role,
          balance: user.balance
        }
      });
    } else {
      // Insecure version
      const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      console.log('⚠️ Executing vulnerable query:', query);
      const [result] = await conn.query(query);
      
      if (!result || result.length === 0) {
        conn.release();
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { username: result[0].username, role: result[0].role }, 
        'your-secret-key'
      );
      
      conn.release();
      res.json({ 
        token,
        user: {
          username: result[0].username,
          role: result[0].role,
          balance: result[0].balance
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Account lookup endpoint
app.get('/api/accounts/:username', async (req, res) => {
  const { username } = req.params;
  const { secureMode } = req.query;
  
  try {
    const pool = getPool(secureMode);
    const conn = await pool.getConnection();
    
    if (secureMode === true || secureMode === 'true') {
      // Secure version
      const [result] = await conn.query(
        'SELECT username, balance FROM users WHERE username = ?',
        [username]
      );
      
      if (!result || result.length === 0) {
        conn.release();
        return res.status(404).json({ error: 'Account not found' });
      }
      
      conn.release();
      res.json(result[0]);
    } else {
      // Vulnerable version
      const query = `SELECT * FROM users WHERE username = '${username}'`;
      console.log('⚠️ Executing vulnerable query:', query);
      const [result] = await conn.query(query);
      
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
  
  try {
    const pool = getPool(secureMode);
    const conn = await pool.getConnection();
    
    if (secureMode === true || secureMode === 'true') {
      // Secure version with transaction
      await conn.beginTransaction();
      
      // Check sender balance
      const [sender] = await conn.query(
        'SELECT balance FROM users WHERE username = ? FOR UPDATE',
        [fromUser]
      );
      
      if (!sender[0] || sender[0].balance < amount) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      // Check recipient exists
      const [recipient] = await conn.query(
        'SELECT 1 FROM users WHERE username = ?',
        [toUser]
      );
      
      if (!recipient || recipient.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: 'Recipient not found' });
      }

      // Execute transfer
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
      conn.release();
      res.json({ message: 'Transfer successful' });
    } else {
      // Vulnerable version
      const checkSenderQuery = `SELECT balance FROM users WHERE username = '${fromUser}' AND balance >= ${amount}`;
      console.log('⚠️ Executing vulnerable query:', checkSenderQuery);
      const [balanceCheck] = await conn.query(checkSenderQuery);
      
      if (!balanceCheck || balanceCheck.length === 0) {
        conn.release();
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      // Perform transfer (vulnerable to SQLi)
      await conn.query(
        `UPDATE users SET balance = balance - ${amount} WHERE username = '${fromUser}'`
      );
      
      await conn.query(
        `UPDATE users SET balance = balance + ${amount} WHERE username = '${toUser}'`
      );
      
      await conn.query(
        `INSERT INTO transactions (from_user, to_user, amount) VALUES ('${fromUser}', '${toUser}', ${amount})`
      );
      
      conn.release();
      res.json({ message: 'Transfer successful' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user transactions
app.get('/api/transactions/:username', async (req, res) => {
  const { username } = req.params;
  const { secureMode } = req.query;
  
  try {
    const pool = getPool(secureMode);
    const conn = await pool.getConnection();
    
    if (secureMode === true || secureMode === 'true') {
      // Secure version
      const [result] = await conn.query(
        'SELECT * FROM transactions WHERE from_user = ? OR to_user = ? ORDER BY timestamp DESC',
        [username, username]
      );
      
      conn.release();
      res.json(result);
    } else {
      // Vulnerable version
      const query = `SELECT * FROM transactions WHERE from_user = '${username}' OR to_user = '${username}' ORDER BY timestamp DESC`;
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
    const pool = getPool(secureMode);
    const conn = await pool.getConnection();
    
    if (secureMode === true || secureMode === 'true') {
      // Secure version
      const [result] = await conn.query(
        'SELECT username, role, balance, email, full_name, created_at FROM users'
      );
      
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

// Development reset endpoint (remove in production)
app.post('/api/dev/reset', async (req, res) => {
  try {
    const conn = await insecurePool.getConnection();
    await conn.query('DROP TABLE IF EXISTS transactions');
    await conn.query('DROP TABLE IF EXISTS users');
    await conn.query('DROP USER IF EXISTS bank_app_secure@localhost');
    conn.release();
    
    await initializeDatabase();
    res.json({ message: 'Database reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server after ensuring DB is initialized
async function startServer() {
  try {
    await initializeDatabase();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize database, server not started');
    process.exit(1);
  }
}

startServer();