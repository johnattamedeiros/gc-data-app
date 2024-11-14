const { sequelize, DataTypes } = require('../config/db');


const MatchData = sequelize.define('MatchData', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    data: {
        type: DataTypes.JSONB, 
        allowNull: true, 
        defaultValue: {},
    },
    
});

module.exports = MatchData;
