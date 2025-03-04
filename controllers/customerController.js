const Category = require("../model/category");
const Product = require("../model/product");
const Cart = require("../model/cart");
const Order = require("../model/order");
const Customer = require("../model/user");


const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate(
      "categoryId",
      "name description"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllProduct = async (req, res) => {
  try {
    const products = await Product.find().populate(
      "categoryId",
      "name description"
    );
    if (!products) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { customerId, productId, quantity } = req.body;
    if (quantity <= 0) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0!" });
    }
    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, items: [], totalPrice: 0 });
    }
    const existingProduct = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    await cart.save();
    res.status(200).json({ message: "Thêm vào giỏ hàng thành công!", cart });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm vào giỏ hàng!", error });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { customerId, productId } = req.body;
    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại!" });
    }
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    res
      .status(200)
      .json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công!", cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa sản phẩm khỏi giỏ hàng!", error });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { customerId, addressIndex, newAddress } = req.body;

    // Kiểm tra khách hàng có tồn tại không
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Khách hàng không tồn tại!" });
    }
    // Kiểm tra giỏ hàng của khách hàng
    const cart = await Cart.findOne({ customerId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống!" });
    }

    let address = {};

    if (newAddress) {
      // Nếu khách hàng cung cấp địa chỉ mới, sử dụng địa chỉ mới
      address = newAddress;
    } else if (addressIndex !== undefined && customer.address[addressIndex]) {
      // Nếu khách hàng chọn địa chỉ từ danh sách
      address = customer.address[addressIndex];
    } else if (customer.address.length > 0) {
      // Nếu không chọn gì, mặc định lấy địa chỉ đầu tiên
      address = customer.address[0];
    } else {
      return res
        .status(400)
        .json({ message: "Không có địa chỉ giao hàng hợp lệ!" });
    }

    // Tạo đơn hàng mới
    const newOrder = new Order({
      customerId,
      orderDate: new Date(),
      totalPrice: cart.totalPrice,
      products: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      address,
      status: "pending",
    });

    await newOrder.save();

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await Cart.deleteOne({ customerId });

    res.status(201).json({ message: "Đặt hàng thành công!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đặt hàng!", error });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại!" });
    }
    if (order.status === "shipped" || order.status === "delivered") {
      return res
        .status(400)
        .json({ message: "Không thể hủy đơn hàng đã giao!" });
    }
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: "Đơn hàng đã bị hủy!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi hủy đơn hàng!", error });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      console.error("Error: customerId is undefined or missing!");
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const objectId = new mongoose.Types.ObjectId(customerId);
    console.log("🛠 Converted ObjectId:", objectId);

    const orders = await Order.find({ customerId: objectId });

    if (!orders || orders.length === 0) {
      console.log("No orders found for customerId:", objectId);
      return res.status(404).json({ message: "No orders found for this user" });
    }

    console.log("Orders found:", orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

const getUserAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Received userId:", userId);

    const user = await Customer.findById(userId).select("name email address");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      addresses: user.address,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Error fetching addresses", error });
  }
};

// Add a new address
const addUserAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { street, city, state, country } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!street || !city || !state || !country) {
      return res
        .status(400)
        .json({ message: "All address fields are required" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.address)) {
      user.address = [];
    }

    user.address.push({ street, city, state, country });

    await user.save();

    return res.status(200).json({
      message: "Address added successfully",
      name: user.name,
      email: user.email,
      addresses: user.address,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ message: "Error adding address", error: error.message });
  }
};

// Update an address
const updateUserAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const { street, city, state, country } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ message: "User ID and Address ID are required" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.address)) {
      return res.status(400).json({ message: "Address field is not an array" });
    }

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (street) user.address[addressIndex].street = street;
    if (city) user.address[addressIndex].city = city;
    if (state) user.address[addressIndex].state = state;
    if (country) user.address[addressIndex].country = country;

    await user.save();

    return res.status(200).json({
      message: "Address updated successfully",
      name: user.name,
      email: user.email,
      addresses: user.address,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ message: "Error updating address", error: error.message });
  }
};

// Delete an address
const deleteUserAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (!userId || !addressId) {
      return res.status(400).json({ message: "User ID and Address ID are required" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.address)) {
      return res.status(400).json({ message: "Address field is not an array" });
    }

    const updatedAddresses = user.address.filter(
      (addr) => addr._id.toString() !== addressId
    );

    if (updatedAddresses.length === user.address.length) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.address = updatedAddresses;

    await user.save();

    return res.status(200).json({
      message: "Address deleted successfully",
      name: user.name,
      email: user.email,
      addresses: user.address,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ message: "Error deleting address", error: error.message });
  }
};

module.exports = {
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
  deleteUserAddress,
};
