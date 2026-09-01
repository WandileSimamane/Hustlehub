const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Auth Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});