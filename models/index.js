const sequelize = require('../config/database');
const Estado = require('./estado.model');
const Usuario = require('./usuario.model');
const Listaescolar = require('./listaescolar.model');
const Producto = require('./producto.model');
const Itemlista = require('./itemlista.model');
const Proveedor = require('./proveedor.model');
const Precioproveedor = require('./precioproveedor.model');
const Cotizacion = require('./cotizacion.model');
const Detallecotizacion = require('./detallecotizacion.model');
const Ventas = require('./ventas.model');
const Carrito = require('./carrito.model');
const RecomendacionPrecio = require('./recomendacionprecio.model');
const Recomendacion = require('./recomendacion.model');
const HistorialCompra = require('./historialcompra.model');

Estado.hasMany(Usuario, {
  foreignKey: 'idestado',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Usuario.belongsTo(Estado, {
  foreignKey: 'idestado',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Usuario.hasMany(Carrito, { foreignKey: 'idusuario' });
Carrito.belongsTo(Usuario, { foreignKey: 'idusuario' });

Usuario.hasMany(Listaescolar, { foreignKey: 'idusuario' });
Listaescolar.belongsTo(Usuario, { foreignKey: 'idusuario' });

Usuario.hasMany(Cotizacion, { foreignKey: 'idusuario' });
Cotizacion.belongsTo(Usuario, { foreignKey: 'idusuario' });

Usuario.hasMany(Cotizacion, { foreignKey: 'idusuario' });
Cotizacion.belongsTo(Usuario, { foreignKey: 'idusuario' });

Estado.hasMany(Listaescolar, { foreignKey: 'idestado' });
Listaescolar.belongsTo(Estado, { foreignKey: 'idestado' });

Listaescolar.hasMany(Itemlista, { foreignKey: 'idlista' });
Itemlista.belongsTo(Listaescolar, { foreignKey: 'idlista' });

Producto.hasMany(Itemlista, { foreignKey: 'idproducto' });
Itemlista.belongsTo(Producto, { foreignKey: 'idproducto' });

Producto.hasMany(Precioproveedor, { foreignKey: 'idproducto' });
Precioproveedor.belongsTo(Producto, { foreignKey: 'idproducto' });

Proveedor.hasMany(Precioproveedor, { foreignKey: 'idproveedor' });
Precioproveedor.belongsTo(Proveedor, { foreignKey: 'idproveedor' });

Listaescolar.hasMany(Cotizacion, { foreignKey: 'idlista' });
Cotizacion.belongsTo(Listaescolar, { foreignKey: 'idlista' });

Proveedor.hasMany(Cotizacion, { foreignKey: 'idproveedor' });
Cotizacion.belongsTo(Proveedor, { foreignKey: 'idproveedor' });

Cotizacion.hasMany(Detallecotizacion, { foreignKey: 'idcotizacion' });
Detallecotizacion.belongsTo(Cotizacion, { foreignKey: 'idcotizacion' });

Producto.hasMany(Detallecotizacion, { foreignKey: 'idproducto' });
Detallecotizacion.belongsTo(Producto, { foreignKey: 'idproducto' });

Detallecotizacion.hasMany(Ventas, { foreignKey: 'iddetalle' });
Ventas.belongsTo(Detallecotizacion, { foreignKey: 'iddetalle' });

Producto.hasMany(RecomendacionPrecio, { foreignKey: 'idproducto' });
RecomendacionPrecio.belongsTo(Producto, { foreignKey: 'idproducto' });

Proveedor.hasMany(RecomendacionPrecio, { foreignKey: 'idproveedor' });
RecomendacionPrecio.belongsTo(Proveedor, { foreignKey: 'idproveedor' });

Usuario.hasMany(RecomendacionPrecio, { foreignKey: 'idusuario' });
RecomendacionPrecio.belongsTo(Usuario, { foreignKey: 'idusuario' });

Producto.hasMany(Recomendacion, {
  foreignKey: 'idproducto',
  as: 'recomendaciones',
});
Recomendacion.belongsTo(Producto, { foreignKey: 'idproducto', as: 'producto' });

Proveedor.hasMany(Recomendacion, {
  foreignKey: 'idproveedor',
  as: 'recomendaciones',
});
Recomendacion.belongsTo(Proveedor, {
  foreignKey: 'idproveedor',
  as: 'proveedor',
});

// Relaciones para HistorialCompra
Producto.hasMany(HistorialCompra, { foreignKey: 'idproducto' });
HistorialCompra.belongsTo(Producto, { foreignKey: 'idproducto' });

Proveedor.hasMany(HistorialCompra, { foreignKey: 'idproveedor' });
HistorialCompra.belongsTo(Proveedor, { foreignKey: 'idproveedor' });

Usuario.hasMany(HistorialCompra, { foreignKey: 'idusuario' });
HistorialCompra.belongsTo(Usuario, { foreignKey: 'idusuario' });

const syncDatabase = async (options = {}) => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a PostgreSQL establecida correctamente');

    // Use force: true to drop and recreate tables (pass { force: true })
    // Use alter: true to update tables without dropping (pass { alter: true })
    // Default: just sync without changes
    await sequelize.sync(options);
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  Estado,
  Usuario,
  Listaescolar,
  Producto,
  Itemlista,
  Proveedor,
  Precioproveedor,
  Cotizacion,
  Detallecotizacion,
  Ventas,
  Carrito,
  RecomendacionPrecio,
  Recomendacion,
  HistorialCompra,
};
