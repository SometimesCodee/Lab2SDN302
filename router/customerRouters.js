const express = require('express');
const customerRouter = express.Router();

const {
    getAllProduct,
    getProductById,
    cancelOrder,
    placeOrder,
    confirmDeliveredOrder,
    getOrdersByUser,
    addUserAddress,
    getUserAddress,
    updateUserAddress,
    deleteUserAddress,
    getOrderById
} =  require('../controllers/customerController');

customerRouter.get('/product', getAllProduct);
customerRouter.get('/product/:id', getProductById);
customerRouter.put('/order/:id', cancelOrder);
customerRouter.post('/order', placeOrder);
customerRouter.put('/order/confirm/:id', confirmDeliveredOrder);
customerRouter.get('/order/:customerId', getOrdersByUser);
customerRouter.post("/address/:userId", addUserAddress );
customerRouter.get("/address/:userId", getUserAddress);
customerRouter.put("/address/:userId/:addressId", updateUserAddress);
customerRouter.delete("/address/:userId/:addressId", deleteUserAddress);
customerRouter.get("/orderdetail/:id", getOrderById);

module.exports = customerRouter;