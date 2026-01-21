const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define(
  'Usuario',
  {
    idusuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idestado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contrasena: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    rol: {
      type: DataTypes.ENUM('admin', 'cliente'),
      allowNull: false,
      defaultValue: 'cliente',
    },
  },
  {
    tableName: 'usuario',
    timestamps: true,
    createdAt: 'fechacreacion',
    updatedAt: 'fechamodificacion',
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.contrasena && usuario.contrasena.trim() !== '') {
          const salt = await bcrypt.genSalt(10);
          usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
        } else {
          throw new Error('La contraseña es requerida');
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('contrasena')) {
          if (usuario.contrasena && usuario.contrasena.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
          } else {
            throw new Error('La contraseña no puede estar vacía');
          }
        }
      },
    },
  }
);

Usuario.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.contrasena);
};

module.exports = Usuario;
