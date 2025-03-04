const express = require('express');
const customerRouter = express.Router();

const {
    getAllProduct,
    getProductById,
    cancelOrder,
    placeOrder
} =  require('../controllers/customerController');

customerRouter.get('/product', getAllProduct);
customerRouter.get('/product/:id', getProductById);
customerRouter.delete('/order', cancelOrder);
customerRouter.post('/order', placeOrder);

module.exports = customerRouter;