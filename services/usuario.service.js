const { Usuario } = require('../models');

const formatUsuario = (usuario) => ({
  id: usuario.idusuario,
  name: usuario.nombre,
  email: usuario.email,
  role: usuario.rol,
  createdAt: usuario.fechacreacion,
});

const getAllUsuarios = async () => {
  const usuarios = await Usuario.findAll({
    attributes: { exclude: ['contrasena'] },
    order: [['fechacreacion', 'DESC']],
  });
  return usuarios.map(formatUsuario);
};

const getUsuarioById = async (id) => {
  const usuario = await Usuario.findByPk(id, {
    attributes: { exclude: ['contrasena'] },
  });
  return usuario ? formatUsuario(usuario) : null;
};

const createUsuario = async ({ nombre, email, contrasena, rol }) => {
  const existingUser = await Usuario.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('El usuario ya existe');
  }

  const usuario = await Usuario.create({
    nombre,
    email,
    contrasena,
    rol: rol || 'cliente',
  });

  return {
    id: usuario.idusuario,
    name: usuario.nombre,
    email: usuario.email,
    role: usuario.rol,
    createdAt: usuario.fechacreacion,
  };
};

const updateUsuario = async (id, { nombre, email, rol, contrasena }) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    return null;
  }

  const updateData = { nombre, email, rol };
  if (contrasena && contrasena.trim() !== '') {
    updateData.contrasena = contrasena;
  }

  await usuario.update(updateData);

  return {
    id: usuario.idusuario,
    name: usuario.nombre,
    email: usuario.email,
    role: usuario.rol,
    createdAt: usuario.fechacreacion,
  };
};

const deleteUsuario = async (id) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  await usuario.destroy();
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
