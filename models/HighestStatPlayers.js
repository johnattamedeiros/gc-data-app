const { sequelize, DataTypes } = require('../config/db');

const HighestStatPlayers = sequelize.define(
    'HighestStatPlayers',
    {
        player_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        nick: {
            type: DataTypes.STRING,
        },
        level: {
            type: DataTypes.INTEGER,
        },
        idLastMatch: {
            type: DataTypes.INTEGER,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
        stat_type: {
            type: DataTypes.STRING,
        },
        raw_stat_value: {
            type: DataTypes.STRING,
        },
        stat_value: {
            type: DataTypes.FLOAT,
        },
    },
    {
        tableName: 'HighestStatPlayers',
        timestamps: false,
    }
);

module.exports = HighestStatPlayers;
