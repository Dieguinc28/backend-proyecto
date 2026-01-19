const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res
        .status(401)
        .json({ message: 'No hay token, autorización denegada' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // Agregar idusuario para compatibilidad
    req.user.idusuario = decoded.userId || decoded.idusuario;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error.message);
    res.status(401).json({ message: 'Token no válido' });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Token inválido - continuar sin usuario autenticado
    console.warn('Token inválido en optionalAuth:', error.message);
    next();
  }
};

const isAdmin = (req, res, next) => {
  // Verificar tanto 'role' como 'rol' para compatibilidad
  const userRole = req.user.role || req.user.rol;

  if (!userRole || userRole !== 'admin') {
    return res
      .status(403)
      .json({ message: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

module.exports = { auth, optionalAuth, isAdmin };
