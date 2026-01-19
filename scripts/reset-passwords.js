/**
 * Script para resetear todas las contraseñas a "password123"
 * Ejecutar: node scripts/reset-passwords.js
 */

require('dotenv').config();
const sequelize = require('../config/database');
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

const NEW_PASSWORD = 'password123';

async function resetPasswords() {
  console.log('='.repeat(60));
  console.log('🔄 RESETEANDO CONTRASEÑAS DE TODOS LOS USUARIOS');
  console.log('='.repeat(60));

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Generar hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, salt);
    console.log(
      `🔐 Nuevo hash generado: ${hashedPassword.substring(0, 30)}...\n`
    );

    // Actualizar todos los usuarios (sin activar hooks para evitar doble hash)
    const [affectedRows] = await Usuario.update(
      { contrasena: hashedPassword },
      { where: {}, hooks: false }
    );

    console.log(`✅ ${affectedRows} usuarios actualizados\n`);

    // Verificar que funciona
    console.log('🧪 Verificando login...');
    const authService = require('../services/auth.service');

    const usuarios = await Usuario.findAll({ attributes: ['email'] });

    for (const usuario of usuarios) {
      try {
        await authService.login({
          email: usuario.email,
          contrasena: NEW_PASSWORD,
        });
        console.log(`   ✅ ${usuario.email} - Login OK`);
      } catch (error) {
        console.log(`   ❌ ${usuario.email} - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ LISTO! Todos los usuarios ahora tienen:');
    console.log(`   Contraseña: ${NEW_PASSWORD}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

resetPasswords();
