const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// login logout route
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// user route
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

// contract route
const contractRoutes = require('./routes/contract.routes');
app.use('/api/contracts', contractRoutes);

// query route
const queryRoutes = require('./routes/query.routes');
app.use('/api/queries', queryRoutes);

// admin payout route
const adminPayoutRoutes = require('./routes/adminpayout.routes');
app.use('/api/admin-payouts', adminPayoutRoutes);

// activity log route
const activityLogRoutes = require('./routes/activityLog.routes');
app.use('/api/activity-logs', activityLogRoutes);

module.exports = app;
