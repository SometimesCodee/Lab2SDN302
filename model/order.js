const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, validate: {
      validator: async (id) => {
        const user = await UserSchema.findById(id);
        return user && user.role === 'user';
      },
      message: 'Customer must be a user'
    }
  },
  orderDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true, min: { value: 0, message: 'Total price must be greater than 0' } },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],
  status: { type: String, default: 'pending', enum: ['pending', 'shipped', 'delivered'] }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
