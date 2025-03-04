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
    getProductById
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

module.exports = adminRouter;