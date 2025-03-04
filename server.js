require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const {json, urlencoded} = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const rootRouter = require('./router/rootRouter');

// Middleware
app.use(morgan('dev'));
app.use(json());
app.use(urlencoded({extended: true}));

connectDB();

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

// API routes
app.use('/api', rootRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'is set' : 'is not set');
});