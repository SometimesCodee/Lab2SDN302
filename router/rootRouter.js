const express = require('express');
const rootRouter = express.Router();
const adminRouter = require('./adminRouters');
const customerRouter = require('./customerRouters');

rootRouter.use('/admin', adminRouter);
rootRouter.use('/customer', customerRouter);

module.exports = rootRouter; 