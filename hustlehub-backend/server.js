const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Auth Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Read the locally generated SSL certificate and key
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

// Spin up the HTTPS server instead of standard HTTP
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Secure Hustlehub+ server running on https://localhost:${PORT}`);
});