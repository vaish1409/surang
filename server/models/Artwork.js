const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  images:      { type: [String], required: true },
  category:    {
    type: String,
    enum: ['Madhubani', 'Warli', 'Kalamkari', 'Pottery', 'Pattachitra',
           'Weaving', 'Sculpture', 'Folk Art', 'Photography', 'Other'],
    required: true,
  },
  artStyle:    { type: String },
  dimensions:  { type: String },
  medium:      { type: String },
  isAvailable: { type: Boolean, default: true },
  artist:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location:    { state: String, city: String },
  soldCount:   { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
}, { timestamps: true });

artworkSchema.index({ category: 1, isAvailable: 1 });
artworkSchema.index({ artist: 1 });
artworkSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Artwork', artworkSchema);
