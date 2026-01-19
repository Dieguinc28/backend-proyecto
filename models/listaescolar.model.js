const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Listaescolar = sequelize.define(
  'Listaescolar',
  {
    idlista: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idusuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nombrelista: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: 'listaescolar',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
  }
);

module.exports = Listaescolar;
