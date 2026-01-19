const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Itemlista = sequelize.define(
  'Itemlista',
  {
    iditem: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idlista: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idproducto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: 'itemlista',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = Itemlista;
