const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estado = sequelize.define(
  'Estado',
  {
    idestado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreestado: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: 'estado',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = Estado;
