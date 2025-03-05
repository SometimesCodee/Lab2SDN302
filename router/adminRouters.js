const express = require('express');
const adminRouter = express.Router();

const {
    getAllCategory,
    addNewCategory,
    deleteCategory,
    updateCategory,
    getAllProduct,
    addNewProduct,
    deleteProduct,
    updateProduct,
    getProductById,
    updateOrderStatus,
    confirmOder,
    cancelOrder,
    getOrderById,
    updateOrderStatusForAdmin,
    manageOrders,
    getRevenue
} =  require('../controllers/adminController');

adminRouter.get('/category', getAllCategory);
adminRouter.post('/category', addNewCategory);
adminRouter.delete('/category/:id', deleteCategory);
adminRouter.put('/category/:id', updateCategory);
adminRouter.get('/product', getAllProduct);
adminRouter.post('/product', addNewProduct);
adminRouter.delete('/product/:id', deleteProduct);
adminRouter.put('/product/:id', updateProduct);
adminRouter.get('/product/:id', getProductById);
adminRouter.put('/order/:id', updateOrderStatus);
adminRouter.put('/order/confirm/:id', confirmOder);
adminRouter.put('/order/cancel/:id', cancelOrder);
adminRouter.get('/order/:id', getOrderById);
adminRouter.put('/order/update-status', updateOrderStatusForAdmin);
adminRouter.get('/order-management', manageOrders);
adminRouter.get('/revenue', getRevenue);

module.exports = adminRouter;