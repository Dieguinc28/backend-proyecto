const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventas.controller');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, isAdmin, ventasController.getAll);
router.get('/:id', auth, isAdmin, ventasController.getById);
router.post('/', auth, isAdmin, ventasController.create);
router.put('/:id', auth, isAdmin, ventasController.update);
router.delete('/:id', auth, isAdmin, ventasController.delete);

module.exports = router;
