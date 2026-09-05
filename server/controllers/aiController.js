const { autoCatalogFromImage, polishDescriptionFromSpeech } = require('../services/aiCatalogService');

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

exports.polishDescription = async (req, res) => {
  try {
    const { transcript, detectedContext } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ message: 'No speech transcript received' });
    }

    const description = await polishDescriptionFromSpeech({ transcript, detectedContext });
    res.json({ description });
  } catch (err) {
    console.error('Voice description polish failed:', err.message);
    res.status(500).json({
      message: 'Could not process your voice description right now. You can type it in manually.',
    });
  }
};
