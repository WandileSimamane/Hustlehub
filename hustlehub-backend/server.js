const express = require('express');
<<<<<<< HEAD
const cors = require('cors');
=======
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

>>>>>>> 83ce2fede567860932e7fda074c55638cbc20c93
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorMiddleware');

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

<<<<<<< HEAD
// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
=======
// Global Error Handler must be registered AFTER all routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Read the locally generated SSL certificate and key
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

// Spin up the HTTPS server instead of standard HTTP
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Secure Hustlehub+ server running on https://localhost:${PORT}`);
>>>>>>> 83ce2fede567860932e7fda074c55638cbc20c93
});