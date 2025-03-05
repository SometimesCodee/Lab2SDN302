const mongoose = require('mongoose');
const User = require('./user');
const OrderSchema = new mongoose.Schema({
  userId: {
    // type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, validate: {
    //   validator: async (id) => {
    //     const user = await User.findById(id);
    //     return user && user.role === 'user';
    //   },
    //   message: 'Customer must be a user'
    // }
  },
  orderDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],
  status: { type: String, default: 'pending', enum: ['pending', 'shipped', 'delivered', 'cancelled'] },
  address: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
