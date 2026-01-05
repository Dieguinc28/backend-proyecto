const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Precioproveedor = sequelize.define(
  'Precioproveedor',
  {
    idprecio: {
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
  },
  {
    tableName: 'precioproveedor',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = Precioproveedor;
