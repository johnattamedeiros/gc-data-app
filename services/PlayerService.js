const Player = require('../models/Player');
const Match = require('../models/Match');

class PlayerService {

    async getPlayers() {
            return await Player.findAll();
    }
    async updatePlayer(playerId, playerData) {
        try {
            const player = await Player.findByPk(playerId);
            if (player) {
                let profile = playerData.playerInfo;
                player.nick = profile.nick;
                player.level = profile.level;
                await player.save();
            } 
        } catch (error) {
            console.error('Error to update player:', error);
        }
    }
    async updatePlayerStats(playerId, playerData) {
        try {
            const player = await Player.findByPk(playerId);
            if (player) {
                player.stats = playerData.stat;
                await player.save();
            } 
        } catch (error) {
            console.error('Error to update player stats:', error);
        }
    }
    async updateLastMatchForPlayer(playerId, matchId) {
        try {
            const player = await Player.findByPk(playerId);
            if (player) {
                player.idLastMatch = matchId;
                await player.save();
                console.log('Last match updated to player:', player.id);
            } else {
                console.error('Player no found.');
            }
        } catch (error) {
            console.error('Error to update match for player:', error);
        }
    }
    async getPlayerById(playerId) {
        try {
            const player = await Player.findByPk(playerId, {
                include: [
                    {
                        model: Match
                    },
                ],
            });

            if (!player) {
                console.error('Player not found.');
                return null;
            }

            return player;
        } catch (error) {
            console.error('Error to find player by ID:', error);
            throw error;
        }
    }
    
}

module.exports = new PlayerService();
