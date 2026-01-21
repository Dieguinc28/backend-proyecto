const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialCompra = sequelize.define(
  'HistorialCompra',
  {
    idhistorial: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idrecomendacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Referencia a la recomendación original',
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
    idusuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fechacompra: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'historialcompra',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: false,
  }
);

module.exports = HistorialCompra;
