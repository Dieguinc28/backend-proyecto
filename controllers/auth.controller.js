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

module.exports = {
  register,
  login,
  getMe,
};
