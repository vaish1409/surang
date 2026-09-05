const router = require('express').Router();
const ctrl   = require('../controllers/artworkController');
const { protect, artistOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/',              ctrl.getAllArtworks);
router.get('/mine',          protect, artistOnly, ctrl.getMyArtworks);
router.get('/meta/state-counts', ctrl.getStateCounts);
router.get('/:id',           ctrl.getArtworkById);
router.get('/artist/:artistId', ctrl.getArtistArtworks);
router.post('/',             protect, artistOnly, upload.array('images', 5), ctrl.createArtwork);
router.put('/:id',           protect, artistOnly, upload.array('images', 5), ctrl.updateArtwork);
router.delete('/:id',        protect, artistOnly, ctrl.deleteArtwork);

module.exports = router;
