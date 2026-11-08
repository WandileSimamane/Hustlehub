// hustlehub-backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

// Local-network workaround: only runs if USE_PUBLIC_DNS=true is set in your own .env
if (process.env.USE_PUBLIC_DNS === 'true') {
    const dns = require('node:dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
}

// 1. Initialize Express App FIRST
const app = express();

// 2. Import Routes AFTER app creation
const authRoutes = require('./src/routes/authRoutes');
const gigRoutes = require('./src/routes/gigRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');        // MBALI
const securityHeaders = require('./src/middleware/securityHeaders');    // MBALI
const errorHandler = require('./src/middleware/errorMiddleware');

// 3. Middleware
app.use(securityHeaders); // MBALI: Helmet + CSP, first so every response gets the headers
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
const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://andiswa:kh6hrH6IknB67MQ6@cluster0.e03tiqd.mongodb.net/hustlehub?appName=Cluster0";

mongoose.connect(dbUri)
    .then(() => console.log('Connected to MongoDB database'))
    .catch((err) => console.error('MongoDB connection error:', err));

// 5. Routes
app.get('/', (req, res) => {
    res.send('HustleHub API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes); // MBALI

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Hustlehub+ server running on http://localhost:${PORT}`);
});