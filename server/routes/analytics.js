const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { protect, artistOnly } = require('../middleware/auth');

router.get('/demand-signals', protect, artistOnly, ctrl.getDemandSignals);
router.get('/my-performance', protect, artistOnly, ctrl.getMyPerformance);

module.exports = router;
