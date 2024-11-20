const { sequelize, DataTypes } = require('../config/db');
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
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    nick: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Capturando Dados',
    },
    stats: {
        type: DataTypes.JSONB, 
        allowNull: true, 
        defaultValue: {},
    },
});


module.exports = Player;
