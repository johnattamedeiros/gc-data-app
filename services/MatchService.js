const Match = require('../models/Match');
const Player = require('../models/Player');

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
                        attributes: ['id', 'nick', 'level'], 
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

}

module.exports = new MatchService();
