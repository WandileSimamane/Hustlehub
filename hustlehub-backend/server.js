// server.js (or src/server.js depending on your folder structure)
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config(); 

const authRoutes = require('./src/routes/authRoutes');
const errorHandler = require('./src/middleware/errorMiddleware');

const app = express();

app.use(cors()); 
app.use(express.json()); 

// Prevent NoSQL Injection attacks globally
app.use(mongoSanitize());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB database'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('HustleHub API is running...');
});

app.use('/api/auth', authRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Secure Hustlehub+ server running on https://localhost:${PORT}`);
});