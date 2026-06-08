const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    artwork:  { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
    artist:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title:    String,
    image:    String,
    price:    Number,
    quantity: { type: Number, default: 1 },
  }],
  totalAmount:  { type: Number, required: true },
  status:       {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentId:    { type: String },
  razorpayOrderId: { type: String },
  isPaid:       { type: Boolean, default: false },
  shippingAddress: {
    name:    { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    phone:   { type: String, required: true },
  },
  trackingNumber: { type: String },
  notes:          { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
