const { Sequelize, DataTypes} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
});

sequelize.authenticate()
    .catch((err) => console.error('Error to connect on database:', err));

module.exports = { sequelize, DataTypes};
