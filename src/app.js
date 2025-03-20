const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('../src/routes/authRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies

// Routes
app.use('/api/auth', authRoutes);

module.exports = app; // Export the app instance for testing and server setup