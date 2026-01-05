const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

// Rutas de recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword);
router.get('/verify-reset-token/:token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// Rutas de perfil de usuario
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;
