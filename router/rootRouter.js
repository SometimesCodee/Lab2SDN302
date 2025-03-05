const express = require('express');
const rootRouter = express.Router();
const adminRouter = require('./adminRouters');
const customerRouter = require('./customerRouters');
const authController = require('../controllers/authController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const authenticateToken = require('../middlewares/authenticateToken');

rootRouter.use('/admin', adminMiddleware,adminRouter);
rootRouter.use('/customer', authenticateToken,customerRouter);

rootRouter.post('/register', authController.register);
rootRouter.post('/login', authController.login);
rootRouter.post('/admin-login', authController.loginAdmin);

module.exports = rootRouter; 