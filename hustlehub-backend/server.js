// hustlehub-backend/server.js
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./src/routes/authRoutes');
const gigRoutes = require('./src/routes/gigRoutes');
const errorHandler = require('./src/middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        writable: true,
        value: { ...req.query }
    });
    next();
});

// Prevent NoSQL Injection attacks globally
app.use(mongoSanitize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB database'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('HustleHub API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Secure Hustlehub+ server running on https://localhost:${PORT}`);
});