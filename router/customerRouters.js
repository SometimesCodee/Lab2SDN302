const express = require('express');
const customerRouter = express.Router();

const {
    getAllProduct,
    getProductById,
    cancelOrder,
    placeOrder,
    confirmDeliveredOrder
} =  require('../controllers/customerController');

customerRouter.get('/product', getAllProduct);
customerRouter.get('/product/:id', getProductById);
customerRouter.put('/order/:id', cancelOrder);
customerRouter.post('/order', placeOrder);
customerRouter.put('/order/confirm/:id', confirmDeliveredOrder);

module.exports = customerRouter;