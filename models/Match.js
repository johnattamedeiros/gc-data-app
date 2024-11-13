const { sequelize, DataTypes } = require('../config/db');
const Player = require('./Player');

const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    idPlayer: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: Player,
            key: 'id',
        }
    },
    teamNameA: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scoreA: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    teamNameB: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    scoreB: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    win: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ratingPlayer: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ratingDiff: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    map: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Player.hasMany(Match, { foreignKey: 'idPlayer' });
Match.belongsTo(Player, { foreignKey: 'idPlayer' });

module.exports = Match;
