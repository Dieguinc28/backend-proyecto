const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const register = async ({ nombre, email, contrasena, rol }) => {
  if (!nombre || !email || !contrasena) {
    throw new Error('Nombre, email y contraseña son requeridos');
  }

  if (contrasena.trim() === '') {
    throw new Error('La contraseña no puede estar vacía');
  }

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

  const token = jwt.sign(
    { userId: usuario.idusuario, role: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: usuario.idusuario,
      name: usuario.nombre,
      email: usuario.email,
      role: usuario.rol,
    },
  };
};

const login = async ({ email, contrasena }) => {
  if (!email || !contrasena) {
    throw new Error('Email y contraseña son requeridos');
  }

  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await usuario.comparePassword(contrasena);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    { userId: usuario.idusuario, role: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: usuario.idusuario,
      name: usuario.nombre,
      email: usuario.email,
      role: usuario.rol,
    },
  };
};

const getUserById = async (userId) => {
  const usuario = await Usuario.findByPk(userId, {
    attributes: { exclude: ['contrasena'] },
  });

  if (!usuario) {
    return null;
  }

  return {
    id: usuario.idusuario,
    name: usuario.nombre,
    email: usuario.email,
    role: usuario.rol,
  };
};

module.exports = {
  register,
  login,
  getUserById,
};
