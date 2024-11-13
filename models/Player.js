const { sequelize, DataTypes } = require('../config/db');
const Match = require('./Match'); 
const Player = sequelize.define('Player', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    idLastMatch: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nick: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Capturando Dados',
    },
});


module.exports = Player;
