const express = require('express');
const router = express.Router();
const itemlistaController = require('../controllers/itemlista.controller');
const { auth } = require('../middleware/auth');

router.get('/', auth, itemlistaController.getAll);
router.get('/:id', auth, itemlistaController.getById);
router.get('/lista/:idlista', auth, itemlistaController.getByLista);
router.post('/', auth, itemlistaController.create);
router.put('/:id', auth, itemlistaController.update);
router.delete('/:id', auth, itemlistaController.delete);

module.exports = router;
