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
    // Tính tổng giá trị đơn hàng và thu thập thông tin sản phẩm
    let totalPrice = 0;
    let orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId).populate('categoryId', 'name');
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm ${item.productId} không tồn tại!` });
      }
      // Kiểm tra số lượng sản phẩm còn trong kho
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho!` });
      }
      // Cộng vào tổng giá trị đơn hàng
      const productTotal = product.price * item.quantity;
      totalPrice += productTotal;
      // Giảm số lượng sản phẩm trong kho
      product.stock -= item.quantity;
      await product.save();
      // Thu thập thông tin sản phẩm để trả về response
      orderProducts.push({
        name: product.name,
        quantity: item.quantity,
        total: productTotal
      });
    }
    if (totalPrice <= 0) {
      return res.status(400).json({ message: 'Tổng giá trị đơn hàng phải lớn hơn 0!' });
    }
    // Kiểm tra địa chỉ giao hàng
    let address = newAddress || (user.address.length > 0 ? user.address[0] : null);
    if (!address) {
      return res.status(400).json({ message: 'Không có địa chỉ giao hàng hợp lệ!' });
    }
    // Format lại địa chỉ
    const formattedAddress = `${address.street}, ${address.city}, ${address.state}, ${address.country}`;
    // Tạo đơn hàng mới (chỉ lưu productId và quantity)
    const newOrder = new Order({
      userId,
      orderDate: new Date(),
      totalPrice,
      products: products.map(item => ({ productId: item.productId, quantity: item.quantity })),
      address: formattedAddress,
      status: 'pending'
    });
    await newOrder.save();
    // Format lại orderDate
    const formattedOrderDate = newOrder.orderDate.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    res.status(201).json({
      message: 'Đặt hàng thành công!',
      order: {
        userId: newOrder.userId,
        orderDate: formattedOrderDate,
        totalPrice: newOrder.totalPrice,
        products: orderProducts,
        status: newOrder.status,
        address: formattedAddress,
        _id: newOrder._id,
        createdAt: newOrder.createdAt,
        updatedAt: newOrder.updatedAt,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi đặt hàng!', error });
  }
};




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

      // Cập nhật trạng thái đơn hàng thành 'cancelled'
      await Order.findByIdAndUpdate(id, { status: 'cancelled' });

      res.status(200).json({ message: 'Đơn hàng đã bị hủy và số lượng hàng đã được hoàn lại!' });
  } catch (error) {
      res.status(500).json({ message: 'Lỗi khi hủy đơn hàng!', error });
  }
};

const confirmDeliveredOrder = async (req, res) => {
  try {
      const { id } = req.params;  
      const order = await Order.findById(id);
      if (!order) {
          return res.status(404).json({ message: 'không tìm thấy đơn hàng' });
      }
      if(order.status === 'cancelled') {
          return res.status(400).json({ message: 'Đơn hàng không thể hoàn thành vì đã bị hủy!' });
      }
      order.status = 'delivered';
      await order.save();
      res.status(200).json({ message: 'Đơn hàng đã nhận thành công!' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
}


module.exports = {
    getAllProduct,
    getProductById,
    cancelOrder,
    placeOrder,
    confirmDeliveredOrder
};