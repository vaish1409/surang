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
    const pendingVerification = await User.countDocuments({ isVerified: false, isBlocked: false });
    res.json({ users, artworks, orders, revenue: revenue[0]?.total || 0, pendingVerification });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Supports ?role=buyer|artist and ?status=pending|verified|blocked for the
// admin dashboard's verification queue filters. No params = everyone.
router.get('/users', async (req, res) => {
  try {
    const { role, status } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status === 'pending')  { query.isVerified = false; query.isBlocked = false; }
    if (status === 'verified') query.isVerified = true;
    if (status === 'blocked')  query.isBlocked = true;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/artworks', async (_req, res) => {
  try {
    const artworks = await Artwork.find().populate('artist', 'name email').sort({ createdAt: -1 });
    res.json(artworks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/orders', async (_req, res) => {
  try {
    const orders = await Order.find().populate('buyer', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- User verification (buyers and sellers both) ---

router.patch('/users/:id/verify', async (req, res) => {
  try {
    const { verificationDocId, verificationNotes } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
        verificationDocId: verificationDocId || '',
        verificationNotes: verificationNotes || '',
      },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Revoke verification — e.g. evidence turned out to be invalid, or the
// admin made an error. Keeps the doc ID / notes as a record rather than
// wiping them, so there's a trail of what happened.
router.patch('/users/:id/unverify', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot block an admin' });

    user.isBlocked = typeof req.body.isBlocked === 'boolean' ? req.body.isBlocked : !user.isBlocked;
    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json(safeUser);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- Artwork moderation ---

router.patch('/artworks/:id/feature', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    artwork.isFeatured = !artwork.isFeatured;
    await artwork.save();
    res.json(artwork);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Soft-remove: hides the listing (isAvailable = false) rather than deleting
// it outright, so a moderation decision can be reversed if needed.
router.patch('/artworks/:id/remove', async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id, { isAvailable: false }, { new: true }
    );
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ message: 'Artwork hidden by admin', artwork });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// True permanent delete — kept separate from "remove" on purpose.
router.delete('/artworks/:id', async (req, res) => {
  try {
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork permanently deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
