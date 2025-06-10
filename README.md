# Hackable Bank: SQL Injection Attack & Defense Lab

This project is an educational web application that demonstrates SQL injection attacks and their countermeasures in a controlled banking environment. It provides both a secure banking system and an intentionally vulnerable version for learning purposes.

## Features

### Secure Banking System
- User registration and authentication
- Account management dashboard
- Secure money transfers
- Account lookup functionality
- Admin panel for user management

### Attack Lab
- Authentication bypass demonstrations
- Data extraction using UNION-based attacks
- Blind SQL injection (boolean and time-based)
- Second-order SQL injection
- Real-time query visualization
- Example payloads for each attack type

### Security Features
- Parameterized queries
- Input validation and sanitization
- Web Application Firewall (WAF) rules
- Least privilege database access
- Secure session management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hackable-bank.git
cd hackable-bank
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../client/frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd ../client/frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Usage

### Secure Mode
- Toggle "Secure Mode" in the navigation bar
- All SQL injection attempts will be blocked
- Demonstrates proper security practices

### Attack Lab
1. Navigate to the Attack Lab page
2. Select an attack type from the tabs
3. Use provided example payloads or create your own
4. Execute attacks and observe results
5. Toggle between secure and insecure modes to see the difference

## Educational Value

This project serves as a hands-on learning tool for:
- Understanding SQL injection vulnerabilities
- Learning secure coding practices
- Practicing attack techniques in a safe environment
- Implementing defense mechanisms
- Understanding the impact of security measures

## Security Notice

This application is intentionally vulnerable when not in secure mode. It should only be used in a controlled environment for educational purposes. Do not deploy this application in a production environment or expose it to the internet.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on the SEED Labs framework
- Inspired by various security training materials
- Built with React and Express.js 