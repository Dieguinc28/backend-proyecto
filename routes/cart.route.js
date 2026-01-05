const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito.controller');
const { auth } = require('../middleware/auth');

router.get('/', auth, carritoController.getCarrito);
router.post('/add', auth, carritoController.addToCarrito);
router.post('/add-multiple', auth, carritoController.addMultipleToCarrito);
router.put('/update', auth, carritoController.updateCarrito);
router.delete('/remove/:productId', auth, carritoController.removeFromCarrito);
router.delete('/clear', auth, carritoController.clearCarrito);
router.post('/sync', auth, carritoController.syncCarrito);

module.exports = router;
