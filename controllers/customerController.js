const Category = require("../model/category");
const Product = require('../model/product');
const Order = require('../model/order');
const User = require('../model/user');

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


const placeOrder = async (req, res) => {
  try {
    const { userId, products, newAddress } = req.body;

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    // Tính tổng giá trị đơn hàng
    let totalPrice = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm ${item.productId} không tồn tại!` });
      }

      // Kiểm tra số lượng sản phẩm còn trong kho
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho!` });
      }

      // Cộng vào tổng giá trị đơn hàng
      totalPrice += product.price * item.quantity;

      // Giảm số lượng sản phẩm trong kho
      product.stock -= item.quantity;
      await product.save(); // Lưu thay đổi vào cơ sở dữ liệu
    }

    if (totalPrice <= 0) {
      return res.status(400).json({ message: 'Tổng giá trị đơn hàng phải lớn hơn 0!' });
    }

    // Kiểm tra địa chỉ
    let address = {};
    if (newAddress) {
      address = newAddress; // Sử dụng địa chỉ mới nếu có
    } else if (user.address.length > 0) {
      address = user.address[0]; // Mặc định sử dụng địa chỉ đầu tiên nếu không truyền
    } else {
      return res.status(400).json({ message: 'Không có địa chỉ giao hàng hợp lệ!' });
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      userId,
      orderDate: new Date(),
      totalPrice,
      products: products.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      address,
      status: 'pending'
    });

    // Lưu đơn hàng
    await newOrder.save();

    res.status(201).json({ message: 'Đặt hàng thành công!', order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi đặt hàng!', error });
  }
};

const cancelOrder = async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Đơn hàng không tồn tại!' });
      }
      if (order.status === 'shipped' || order.status === 'delivered') {
        return res.status(400).json({ message: 'Không thể hủy đơn hàng đã giao!' });
      }
      await Order.findByIdAndDelete(orderId);
      res.status(200).json({ message: 'Đơn hàng đã bị hủy!' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi hủy đơn hàng!', error });
    }
};

module.exports = {
    getAllProduct,
    getProductById,
    cancelOrder,
    placeOrder,
};