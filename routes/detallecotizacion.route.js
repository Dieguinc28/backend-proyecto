const express = require('express');
const router = express.Router();
const detallecotizacionController = require('../controllers/detallecotizacion.controller');
const { auth } = require('../middleware/auth');

router.get('/', auth, detallecotizacionController.getAll);
router.get('/:id', auth, detallecotizacionController.getById);
router.get(
  '/cotizacion/:idcotizacion',
  auth,
  detallecotizacionController.getByCotizacion
);
router.post('/', auth, detallecotizacionController.create);
router.put('/:id', auth, detallecotizacionController.update);
router.delete('/:id', auth, detallecotizacionController.delete);

module.exports = router;
