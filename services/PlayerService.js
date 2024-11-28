const Player = require('../models/Player');
const Match = require('../models/Match');
const { sequelize } = require('../config/db');
const axios = require('axios');
require('dotenv').config();



class PlayerService {

    async runPlayerScheduler(){
        try {
            let players = await this.getPlayers();
            for (const playerInstance of players) {
                const player = playerInstance.dataValues;
                await this.fetchUpdatePlayerData(player);
            }
    
            console.log(`[Player Scheduler] Data updated for all players. Total: ${players.length}`);
        } catch (error) {
            console.error("[Player Scheduler]Error during scheduled data fetch and processing:", error);
        }
    };

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
            console.error('[Player Service] Error fetching players:', error);
            throw error;
        }
    }
    async updatePlayer(playerId, playerData) {
        try {
            const player = await Player.findByPk(playerId);
           
            if (player) {
                let profile = playerData.playerInfo;
                console.log(profile);
                player.nick = profile.nick;
                player.level = profile.level;
                await player.update();
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
            const response = await axios.get(`https://gamersclub.com.br/api/box/history/${player.id}?json`, {
                headers: {
                    'accept': 'application/json, text/javascript, */*; q=0.01',
                    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'authorization': process.env.TOKEN,
                    'cache-control': 'no-cache',
                    'cookie': 'sib_cuid=0fc425dc-7346-47be-a44b-dfb115c5bb27; _fbp=fb.2.1723654395117.529201941752002953; _tt_enable_cookie=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjJiZmFlODE3LTY0YmMtNThlMC04M2Y5LTVjMTRkY2ViZDA4OSIsImNyZWF0ZWQiOjE3MjM2NTQ0ODkxMDYsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_1963917=eyJpZCI6IjExMDdkZmNiLWY4ZGEtNWI5My04ZjM3LWJlNTc5NTYzNzAzYyIsImNyZWF0ZWQiOjE3MjM2NTQzOTUyMjQsImV4aXN0aW5nIjp0cnVlfQ==; 51QQyhcLyDRpqrY2Gh3vO=1; _ga_1WKB6YC210=deleted; SL_C_23361dd035530_SID={"a14d3638cda988422792e3613234743b983fdd9e":{"sessionId":"Fe32YPsJXXRplQFklqvNH","visitorId":"pznzLWZCfcjtC_JEGCkDB"}}; FCNEC=%5B%5B%22AKsRol_VW-uHcuSCb9G8DWrcjp48op6AEcuXdY3_9WBOTHNZMm0YW74WBF07pMaI1k9fOxgthi_owwHggutHOBw-AKW8bL5bfrYK7asxDbE2s71cX5JBneUEf0Rqy_R8bZLmXRDRzp7JFPbBBB-JMlZCnexyePOxIQ%3D%3D%22%5D%5D; _gcl_au=1.1.1203603058.1731437524; _ttp=0aueWHaVlm-oO12sh6qCS8kzFwK.tt.2; gclubsess=6a7ed54ae8c20e62726f67c2d7ac5b4249a3dbea; gcid:accessToken=O4naxwPP1kTx0RW_63rsdrBJDrOpJyZvVXZANvxsX7I.6nzJsjOiD-kQjCgGud5cB9UrtC1RX5BTUZqsCFm6FWA; _gid=GA1.3.1324656860.1732229445; _ce.clock_data=30676%2C200.207.65.31%2C1%2Cf51bb482c660d0eeadd1f058058a2b35%2CChrome%2CBR; cebs=1; _hjSession_2263196=eyJpZCI6IjA2OTgzYTUyLTA1ZjQtNDc0MC1iNDcwLTczNjJjMzhhN2NkOCIsImMiOjE3MzIzMDE3NjY5MjIsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; __cf_bm=e96WDs3kcfJqyoPMlmhc2JCdul7DJPBoNI8Ck8FivOo-1732305935-1.0.1.1-uu0cKoNBuE6WfZ9RSxwmjtxxSzqau0_FOu6qVySSL3TSSeV1s5QSf4eTIadaDfOJVIa1mnHlH6dEgx6.AWqeVw; cf_clearance=xG1DwJCFb0DKxbQfQPGIlGATYNyNY07dyNTXpYpA2q4-1732305936-1.2.1.1-2s361qCg30eTDRYL4F_dmwNHm3eJdmqKduezV7RyAg6SnW.NzErWD9Y..PP_gdw2yhYli6Notc7I5J2TLW0cWP16VCHRQ_JDC34.YX4T.i7fp33kr5gFghoMih.CGnqdbd3wR76J4AIx.PhittKhXxE5RmPG2dNA8ws9BAwQ6PW4HAHb09YnqySxSINUBdotYXwWMU3YQBJMmIebUF9K50ZjREeUT_ZiaAqcvzhqzoDFq_g8ktehWx.5bCFaXNVcbxlVo9_rmnmoI9h4otklSH11pQkGjdJVUXFcNwagw5gxvK4ZkEZexEypWO9o_e6uw4scOdkGDWjbv_D74PESndIifNHWSBGZwxwL63WTbHSt_5qY38264q0ImEy0aZqjvzPXYD.c2E_F562qIfaaMZHctXTVekGsZL1kumkt0EP.xfhsdqFmWfx.yLGTJ0ZE; _gat_UA-187315934-3=1; _gat_UA-64910362-1=1; _gat_UA-64910362-39=1; _gat_UA-187315934-4=1; __gads=ID=74fb98acafe7efef:T=1732229414:RT=1732306549:S=ALNI_MZaBvSE_dRe9gFjHrc1t4PgD8WDmA; __gpi=UID=00000e9ecb4feb22:T=1732229414:RT=1732306549:S=ALNI_Mbj9aw_JGo9K2SrKmuJKHe6yOURgA; __eoi=ID=6dbd643f1d21ea59:T=1732229414:RT=1732306549:S=AA-Afjb7pBSjEnS8CgEmnnMqNp6v; _ga_HZPJ0EKL99=GS1.3.1732305968.8.1.1732306586.0.0.0; cebsp_=21; _ga=GA1.3.1573856931.1732229445; _ga_H7ETJY03DT=GS1.1.1732301765.7.1.1732306621.20.0.0; _ga_GDBFGFR1PC=GS1.1.1732301765.7.1.1732306621.20.0.0; _ga_1WKB6YC210=GS1.1.1732301765.7.1.1732306621.20.0.0; _ce.s=v~c691c52fbc74677f8985db2ccd1c0493d7e3b845~lcw~1732306621646~vir~returning~lva~1732306586582~vpv~5~as~false~v11.cs~419044~v11.s~36a02a70-a90d-11ef-b193-952ddba30175~v11.sla~1732306622006~v11.send~1732306621426~lcw~1732306622006',
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'referer': 'https://gamersclub.com.br/player/'+player.id,
                    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    'sec-ch-ua-arch': '"x86"',
                    'sec-ch-ua-bitness': '"64"',
                    'sec-ch-ua-full-version': '"131.0.6778.86"',
                    'sec-ch-ua-full-version-list': '"Google Chrome";v="131.0.6778.86", "Chromium";v="131.0.6778.86", "Not_A Brand";v="24.0.0.0"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-model': '""',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-ch-ua-platform-version': '"10.0.0"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'x-requested-with': 'XMLHttpRequest'
                  }
            });
            return response.data;
        } catch (error) {
            console.error(`[Player Service] Error fetching data for player ID: ${player.id}`, error);
            throw error;
        }
    };
    async fetchPlayerData(player) {
        try {
            const response = await axios.get(`https://gamersclub.com.br/api/box/init/${player.id}`, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'authorization': process.env.TOKEN2,
                    'cache-control': 'no-cache',
                    'cookie': 'sib_cuid=0fc425dc-7346-47be-a44b-dfb115c5bb27; _fbp=fb.2.1723654395117.529201941752002953; _tt_enable_cookie=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjJiZmFlODE3LTY0YmMtNThlMC04M2Y5LTVjMTRkY2ViZDA4OSIsImNyZWF0ZWQiOjE3MjM2NTQ0ODkxMDYsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_1963917=eyJpZCI6IjExMDdkZmNiLWY4ZGEtNWI5My04ZjM3LWJlNTc5NTYzNzAzYyIsImNyZWF0ZWQiOjE3MjM2NTQzOTUyMjQsImV4aXN0aW5nIjp0cnVlfQ==; 51QQyhcLyDRpqrY2Gh3vO=1; _ga_1WKB6YC210=deleted; SL_C_23361dd035530_SID={"a14d3638cda988422792e3613234743b983fdd9e":{"sessionId":"Fe32YPsJXXRplQFklqvNH","visitorId":"pznzLWZCfcjtC_JEGCkDB"}}; FCNEC=%5B%5B%22AKsRol_VW-uHcuSCb9G8DWrcjp48op6AEcuXdY3_9WBOTHNZMm0YW74WBF07pMaI1k9fOxgthi_owwHggutHOBw-AKW8bL5bfrYK7asxDbE2s71cX5JBneUEf0Rqy_R8bZLmXRDRzp7JFPbBBB-JMlZCnexyePOxIQ%3D%3D%22%5D%5D; _gcl_au=1.1.1203603058.1731437524; _ttp=0aueWHaVlm-oO12sh6qCS8kzFwK.tt.2; gclubsess=6a7ed54ae8c20e62726f67c2d7ac5b4249a3dbea; gcid:accessToken=O4naxwPP1kTx0RW_63rsdrBJDrOpJyZvVXZANvxsX7I.6nzJsjOiD-kQjCgGud5cB9UrtC1RX5BTUZqsCFm6FWA; _gid=GA1.3.1324656860.1732229445; _ce.clock_data=30676%2C200.207.65.31%2C1%2Cf51bb482c660d0eeadd1f058058a2b35%2CChrome%2CBR; cebs=1; _hjSession_2263196=eyJpZCI6IjA2OTgzYTUyLTA1ZjQtNDc0MC1iNDcwLTczNjJjMzhhN2NkOCIsImMiOjE3MzIzMDE3NjY5MjIsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; __cf_bm=e96WDs3kcfJqyoPMlmhc2JCdul7DJPBoNI8Ck8FivOo-1732305935-1.0.1.1-uu0cKoNBuE6WfZ9RSxwmjtxxSzqau0_FOu6qVySSL3TSSeV1s5QSf4eTIadaDfOJVIa1mnHlH6dEgx6.AWqeVw; _gat_UA-64910362-1=1; _gat_UA-64910362-39=1; _gat_UA-187315934-3=1; _gat_UA-187315934-4=1; cf_clearance=xG1DwJCFb0DKxbQfQPGIlGATYNyNY07dyNTXpYpA2q4-1732305936-1.2.1.1-2s361qCg30eTDRYL4F_dmwNHm3eJdmqKduezV7RyAg6SnW.NzErWD9Y..PP_gdw2yhYli6Notc7I5J2TLW0cWP16VCHRQ_JDC34.YX4T.i7fp33kr5gFghoMih.CGnqdbd3wR76J4AIx.PhittKhXxE5RmPG2dNA8ws9BAwQ6PW4HAHb09YnqySxSINUBdotYXwWMU3YQBJMmIebUF9K50ZjREeUT_ZiaAqcvzhqzoDFq_g8ktehWx.5bCFaXNVcbxlVo9_rmnmoI9h4otklSH11pQkGjdJVUXFcNwagw5gxvK4ZkEZexEypWO9o_e6uw4scOdkGDWjbv_D74PESndIifNHWSBGZwxwL63WTbHSt_5qY38264q0ImEy0aZqjvzPXYD.c2E_F562qIfaaMZHctXTVekGsZL1kumkt0EP.xfhsdqFmWfx.yLGTJ0ZE',
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'referer': 'https://gamersclub.com.br/player/'+player.id,
                    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    'sec-ch-ua-arch': '"x86"',
                    'sec-ch-ua-bitness': '"64"',
                    'sec-ch-ua-full-version': '"131.0.6778.86"',
                    'sec-ch-ua-full-version-list': '"Google Chrome";v="131.0.6778.86", "Chromium";v="131.0.6778.86", "Not_A Brand";v="24.0.0.0"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-model': '""',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-ch-ua-platform-version': '"10.0.0"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                }
            });

            return response.data;
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
    async getPlayerById(id) {
        return await Player.findOne({
            where: {
                id: id,
            }
        });
    }

}

module.exports = new PlayerService();
