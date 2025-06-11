const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/hackable-bank', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  role: { type: String, default: 'user' },
  fullName: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  fromUser: { type: String, required: true },
  toUser: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Initialize admin user
async function initializeAdmin() {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        balance: 10000,
        role: 'admin'
      });
      console.log('Admin user created');
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }
}

initializeAdmin();

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, email, fullName, secureMode } = req.body;
  
  try {
    if (secureMode) {
      // Secure registration
      const user = await User.create({
        username,
        password,
        email,
        fullName
      });
      res.json({ message: 'Registration successful' });
    } else {
      // Vulnerable registration - using string concatenation for demo
      const query = `db.users.insertOne({
        username: "${username}",
        password: "${password}",
        email: "${email}",
        fullName: "${fullName}"
      })`;
      
      // Execute the vulnerable query
      await User.create({
        username,
        password,
        email,
        fullName
      });
      res.json({ message: 'Registration successful' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password, secureMode } = req.body;
  
  try {
    if (secureMode) {
      // Secure login
      const user = await User.findOne({ username, password });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ message: 'Login successful', user: { id: user._id, username: user.username, balance: user.balance, role: user.role } });
    } else {
      // Vulnerable login - using string concatenation for demo
      // This simulates a vulnerable SQL query that would be used in a SQL database
      const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      console.log('Vulnerable query:', query);
      
      // For vulnerable mode, we'll use a very permissive query
      // This simulates a SQL injection vulnerability
      let user;
      
      // Handle SQL injection style payloads
      if (username.includes("'") || username.includes("--")) {
        // If username contains SQL injection characters, just find by username
        user = await User.findOne({ username: username.split("'")[0] });
      } else {
        // Normal case - try to find by username
        user = await User.findOne({
          $or: [
            { username: username },
            { username: { $regex: new RegExp(username, 'i') } }
          ]
        });
      }
      
      if (!user) {
        console.log('No user found for username:', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // In vulnerable mode, we'll bypass the password check
      // This simulates a successful SQL injection
      console.log('Found user:', user.username);
      
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user._id, 
          username: user.username, 
          balance: user.balance, 
          role: user.role 
        } 
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Account lookup endpoint
app.get('/api/accounts/:username', async (req, res) => {
  const { username } = req.params;
  const { secureMode } = req.query;
  
  try {
    if (secureMode === 'true') {
      // Secure version
      const account = await User.findOne({ username }, 'username balance');
      if (!account) return res.status(404).json({ error: 'Account not found' });
      res.json(account);
    } else {
      // Vulnerable version - using string concatenation for demo
      const query = `db.users.find({
        username: "${username}"
      })`;
      
      const accounts = await User.find({ username }, 'username balance');
      if (!accounts || accounts.length === 0) return res.status(404).json({ error: 'Account not found' });
      res.json(accounts.length === 1 ? accounts[0] : accounts);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfer endpoint
app.post('/api/transfer', async (req, res) => {
  const { fromUser, toUser, amount, secureMode } = req.body;
  
  try {
    if (secureMode) {
      // Secure transfer using transactions
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        const sender = await User.findOne({ username: fromUser }).session(session);
        if (!sender || sender.balance < amount) {
          throw new Error('Insufficient funds or invalid sender');
        }
        
        const recipient = await User.findOne({ username: toUser }).session(session);
        if (!recipient) {
          throw new Error('Recipient not found');
        }
        
        sender.balance -= amount;
        recipient.balance += amount;
        
        await sender.save({ session });
        await recipient.save({ session });
        
        await Transaction.create([{
          fromUser,
          toUser,
          amount
        }], { session });
        
        await session.commitTransaction();
        res.json({ message: 'Transfer successful' });
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } else {
      // Vulnerable transfer - using string concatenation for demo
      const query = `db.users.updateOne(
        { username: "${fromUser}" },
        { $inc: { balance: -${amount} } }
      )`;
      
      const sender = await User.findOne({ username: fromUser });
      if (!sender || sender.balance < amount) {
        return res.status(400).json({ error: 'Insufficient funds or invalid sender' });
      }
      
      const recipient = await User.findOne({ username: toUser });
      if (!recipient) {
        return res.status(400).json({ error: 'Recipient not found' });
      }
      
      sender.balance -= amount;
      recipient.balance += amount;
      
      await sender.save();
      await recipient.save();
      
      await Transaction.create({
        fromUser,
        toUser,
        amount
      });
      
      res.json({ message: 'Transfer successful' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user transactions
app.get('/api/transactions/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const transactions = await Transaction.find({
      $or: [{ fromUser: username }, { toUser: username }]
    }).sort({ timestamp: -1 });
    
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});