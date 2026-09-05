const router = require('express').Router();
const ctrl = require('../controllers/aiController');
const { protect, artistOnly } = require('../middleware/auth');
const memoryUpload = require('../config/memoryUpload');

router.post('/auto-catalog', protect, artistOnly, memoryUpload.single('image'), ctrl.autoCatalog);

module.exports = router;
