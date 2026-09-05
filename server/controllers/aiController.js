const { autoCatalogFromImage } = require('../services/aiCatalogService');

exports.autoCatalog = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Upload a photo first' });

    const base64 = req.file.buffer.toString('base64');
    const suggestion = await autoCatalogFromImage({
      base64,
      mimeType: req.file.mimetype,
    });

    res.json(suggestion);
  } catch (err) {
    console.error('AI auto-catalog failed:', err.message);
    res.status(500).json({
      message: 'AI cataloging is unavailable right now. You can fill the details in manually.',
    });
  }
};
