// hustlehub-backend/server.js
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

// 1. Initialize Express App FIRST
const app = express();

// 2. Import Routes AFTER app creation
const authRoutes = require('./src/routes/authRoutes');
const gigRoutes = require('./src/routes/gigRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const errorHandler = require('./src/middleware/errorMiddleware');

// 3. Middleware
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

// 4. Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB database'))
    .catch((err) => console.error('MongoDB connection error:', err));

// 5. Routes
app.get('/', (req, res) => {
    res.send('HustleHub API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bookings', bookingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Secure Hustlehub+ server running on https://localhost:${PORT}`);
});