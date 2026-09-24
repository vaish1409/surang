const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, minlength: 6 },
  role:          { type: String, enum: ['buyer', 'artist', 'admin'], default: 'buyer' },
  avatar:        { type: String, default: '' },
  bio:           { type: String, maxlength: 500 },
  phone:         { type: String },
  state:         { type: String },
  city:          { type: String },
  artSpecialties:{ type: [String], default: [] },

  isVerified:    { type: Boolean, default: false },
  isBlocked:     { type: Boolean, default: false },

  // Verification evidence — works for either role: a Pehchan Artisan ID for
  // sellers, or any government ID reference a buyer chooses to provide.
  // Always optional and self-disclosed, never required to use the platform.
  verificationDocId: { type: String, trim: true, default: '' },
  verificationNotes: { type: String, trim: true, default: '' },
  verifiedAt:         { type: Date },
  verifiedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  totalSales:    { type: Number,  default: 0 },
  totalEarnings: { type: Number,  default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
