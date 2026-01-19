const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define(
  'Producto',
  {
    idproducto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    marca: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    precioreferencial: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unidad: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'unidad',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'producto',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = Producto;
