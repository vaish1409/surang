const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User    = require('../models/User');
const Artwork = require('../models/Artwork');
const Order   = require('../models/Order');

router.use(protect, adminOnly);

router.get('/stats', async (_req, res) => {
  try {
    const [users, artworks, orders] = await Promise.all([
      User.countDocuments(), Artwork.countDocuments(), Order.countDocuments()
    ]);
    const revenue = await Order.aggregate([
      { $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({ users, artworks, orders, revenue: revenue[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users',  async (_req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});
router.get('/artworks', async (_req, res) => {
  const artworks = await Artwork.find().populate('artist','name email').sort({ createdAt: -1 });
  res.json(artworks);
});
router.get('/orders', async (_req, res) => {
  const orders = await Order.find().populate('buyer','name email').sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/users/:id/verify', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  res.json(user);
});
router.put('/users/:id/block', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: req.body.isBlocked }, { new: true });
  res.json(user);
});
router.delete('/artworks/:id', async (req, res) => {
  await Artwork.findByIdAndDelete(req.params.id);
  res.json({ message: 'Artwork removed by admin' });
});

module.exports = router;
