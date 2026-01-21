const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/', auth, isAdmin, usuarioController.getAllUsuarios);
router.get('/:id', auth, isAdmin, usuarioController.getUsuarioById);
router.post('/', auth, isAdmin, usuarioController.createUsuario);
router.put('/:id', auth, isAdmin, usuarioController.updateUsuario);
router.delete('/:id', auth, isAdmin, usuarioController.deleteUsuario);

module.exports = router;
