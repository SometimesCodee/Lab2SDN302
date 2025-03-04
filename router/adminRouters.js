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
adminRouter.put('/order/update-status', updateOrderStatusForAdmin);
adminRouter.get('/order/manage', manageOrders);
adminRouter.get('/revenue', getRevenue);

module.exports = adminRouter;