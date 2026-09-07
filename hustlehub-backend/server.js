const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors()); // Enables Cross-Origin Resource Sharing for frontend requests
app.use(express.json()); // Middleware to parse incoming JSON payloads

// Basic health check route
app.get('/', (req, res) => {
  res.send('HustleHub API is running...');
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});