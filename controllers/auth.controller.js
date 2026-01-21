const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { name, nombre, email, password, contrasena, role, rol } = req.body;
    const result = await authService.register({
      nombre: name || nombre,
      email,
      contrasena: password || contrasena,
      rol: role || rol,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'El usuario ya existe') {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: 'Error en el servidor', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, contrasena } = req.body;
    const result = await authService.login({
      email,
      contrasena: password || contrasena,
    });
    res.json(result);
  } catch (error) {
    if (error.message === 'Credenciales inválidas') {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: 'Error en el servidor', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const usuario = await authService.getUserById(req.user.userId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role: usuario.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' });
    }
    const result = await authService.forgotPassword(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await authService.verifyResetToken(token);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: 'Token y contraseña son requeridos' });
    }
    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, nombre, email } = req.body;
    const result = await authService.updateProfile(req.user.userId, {
      nombre: name || nombre,
      email,
    });
    res.json(result);
  } catch (error) {
    if (error.message === 'El email ya está en uso') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Contraseña actual y nueva son requeridas' });
    }
    const result = await authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );
    res.json(result);
  } catch (error) {
    if (
      error.message === 'La contraseña actual es incorrecta' ||
      error.message === 'La nueva contraseña debe tener al menos 6 caracteres'
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  updateProfile,
  changePassword,
};
