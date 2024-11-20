const Player = require('../models/Player');
const Match = require('../models/Match');
const { sequelize } = require('../config/db');

class PlayerService {

    async getPlayers() {
        return await Player.findAll({
            where: {
                active: true
            }
        });
    }
    async getPlayersToScheduler() {
        const query = `
        SELECT 
                p.id,
                p.nick,
                p.active,
                (
                    SELECT COUNT(*)
                    FROM "Matches"  as m
                    JOIN "MatchData" as md on m.id = md.id
                    WHERE m."idPlayer" = p.id
                    AND to_char(to_timestamp((md.data->>'data')::text, 'DD/MM/YYYY HH24:MI'), 'YYYY-MM') = to_char(now(), 'YYYY-MM')
                ) AS matches_this_month
            FROM "Players" AS p
            WHERE p.active = true;
    `;

        try {
            const players = await sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT,
            });

            return players;
        } catch (error) {
            console.error('Error fetching players:', error);
            throw error;
        }
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
            console.error('[Player Service] Error to update player:', error);
        }
    }
    async inactivePlayer(playerId) {
        try {
            const player = await Player.findByPk(playerId);
            if (player) {
                player.active = false;
                await player.save();
            }
        } catch (error) {
            console.error('[Player Service] Error to inactivate player:', error);
        }
    }
    async activePlayer(playerId) {
        try {
            const player = await Player.findByPk(playerId);
            if (player) {
                player.active = true;
                await player.save();
            }
        } catch (error) {
            console.error('[Player Service] Error to inactivate player:', error);
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
            console.error('[Player Service] Error to update player stats:', error);
        }
    }
    async updateLastMatchForPlayer(playerId, matchId) {
        try {
            const player = await Player.findByPk(playerId);
            if (player) {
                if (matchId > player.idLastMatch) {
                    player.idLastMatch = matchId;
                    await player.save();
                    console.log('[Player Service] Last match updated to player:', player.id);
                } else {
                    console.log('[Player Service] Try to set old match to player:', player.id);
                }

            } else {
                console.error('[Player Service] Player no found.');
            }
        } catch (error) {
            console.error('[Player Service] Error to update match for player:', error);
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
                console.error('[Player Service] Player not found.');
                return null;
            }

            return player;
        } catch (error) {
            console.error('[Player Service] Error to find player by ID:', error);
            throw error;
        }
    }
    async fetchPlayerStats(player) {
        try {
            const response = await fetch(`https://gamersclub.com.br/api/box/history/${player.id}`, {
                headers: {
                    accept: "application/json, text/plain, */*",
                    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                    authorization: "Basic ZnJvbnRlbmQ6NDdhMTZHMmtHTCFmNiRMRUQlJVpDI25X",
                    referer: `https://gamersclub.com.br/player/${player.id}`,
                },
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`[Player Service] Gamersclub API not responding for player stat ID: ${player.id}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[Player Service] Error fetching data for player stat ID: ${player.id}`, error);
            throw error;
        }
    };
    async fetchPlayerData(player) {
        try {
            const response = await fetch(`https://gamersclub.com.br/api/box/init/${player.id}`, {
                headers: {
                    accept: "application/json, text/plain, */*",
                    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                    authorization: "Basic ZnJvbnRlbmQ6NDdhMTZHMmtHTCFmNiRMRUQlJVpDI25X",
                    referer: `https://gamersclub.com.br/player/${player.id}`,
                },
                method: "GET",
            });

            if (!response.ok) {
                throw new Error(`[Player Service] Gamersclub API not responding for player ID: ${player.id}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[Player Service] Error fetching data for player ID: ${player.id}`, error);
            throw error;
        }
    };
    async fetchUpdatePlayerData(player) {
        console.log(`[Player Service] Fetching data for player ID: ${player.id}`);
        const playerData = await this.fetchPlayerData(player);
        if (playerData?.playerInfo?.id > 0) {
            if (playerData) {
                console.log(`[Player Service] Updating player data for ID: ${player.id}`);
                await this.updatePlayer(player.id, playerData);
            }
        }

        console.log(`[Player Service] Fetching data for player stats ID: ${player.id}`);
        const playerStats = await this.fetchPlayerStats(player);
        await this.updatePlayerStats(player.id, playerStats);
        console.log(`[Player Service] Fetched all data for player stats ID: ${player.id}`);
    }
    async  getPlayerById(id) {
        return await Player.findOne({
            where: {
                id: id,
            }
        });
    }

}

module.exports = new PlayerService();
