const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ventas = sequelize.define(
  'Ventas',
  {
    idventa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    iddetalle: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'ventas',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = Ventas;
