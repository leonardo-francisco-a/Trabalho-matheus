const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'cardapio_db',
  username: process.env.DB_USER || 'cardapio_user',
  password: process.env.DB_PASSWORD || 'cardapio_pass',
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [/Deadlock/i],
    max: 3
  }
});

module.exports = sequelize;