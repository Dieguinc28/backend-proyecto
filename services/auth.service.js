const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Usuario } = require('../models');

// Almacenamiento temporal de tokens de recuperación (en producción usar Redis o BD)
const resetTokens = new Map();

// Configurar transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

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

// Solicitar recuperación de contraseña
const forgotPassword = async (email) => {
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    // Por seguridad, no revelamos si el email existe o no
    return {
      message: 'Si el email existe, recibirás un enlace de recuperación',
    };
  }

  // Generar token único
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + 3600000; // 1 hora de validez

  // Guardar token (en producción usar Redis o BD)
  resetTokens.set(resetToken, {
    userId: usuario.idusuario,
    email: usuario.email,
    expiry: tokenExpiry,
  });

  // URL del frontend para resetear contraseña
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  // Enviar email
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña - Papelería',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p>Hola ${usuario.nombre},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Restablecer Contraseña
          </a>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
        </div>
      `,
    });

    return {
      message: 'Si el email existe, recibirás un enlace de recuperación',
    };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('Error al enviar el correo de recuperación');
  }
};

// Verificar token de recuperación
const verifyResetToken = async (token) => {
  const tokenData = resetTokens.get(token);

  if (!tokenData) {
    throw new Error('Token inválido o expirado');
  }

  if (Date.now() > tokenData.expiry) {
    resetTokens.delete(token);
    throw new Error('Token expirado');
  }

  return { valid: true, email: tokenData.email };
};

// Restablecer contraseña
const resetPassword = async (token, newPassword) => {
  const tokenData = resetTokens.get(token);

  if (!tokenData) {
    throw new Error('Token inválido o expirado');
  }

  if (Date.now() > tokenData.expiry) {
    resetTokens.delete(token);
    throw new Error('Token expirado');
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  const usuario = await Usuario.findByPk(tokenData.userId);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Actualizar contraseña
  usuario.contrasena = newPassword;
  await usuario.save();

  // Eliminar token usado
  resetTokens.delete(token);

  return { message: 'Contraseña actualizada exitosamente' };
};

// Actualizar perfil del usuario
const updateProfile = async (userId, { nombre, email }) => {
  const usuario = await Usuario.findByPk(userId);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar si el email ya está en uso por otro usuario
  if (email && email !== usuario.email) {
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('El email ya está en uso');
    }
  }

  if (nombre) usuario.nombre = nombre;
  if (email) usuario.email = email;

  await usuario.save();

  return {
    id: usuario.idusuario,
    name: usuario.nombre,
    email: usuario.email,
    role: usuario.rol,
  };
};

// Cambiar contraseña del usuario autenticado
const changePassword = async (userId, currentPassword, newPassword) => {
  const usuario = await Usuario.findByPk(userId);

  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar contraseña actual
  const isMatch = await usuario.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('La contraseña actual es incorrecta');
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  usuario.contrasena = newPassword;
  await usuario.save();

  return { message: 'Contraseña actualizada exitosamente' };
};

module.exports = {
  register,
  login,
  getUserById,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  updateProfile,
  changePassword,
};
