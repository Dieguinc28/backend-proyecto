const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Detallecotizacion = sequelize.define(
  'Detallecotizacion',
  {
    iddetalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idcotizacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idproducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    preciounitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'detallecotizacion',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = Detallecotizacion;
