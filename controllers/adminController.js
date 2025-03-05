const Category = require("../model/category");
const Order = require("../model/order");
const Product = require('../model/product');
const getAllCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        if (!categories) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addNewCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new Category({ name, description });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



const getAllProduct = async (req, res) => {
    try {
        const products = await Product.find().populate('categoryId', 'name description');
        if (!products) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addNewProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId } = req.body;
        const product = new Product({
            name,
            description,
            price,
            stock,
            categoryId
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id).populate('categoryId', 'name description');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const confirmOder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = 'shipped';
        await order.save();
        res.status(200).json({ message: 'Order confirmed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('products.productId'); // Lấy chi tiết sản phẩm

        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại!' });
        }

        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({ message: 'Không thể hủy đơn hàng đã giao!' });
        }

        // Hoàn lại số lượng sản phẩm trong kho
        for (const item of order.products) {
            const product = item.productId;
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        await Order.findByIdAndUpdate(id, { status: 'cancelled' });

        res.status(200).json({ message: 'Đơn hàng đã bị hủy và số lượng hàng đã được hoàn lại!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi hủy đơn hàng!', error });
    }
};

const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await Order.findById(id)
            .populate({
                path: 'products.productId',
                select: 'name price categoryId'
            })
            .populate({
                path: 'userId',
                select: 'name email phone address'
            })
            .populate({
                path: 'products.productId.categoryId',
                select: 'name'
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Format lại orderDate
        const formattedOrderDate = order.orderDate.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Format lại địa chỉ
        const formattedAddress = `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}`;

        // Format lại danh sách sản phẩm
        const formattedProducts = order.products.map(item => ({
            name: item.productId.name,
            price: item.productId.price,
            category: item.productId.categoryId ? item.productId.categoryId.name : 'Unknown',
            quantity: item.quantity,
            total: item.productId.price * item.quantity
        }));

        res.status(200).json({
            _id: order._id,
            user: order.userId.name, // Chỉ lấy tên của user
            orderDate: formattedOrderDate,
            totalPrice: order.totalPrice,
            products: formattedProducts,
            status: order.status,
            address: formattedAddress,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy đơn hàng!', error });
    }
};



const updateOrderStatusForAdmin = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        console.info(`Updating order status for order ID ${orderId} to ${status}`);
        const order = await Order.findByIdAndUpdate(orderId, { status });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const manageOrders = async (req, res) => {
    try {
        const { status, searchValue, page = 1, perPage = 10 } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        if (searchValue) {
            query.$or = [
                { 'user.name': { $regex: searchValue, $options: 'i' } },
                { 'user.phone': { $regex: searchValue, $options: 'i' } },
                { 'user.email': { $regex: searchValue, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(perPage);
        const totalOrders = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(perPage));

        res.status(200).json({
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalOrders / parseInt(perPage)),
                totalItems: totalOrders,
                itemsPerPage: parseInt(perPage)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const matchStage = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) matchStage.createdAt.$lte = new Date(endDate);
        }

        const revenueData = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        status: "$status"
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            }
        ]);

        let totalRevenue = 0;
        let totalOrders = 0;
        let ordersByStatus = {};
        let revenueByDate = {};

        revenueData.forEach(({ _id, count, totalRevenue: revenue }) => {
            const { date, status } = _id;

            ordersByStatus[status] = (ordersByStatus[status] || 0) + count;
            totalOrders += count;
            if (status === "delivered") totalRevenue += revenue;

            if (!revenueByDate[date]) {
                revenueByDate[date] = { totalRevenue: 0, ordersByStatus: {} };
            }
            revenueByDate[date].ordersByStatus[status] = count;
            if (status === "delivered") {
                revenueByDate[date].totalRevenue += revenue;
            }
        });

        res.status(200).json({
            totalRevenue,
            totalOrders,
            ordersByStatus,
            revenueByDate
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
    getRevenue,
};