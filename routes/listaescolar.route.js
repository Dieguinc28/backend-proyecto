const express = require('express');
const router = express.Router();
const listaescolarController = require('../controllers/listaescolar.controller');
const { auth } = require('../middleware/auth');

router.get('/', auth, listaescolarController.getAll);
router.get('/:id', auth, listaescolarController.getById);
router.get('/usuario/:idusuario', auth, listaescolarController.getByUsuario);
router.post('/', auth, listaescolarController.create);
router.put('/:id', auth, listaescolarController.update);
router.delete('/:id', auth, listaescolarController.delete);

module.exports = router;
