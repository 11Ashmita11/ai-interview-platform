const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');  
 // add this line near the top
const mcqRoutes = require('./routes/mcq');   // add near the top
const codingRoutes = require('./routes/coding');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');
const contestRoutes = require('./routes/contests');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);   // add this line below the auth route
app.use('/api/mcq', mcqRoutes);   // add below the users route
app.use('/api/coding', codingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'AI Interview Platform API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});