const Player = require('../models/Player');

class PlayerService {

    async getPlayers() {
            return await Player.findAll();
    }
    async updatePlayer(playerId, data) {
        try {
            const player = await Player.findByPk(playerId);
            if (player) {
                player.nick = data.nick;
                player.level = data.level;
                await player.save();
            } 
        } catch (error) {
            console.error('Erro ao atualizar dados do player:', error);
        }
    }
    async updateLastMatchForPlayer(playerId, matchId) {
        try {
            const player = await Player.findByPk(playerId);
            if (player) {
                player.idLastMatch = matchId;
                await player.save();
                console.log('Última partida atualizada para o jogador:', player.id);
            } else {
                console.error('Jogador não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao atualizar última partida:', error);
        }
    }
}

module.exports = new PlayerService();
