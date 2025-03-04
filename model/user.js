const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Sẽ được hash trước khi lưu
  phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: {
            validator: function(value) {
                return /^[0-9]{10}$/.test(value);
            },
            message: 'Phone number must be a 10-digit number'
        },
        unique: true,
    },
  address: [{
    street: String,
    city: String,
    state: String,
    country: String
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
}
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); 

  try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
  } catch (error) {
      next(error);
  } 
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
      return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
      throw new Error(error);
  }
};

module.exports = mongoose.model('User', UserSchema);
