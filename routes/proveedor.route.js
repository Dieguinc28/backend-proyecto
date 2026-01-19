const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedor.controller');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, proveedorController.getAll);
router.get('/:id', auth, proveedorController.getById);
router.post('/', auth, isAdmin, proveedorController.create);
router.put('/:id', auth, isAdmin, proveedorController.update);
router.delete('/:id', auth, isAdmin, proveedorController.delete);

module.exports = router;
