const { sequelize, DataTypes } = require('../config/db');

const RatingDiffByPlayer = sequelize.define(
    'RatingDiffByPlayer',
    {
        idPlayer: {
            type: DataTypes.INTEGER,
            primaryKey: true, 
        },
        nick: {
            type: DataTypes.STRING,
        },
        total_rating_diff: {
            type: DataTypes.FLOAT,
        },
    },
    {
        tableName: 'RatingDiffByPlayer', 
        timestamps: false, 
    }
);

module.exports = RatingDiffByPlayer;
