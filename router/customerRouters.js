const express = require('express');
const customerRouter = express.Router();

const {
    getAllProduct,
    getProductById,
    addToCart,
    removeFromCart,
    cancelOrder,
    placeOrder,
    getOrdersByUser,
    addUserAddress,
    getUserAddress,
    updateUserAddress,
    deleteUserAddress
} =  require('../controllers/customerController');

customerRouter.get('/product', getAllProduct);
customerRouter.get('/product/:id', getProductById);
customerRouter.post('/cart', addToCart);
customerRouter.delete('/cart', removeFromCart);
customerRouter.delete('/order', cancelOrder);
customerRouter.post('/order', placeOrder);
customerRouter.get('/order/:customerId', getOrdersByUser);
customerRouter.post("/address/:userId", addUserAddress );
customerRouter.get("/address/:userId", getUserAddress);
customerRouter.put("/address/:userId/:addressId", updateUserAddress);
customerRouter.delete("/address/:userId/:addressId", deleteUserAddress);

module.exports = customerRouter;