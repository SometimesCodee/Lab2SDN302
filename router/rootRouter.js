const express = require('express');
const rootRouter = express.Router();
const adminRouter = require('./adminRouters');
const customerRouter = require('./customerRouters');
const authController = require('../controllers/authController');

rootRouter.use('/admin', adminRouter);
rootRouter.use('/customer', customerRouter);

rootRouter.post('/register', authController.register);
rootRouter.post('/login', authController.login);

module.exports = rootRouter; 