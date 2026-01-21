const usuarioService = require('../services/usuario.service');

const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.getAllUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const usuario = await usuarioService.getUsuarioById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

const createUsuario = async (req, res) => {
  try {
    const { name, nombre, email, password, contrasena, role, rol } = req.body;
    const usuario = await usuarioService.createUsuario({
      nombre: name || nombre,
      email,
      contrasena: password || contrasena,
      rol: role || rol,
    });
    res.status(201).json(usuario);
  } catch (error) {
    if (error.message === 'El usuario ya existe') {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: 'Error al crear usuario', error: error.message });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { name, nombre, email, password, contrasena, role, rol } = req.body;
    const usuario = await usuarioService.updateUsuario(req.params.id, {
      nombre: name || nombre,
      email,
      contrasena: password || contrasena,
      rol: role || rol,
    });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.userId) {
      return res
        .status(400)
        .json({ message: 'No puedes eliminar tu propio usuario' });
    }
    await usuarioService.deleteUsuario(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
