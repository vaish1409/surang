const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');
const Artwork  = require('../models/Artwork');
const User     = require('../models/User');

const rzp = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const options = { amount: amount * 100, currency: 'INR',
      receipt: `surang_${Date.now()}` };
    const rzpOrder = await rzp.orders.create(options);
    res.json({ orderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount, paymentId, razorpayOrderId, razorpaySignature } = req.body;
    const body = razorpayOrderId + '|' + paymentId;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');
    if (expected !== razorpaySignature)
      return res.status(400).json({ message: 'Payment verification failed' });
    const order = await Order.create({
      buyer: req.user._id, items, totalAmount, shippingAddress,
      paymentId, razorpayOrderId, isPaid: true, status: 'confirmed',
    });
    for (const item of items) {
      await Artwork.findByIdAndUpdate(item.artwork, { $inc: { soldCount: 1 } });
      await User.findByIdAndUpdate(item.artist, {
        $inc: { totalSales: 1, totalEarnings: item.price * item.quantity }
      });
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.artwork', 'title images').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArtistOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.artist': req.user._id })
      .populate('buyer', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(trackingNumber && { trackingNumber }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
