const Match = require('../models/Match');
const MatchData = require('../models/MatchData');
const Player = require('../models/Player');
const { sequelize } = require('../config/db');

class MatchService {
    async insertMatch(matchData) {
        try {
            const newMatch = await Match.create(matchData);
            return newMatch;
        } catch (error) {
            throw error;
        }
    }
    async getMatches() {
        try {
            const matches = await Match.findAll({
                include: [
                    {
                        model: Player,
                        attributes: ['id', 'nick', 'level','stats'],
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit: 50,
            });
            return matches;
        } catch (error) {
            throw error;
        }
    }
    async getUniqueIdMatches() {
        try {
            const [idMatches] = await sequelize.query(`
                SELECT DISTINCT m.id
                FROM "Matches" AS m
                WHERE m.id NOT IN (SELECT md.id FROM "MatchData" AS md)
            `);
            return idMatches;
        } catch (error) {
            console.error('Erro ao buscar IDs Unicos das partidas:', error);
        }
    }
    async insertMatchData(matchData) {
        try {
            const newMatch = await MatchData.create(matchData);
            return newMatch;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new MatchService();
