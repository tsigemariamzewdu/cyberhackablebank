import { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { 
  FiDownload, 
  FiArrowUpRight, 
  FiArrowDownLeft,
  FiShield,
  FiLock,
  FiClock,
  FiDollarSign,
  FiActivity,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
  FiFileText
} from 'react-icons/fi';
import { motion } from 'framer-motion';

function DashboardPage({ user }) {
  const [stats, setStats] = useState({
    balance: 12450.75,
    transactions: [
      {
        id: 1,
        date: 'Jan 15, 2024',
        description: 'Transfer from joint_doe',
        type: 'Deposit',
        amount: 250.00,
        status: 'Completed'
      },
      {
        id: 2,
        date: 'Jan 14, 2024',
        description: 'Transfer to jane_smith',
        type: 'Withdrawal',
        amount: -75.50,
        status: 'Completed'
      },
      {
        id: 3,
        date: 'Jan 13, 2024',
        description: 'Transfer from mike_wilson',
        type: 'Deposit',
        amount: 500.00,
        status: 'Completed'
      }
    ],
    accountStatus: 'Active'
  });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container fluid className="px-5 py-5 dashboard-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="mb-1 fw-bold display-6">
            Welcome back, <span className="text-gradient-primary">{user.username}</span>
          </h2>
          <p className="text-muted fs-5">Here's your financial overview</p>
        </div>
        <Button variant="outline-gradient" size="lg" className="rounded-pill shadow-sm">
          <FiRefreshCw className="me-2" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-5 mb-5">
        <Col md={4}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.35 }}>
            <Card className="border-0 shadow-lg h-100 stats-card-modern">
              <Card.Body className="p-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="icon-circle bg-gradient-primary shadow-sm me-3">
                    <FiDollarSign size={28} className="text-white" />
                  </div>
                  <h6 className="text-uppercase text-secondary mb-0 fw-semibold">Balance</h6>
                </div>
                <h2 className="fw-bold mb-3">${stats.balance.toFixed(2)}</h2>
                <p className="text-success fw-semibold fs-6 mb-0">
                  <Badge bg="success" className="me-2 fs-6 py-1 px-3 shadow-sm">+2.5%</Badge> from last month
                </p>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={4}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.35, delay: 0.15 }}>
            <Card className="border-0 shadow-lg h-100 stats-card-modern">
              <Card.Body className="p-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="icon-circle bg-gradient-info shadow-sm me-3">
                    <FiActivity size={28} className="text-white" />
                  </div>
                  <h6 className="text-uppercase text-secondary mb-0 fw-semibold">Transactions</h6>
                </div>
                <h2 className="fw-bold mb-3">{stats.transactions.length}</h2>
                <p className="text-success fw-semibold fs-6 mb-0">
                  <Badge bg="success" className="me-2 fs-6 py-1 px-3 shadow-sm">+12%</Badge> from last month
                </p>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={4}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.35, delay: 0.3 }}>
            <Card className="border-0 shadow-lg h-100 stats-card-modern">
              <Card.Body className="p-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="icon-circle bg-gradient-success shadow-sm me-3">
                    <FiCheckCircle size={28} className="text-white" />
                  </div>
                  <h6 className="text-uppercase text-secondary mb-0 fw-semibold">Status</h6>
                </div>
                <h2 className="fw-bold mb-3">{stats.accountStatus}</h2>
                <p className="text-muted fs-6 mb-0">Your account is in good standing</p>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Transactions Table */}
      <Row className="mb-5">
        <Col>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.45 }}>
            <Card className="border-0 shadow-lg">
              <Card.Header className="bg-transparent border-0 p-4 pb-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold fs-4">Recent Transactions</h5>
                <Button variant="outline-gradient" size="md" className="rounded-pill shadow-sm">
                  <FiDownload className="me-2" /> Export
                </Button>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="table-responsive">
                  <Table hover className="mb-0 modern-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th className="text-end">Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="text-muted">{transaction.date}</td>
                          <td>{transaction.description}</td>
                          <td>
                            <Badge
                              bg={transaction.type === 'Deposit' ? 'success' : 'danger'}
                              className="badge-pill px-3 py-1 fs-7"
                            >
                              {transaction.type}
                            </Badge>
                          </td>
                          <td
                            className={`text-end fw-semibold ${
                              transaction.amount > 0 ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {transaction.amount > 0 ? (
                              <FiArrowDownLeft className="me-1" />
                            ) : (
                              <FiArrowUpRight className="me-1" />
                            )}
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </td>
                          <td>
                            <Badge bg="success" className="badge-pill px-3 py-1 fs-7">
                              {transaction.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Quick Actions & Security */}
      <Row className="g-4">
        <Col md={6}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.1 }}>
            <Card className="border-0 shadow-lg h-100">
              <Card.Header className="bg-transparent border-0 p-4 pb-3">
                <h5 className="mb-0 fw-semibold fs-4">Quick Actions</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-grid gap-3">
                  <Button variant="gradient-primary" className="rounded-pill text-start py-3 fw-semibold fs-5">
                    <FiArrowUpRight className="me-3" size={22} />
                    Make a Transfer
                  </Button>
                  <Button variant="outline-gradient" className="rounded-pill text-start py-3 fw-semibold fs-5">
                    <FiSearch className="me-3" size={22} />
                    Account Lookup
                  </Button>
                  <Button variant="outline-gradient" className="rounded-pill text-start py-3 fw-semibold fs-5">
                    <FiFileText className="me-3" size={22} />
                    View Statements
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col md={6}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.2 }}>
            <Card className="border-0 shadow-lg h-100">
              <Card.Header className="bg-transparent border-0 p-4 pb-3">
                <h5 className="mb-0 fw-semibold fs-4">Security Status</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex flex-column gap-4">
                  <div className="d-flex align-items-center p-4 bg-gradient-light rounded shadow-sm">
                    <div className="icon-circle bg-gradient-primary me-4 shadow-sm">
                      <FiShield className="text-white" size={22} />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold">Account Security</h6>
                      <small className="text-muted fs-6">Your account is protected</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center p-4 bg-gradient-light rounded shadow-sm">
                    <div className="icon-circle bg-gradient-success me-4 shadow-sm">
                      <FiLock className="text-white" size={22} />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold">Password Strength</h6>
                      <small className="text-muted fs-6">Strong password in use</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center p-4 bg-gradient-light rounded shadow-sm">
                    <div className="icon-circle bg-gradient-info me-4 shadow-sm">
                      <FiClock className="text-white" size={22} />
                    </div>
                    <div>
                      <h6 className="mb-1 fw-semibold">Last Login</h6>
                      <small className="text-muted fs-6">Just now</small>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardPage;
