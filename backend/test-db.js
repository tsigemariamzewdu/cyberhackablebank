const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      port: 8889  // Default MAMP MySQL port
    });

    console.log('Successfully connected to MySQL!');
    
    // Test creating and using database
    await connection.query('CREATE DATABASE IF NOT EXISTS hackable_bank');
    await connection.query('USE hackable_bank');
    console.log('Database created/selected successfully!');
    
    // Test creating table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0.00,
        role VARCHAR(50) DEFAULT 'user',
        fullName VARCHAR(255),
        email VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table created successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection(); 