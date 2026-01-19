const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cotizacion = sequelize.define(
  'Cotizacion',
  {
    idcotizacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idusuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idlista: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    idproveedor: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'JSON string con los items de la cotización',
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pendiente',
      field: 'estado',
    },
    pdffile: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'cotizacion',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = Cotizacion;
