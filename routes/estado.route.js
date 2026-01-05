const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estado.controller');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, estadoController.getAll);
router.get('/:id', auth, estadoController.getById);
router.post('/', auth, isAdmin, estadoController.create);
router.put('/:id', auth, isAdmin, estadoController.update);
router.delete('/:id', auth, isAdmin, estadoController.delete);

module.exports = router;
