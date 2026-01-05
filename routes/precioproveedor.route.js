const express = require('express');
const router = express.Router();
const precioproveedorController = require('../controllers/precioproveedor.controller');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, precioproveedorController.getAll);
router.get('/:id', auth, precioproveedorController.getById);
router.get(
  '/producto/:idproducto',
  auth,
  precioproveedorController.getByProducto
);
router.get(
  '/proveedor/:idproveedor',
  auth,
  precioproveedorController.getByProveedor
);
router.post('/', auth, isAdmin, precioproveedorController.create);
router.put('/:id', auth, isAdmin, precioproveedorController.update);
router.delete('/:id', auth, isAdmin, precioproveedorController.delete);

module.exports = router;
