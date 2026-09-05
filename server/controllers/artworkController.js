const Artwork = require('../models/Artwork');

exports.getAllArtworks = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, state, verified, page = 1, limit = 12 } = req.query;
    const query = { isAvailable: true };
    if (category)  query.category = category;
    if (state)     query['location.state'] = new RegExp(state, 'i');
    if (minPrice || maxPrice)
      query.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
    if (search)
      query.$or = [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
    const skip = (page - 1) * limit;
    const [artworks, total] = await Promise.all([
      Artwork.find(query).populate('artist', 'name state city isVerified avatar')
        .sort({ createdAt: -1 }).skip(skip).limit(+limit),
      Artwork.countDocuments(query),
    ]);
    res.json({ artworks, total, pages: Math.ceil(total / limit), page: +page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('artist', 'name bio state city phone avatar isVerified artSpecialties');
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json(artwork);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createArtwork = async (req, res) => {
  try {
    const { title, description, price, category, artStyle, dimensions, medium, state, city } = req.body;
    const images = req.files?.map(f => f.path) || [];
    if (!images.length) return res.status(400).json({ message: 'Upload at least one image' });
    const artwork = await Artwork.create({
      title, description, price: +price, category, artStyle, dimensions, medium,
      images, artist: req.user._id,
      location: { state: state || req.user.state, city: city || req.user.city },
    });
    res.status(201).json(artwork);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findOne({ _id: req.params.id, artist: req.user._id });
    if (!artwork) return res.status(404).json({ message: 'Artwork not found or unauthorized' });
    Object.assign(artwork, req.body);
    if (req.files?.length) artwork.images = [...artwork.images, ...req.files.map(f => f.path)];
    await artwork.save();
    res.json(artwork);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findOneAndDelete({ _id: req.params.id, artist: req.user._id });
    if (!artwork) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json({ message: 'Artwork removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArtistArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.params.artistId }).sort({ createdAt: -1 });
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artist: req.user._id }).sort({ createdAt: -1 });
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Powers the Cultural Map — how many live listings exist per state, so the
// map can highlight where artisans are actually active right now.
exports.getStateCounts = async (req, res) => {
  try {
    const rows = await Artwork.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
    ]);

    const counts = rows
      .filter((r) => r._id)
      .map((r) => ({ state: r._id, count: r.count }));

    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
