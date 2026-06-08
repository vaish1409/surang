const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { protect, artistOnly } = require('../middleware/auth');

router.post('/razorpay',  protect, ctrl.createRazorpayOrder);
router.post('/',          protect, ctrl.placeOrder);
router.get('/mine',       protect, ctrl.getMyOrders);
router.get('/artist',     protect, artistOnly, ctrl.getArtistOrders);
router.put('/:id/status', protect, artistOnly, ctrl.updateOrderStatus);

module.exports = router;
