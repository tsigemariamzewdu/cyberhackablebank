const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/hackable-bank', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB!');
    
    // Test creating a user
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      password: String
    }));
    
    await User.create({
      username: 'test',
      password: 'test123'
    });
    console.log('Test user created successfully!');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection(); 