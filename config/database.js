const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Priorizar variables individuales (Docker) sobre DATABASE_URL
const useIndividualVars =
  process.env.DB_HOST && process.env.DB_HOST !== 'localhost';

// Si hay DATABASE_URL y NO hay variables individuales de Docker, usar DATABASE_URL
if (process.env.DATABASE_URL && !useIndividualVars) {
  const useSSL =
    process.env.DATABASE_URL.includes('neon.tech') ||
    process.env.DATABASE_URL.includes('railway.app') ||
    process.env.DB_SSL === 'true';

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Configuración local con variables separadas (sin SSL)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'papeleria_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;
