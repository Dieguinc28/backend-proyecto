const express = require('express');
const router = express.Router();
const recomendacionController = require('../controllers/recomendacion.controller');
const { auth, isAdmin } = require('../middleware/auth');

// Rutas de sincronización (admin) - DEBEN IR PRIMERO antes de rutas con :id
router.post('/sincronizar', auth, isAdmin, recomendacionController.sincronizar);
router.post(
  '/sincronizar/iniciar',
  auth,
  isAdmin,
  recomendacionController.iniciarSincronizacionAutomatica
);
router.post(
  '/sincronizar/detener',
  auth,
  isAdmin,
  recomendacionController.detenerSincronizacionAutomatica
);
router.post(
  '/limpiar',
  auth,
  isAdmin,
  recomendacionController.limpiarComprados
);

// Rutas públicas
router.get('/', recomendacionController.getAll);
router.get('/mejores-ofertas', recomendacionController.getMejoresOfertas);
router.get('/producto/:idproducto', recomendacionController.getByProducto);
router.get('/:id/validar', recomendacionController.validarDisponibilidad);
router.get('/:id', recomendacionController.getById);

// Rutas de administración
router.post('/', auth, isAdmin, recomendacionController.create);
router.put('/:id', auth, isAdmin, recomendacionController.update);
router.delete('/:id', auth, isAdmin, recomendacionController.delete);

// Rutas de compra (usuarios autenticados)
router.patch('/:id/comprar', auth, recomendacionController.marcarComoComprado);

// Rutas de historial (usuarios autenticados)
router.get(
  '/historial/compras',
  auth,
  recomendacionController.getHistorialCompras
);
router.get(
  '/historial/estadisticas',
  auth,
  recomendacionController.getEstadisticasCompras
);

module.exports = router;
