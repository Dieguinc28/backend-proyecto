const express = require('express');
const router = express.Router();
const multer = require('multer');
const cotizacionController = require('../controllers/cotizacion.controller');
const { auth, isAdmin } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.post('/', auth, cotizacionController.createCotizacion);
router.post(
  '/upload-pdf',
  auth,
  upload.single('pdf'),
  cotizacionController.uploadPdfCotizacion
);
router.get('/my-quotes', auth, cotizacionController.getMyCotizaciones);
router.get('/', auth, isAdmin, cotizacionController.getAllCotizaciones);
router.patch(
  '/:id/status',
  auth,
  isAdmin,
  cotizacionController.updateCotizacionStatus
);

module.exports = router;
