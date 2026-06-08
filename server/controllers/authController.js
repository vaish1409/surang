const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, bio, state, city, artSpecialties, phone } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password,
      role: role === 'artist' ? 'artist' : 'buyer',
      bio, state, city, artSpecialties, phone });
    res.status(201).json({
      token: signToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email,
              role: user.role, avatar: user.avatar, isVerified: user.isVerified }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({
      token: signToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email,
              role: user.role, avatar: user.avatar, isVerified: user.isVerified,
              state: user.state, city: user.city }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = (({ name, bio, phone, state, city, artSpecialties }) =>
      ({ name, bio, phone, state, city, artSpecialties }))(req.body);
    if (req.file) updates.avatar = req.file.path;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
