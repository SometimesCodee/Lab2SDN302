const express = require('express');
const customerRouter = express.Router();

const {
    getAllProduct,
    getProductById,
    addToCart,
    removeFromCart,
    cancelOrder,
    placeOrder
} =  require('../controllers/customerController');

customerRouter.get('/product', getAllProduct);
customerRouter.get('/product/:id', getProductById);
customerRouter.post('/cart', addToCart);
customerRouter.delete('/cart', removeFromCart);
customerRouter.delete('/order', cancelOrder);
customerRouter.post('/order', placeOrder);

module.exports = customerRouter;