const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecomendacionPrecio = sequelize.define(
  'RecomendacionPrecio',
  {
    idrecomendacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idproducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idproveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    comprado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fechacompra: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idusuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'recomendacionprecio',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = RecomendacionPrecio;
