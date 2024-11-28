const Match = require('../models/Match');
const MatchData = require('../models/MatchData');
const Player = require('../models/Player');
const PlayerService = require('../services/PlayerService');
const { sequelize } = require('../config/db');
const axios = require('axios');
require('dotenv').config();


class MatchService {

    async runMatchByPlayerScheduler(){
        try {
            let players = await PlayerService.getPlayersToScheduler();
            for (const player of players) {
                await this.fetchUpdateMatchesByPlayer(player);
            }
    
            console.log(`[Match Scheduler] Data updated for all players matches. Total: ${players.length}`);
        } catch (error) {
            console.error("[Match Scheduler]Error during scheduled data fetch and processing:", error);
        }
    };

    async runMatchDataScheduler(){
        try {
            let matches = await this.getUniqueIdMatches();
    
            for (const match of matches) {
                console.log(`[Match Data Scheduler] Fetching data for match ID: ${match.id}`);
    
                const matchData = await this.fetchMatchData(match);
    
            }
    
            console.log(`[Match Data Scheduler] Data updated for all matches . Total: ${matches.length}`);
        } catch (error) {
            console.error("[Match Data Scheduler] Error during scheduled data fetch and processing:", error);
        }
    };

    async getTeamResults(teamResults) {
        let teamResultsReturn = [];


        for (const teamateResult of teamResults) {
            let playerResult = {
                id: teamateResult.idplayer,
                nick: teamateResult.player.nick,
                doubleRP: teamateResult.doubleRP,
                freezeRP: teamateResult.freezeRP,
                kill: teamateResult.nb_kill,
                assist: teamateResult.assist,
                death: teamateResult.death,
                hs: teamateResult.hs,
                firstkill: teamateResult.firstkill,
                damage: teamateResult.damage,
                kdr: teamateResult.kdr,
                phs: teamateResult.phs,
                adr: teamateResult.adr,
                flash_assist: teamateResult.flash_assist,
                rating_points: teamateResult.rating_points,
                isDoubleRatingPoints: teamateResult.isDoubleRatingPoints,
                isFreezeRatingPoints: teamateResult.isFreezeRatingPoints
            };
            teamResultsReturn.push(playerResult);
        }
        return teamResultsReturn;
    };

    async processSaveMatchData(id, matchData) {

        let matchDataCapture = {};
        matchDataCapture["prob_win_a"] = matchData.prob_win_a;
        matchDataCapture["prob_win_b"] = matchData.prob_win_b;
        matchDataCapture["data"] = matchData.data;

        matchDataCapture["teamAResults"] = await this.getTeamResults(matchData.jogos.players.team_a);
        matchDataCapture["teamBResults"] = await this.getTeamResults(matchData.jogos.players.team_b);

        await this.insertMatchData({ id: id, data: matchDataCapture });
        console.log(`[Match Data Scheduler] Data updated for match : ${id}`)

    };
    async insertMatch(matchData) {
        try {
            if (matchData.id) {
                console.log(`[Match Service] Inserting match ${matchData.id} to player ${matchData.idPlayer} `);

                const match = await Match.findOne({
                    where: {
                        id: matchData.id,
                        idPlayer: matchData.idPlayer
                    }
                });
                if (match) {
                    console.log(`[Match Service] Match already inserted ${matchData.id} to player ${matchData.idPlayer} - Ignoring`);
                } else {
                    await Match.create(matchData);
                }
            }
            return;
        } catch (error) {
            throw error;
        }
    }
    async getMatches(playerId = null) {
        try {
            const whereCondition = playerId ? { idPlayer: playerId } : {};

            const matches = await Match.findAll({
                where: whereCondition,
                include: [
                    {
                        model: Player,
                        attributes: ['id', 'nick', 'level', 'stats'],
                    },
                    {
                        model: MatchData,
                    },
                ],
                order: [
                    [
                        sequelize.literal(`
                            TO_TIMESTAMP("MatchDatum".data->>'data', 'DD/MM/YYYY HH24:MI')
                        `),
                        'DESC',
                    ],
                ],
                limit: 50,
            });

            return matches;
        } catch (error) {
            console.error('Error to found matches:', error);
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
            console.error('Error to find unique ids from matches:', error);
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
    async insertMatches(matches, idPlayer) {
        console.log(`[Match Service] Inserting matches`);
        try {
            for (const match of matches) {
                match["idPlayer"] = idPlayer;
                await this.insertMatch(match);
            }
        } catch (error) {
            throw new Error(`[Match Service] Error to insert matches`);
        }
    }

    async fetchMatchByPageByPlayer(pagesCount, player, month) {
        try {
            for (let page = 1; page <= pagesCount; page++) {
                console.log(`[Match Service] Finding match page ${page} path : ${player.id}/${month}/${page}`);

                const response = await axios.get(`https://gamersclub.com.br/api/box/historyMatchesPage/${player.id}/${month}/${page}`, {
                    headers: {
                        'accept': 'application/json, text/plain, */*',
                        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                        'authorization': process.env.TOKEN,
                        'cache-control': 'no-cache',
                        'cookie': 'sib_cuid=0fc425dc-7346-47be-a44b-dfb115c5bb27; _fbp=fb.2.1723654395117.529201941752002953; _tt_enable_cookie=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjJiZmFlODE3LTY0YmMtNThlMC04M2Y5LTVjMTRkY2ViZDA4OSIsImNyZWF0ZWQiOjE3MjM2NTQ0ODkxMDYsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_1963917=eyJpZCI6IjExMDdkZmNiLWY4ZGEtNWI5My04ZjM3LWJlNTc5NTYzNzAzYyIsImNyZWF0ZWQiOjE3MjM2NTQzOTUyMjQsImV4aXN0aW5nIjp0cnVlfQ==; 51QQyhcLyDRpqrY2Gh3vO=1; _ga_1WKB6YC210=deleted; SL_C_23361dd035530_SID={"a14d3638cda988422792e3613234743b983fdd9e":{"sessionId":"Fe32YPsJXXRplQFklqvNH","visitorId":"pznzLWZCfcjtC_JEGCkDB"}}; FCNEC=%5B%5B%22AKsRol_VW-uHcuSCb9G8DWrcjp48op6AEcuXdY3_9WBOTHNZMm0YW74WBF07pMaI1k9fOxgthi_owwHggutHOBw-AKW8bL5bfrYK7asxDbE2s71cX5JBneUEf0Rqy_R8bZLmXRDRzp7JFPbBBB-JMlZCnexyePOxIQ%3D%3D%22%5D%5D; _gcl_au=1.1.1203603058.1731437524; _ttp=0aueWHaVlm-oO12sh6qCS8kzFwK.tt.2; gclubsess=6a7ed54ae8c20e62726f67c2d7ac5b4249a3dbea; gcid:accessToken=O4naxwPP1kTx0RW_63rsdrBJDrOpJyZvVXZANvxsX7I.6nzJsjOiD-kQjCgGud5cB9UrtC1RX5BTUZqsCFm6FWA; _gid=GA1.3.1324656860.1732229445; _ce.clock_data=30676%2C200.207.65.31%2C1%2Cf51bb482c660d0eeadd1f058058a2b35%2CChrome%2CBR; cebs=1; _hjSession_2263196=eyJpZCI6IjA2OTgzYTUyLTA1ZjQtNDc0MC1iNDcwLTczNjJjMzhhN2NkOCIsImMiOjE3MzIzMDE3NjY5MjIsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; cf_clearance=cgh3jM4HrJElbcNMJklmL7lR3k_UKMVXZ.ydaVBteQ4-1732301735-1.2.1.1-8Pk2kJ31Q8ongEKa2Dy0dKaA6h0XYVhg5ryjlE2z8pKj.bQB12Rof6iTyMxjq72Z0Mwd0xRcqGKs3eQS7nVBbqPooT8dlW6n7WF88GgUvZJrkSFNJadFviWnpwUPYr_Hki_MuATMD24b0pGNhFT6yZ7Qz7mx8xYjAiDQq3ZB.FlQuKnMEclXhAkuqRKnfw4c7hy4YR1aeEiBtd807CsV03b61w3zAC5PqeH5ygmlSE8Sle1GHsqM5Mg_c.ZaUkB5oYkqumKSjgULuWAMGMshzdJg7neTlBCTVW9SRc82agLwPGogVKY_H68dU2WtXoa0uIH5qdeO44mToDDKBqspsNJqwu6jp8XHH5b4IgY4_SpBhqG99v2OZpYqHE5cCzPoXNIVpg0Q7X9wFhlsRC4OKGYRQAt_h4iHsdqQW9uJ5i9T2hcBN2hkCLslaO2ZZUw7; __cf_bm=jffTPZkRzM5SpXS6G6Gxy8PCwZICFPhpFXBaczkmmGE-1732302062-1.0.1.1-tNShN6fdCIUWhDJ2JQFJk_.8OSiAxe30vKT5GmI0ChW67W.UrpmMO8UgZmZDUAKnriI4uulmVzKPzi_o6N3Oww; __gads=ID=74fb98acafe7efef:T=1732229414:RT=1732302228:S=ALNI_MZaBvSE_dRe9gFjHrc1t4PgD8WDmA; __gpi=UID=00000e9ecb4feb22:T=1732229414:RT=1732302228:S=ALNI_Mbj9aw_JGo9K2SrKmuJKHe6yOURgA; __eoi=ID=6dbd643f1d21ea59:T=1732229414:RT=1732302228:S=AA-Afjb7pBSjEnS8CgEmnnMqNp6v; _gat_UA-187315934-3=1; _gat_UA-187315934-4=1; _gat_UA-64910362-1=1; _gat_UA-64910362-39=1; cebsp_=10; _ce.s=v~c691c52fbc74677f8985db2ccd1c0493d7e3b845~lcw~1732302332384~vir~returning~lva~1732302327546~vpv~5~as~false~v11.cs~419044~v11.s~6e8c76f0-a903-11ef-a47d-abfc28814d36~v11.sla~1732302332883~v11.send~1732302332384~lcw~1732302332883; _ga_H7ETJY03DT=GS1.1.1732301765.7.1.1732302333.53.0.0; _ga_1WKB6YC210=GS1.1.1732301765.7.1.1732302333.53.0.0; _ga_GDBFGFR1PC=GS1.1.1732301765.7.1.1732302333.53.0.0; _ga_HZPJ0EKL99=GS1.3.1732301766.7.1.1732302333.0.0.0; _ga=GA1.3.1573856931.1732229445',
                        'pragma': 'no-cache',
                        'priority': 'u=1, i',
                        'referer': 'https://gamersclub.com.br/player/' + player.id,
                        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                        'sec-ch-ua-arch': '"x86"',
                        'sec-ch-ua-bitness': '"64"',
                        'sec-ch-ua-full-version': '"131.0.6778.71"',
                        'sec-ch-ua-full-version-list': '"Google Chrome";v="131.0.6778.71", "Chromium";v="131.0.6778.71", "Not_A Brand";v="24.0.0.0"',
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

                if (response.status !== 200) {
                    throw new Error(`[Match Service] Gamersclub API not responding for match paged with player stat ID: ${player.id}`);
                }
                let monthMatchesResponse = response.data;

                if (monthMatchesResponse.monthMatches) {
                    await this.insertMatches(monthMatchesResponse.monthMatches, player.id);
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async fetchUpdateMatchesByPlayer(player) {
        try {
            const response = await axios.get('https://gamersclub.com.br/api/box/history/' + player.id + "?json", {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'authorization':  process.env.TOKEN,
                    'cache-control': 'no-cache',
                    'cookie': 'sib_cuid=0fc425dc-7346-47be-a44b-dfb115c5bb27; _fbp=fb.2.1723654395117.529201941752002953; _tt_enable_cookie=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjJiZmFlODE3LTY0YmMtNThlMC04M2Y5LTVjMTRkY2ViZDA4OSIsImNyZWF0ZWQiOjE3MjM2NTQ0ODkxMDYsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_1963917=eyJpZCI6IjExMDdkZmNiLWY4ZGEtNWI5My04ZjM3LWJlNTc5NTYzNzAzYyIsImNyZWF0ZWQiOjE3MjM2NTQzOTUyMjQsImV4aXN0aW5nIjp0cnVlfQ==; 51QQyhcLyDRpqrY2Gh3vO=1; _ga_1WKB6YC210=deleted; SL_C_23361dd035530_SID={"a14d3638cda988422792e3613234743b983fdd9e":{"sessionId":"Fe32YPsJXXRplQFklqvNH","visitorId":"pznzLWZCfcjtC_JEGCkDB"}}; FCNEC=%5B%5B%22AKsRol_VW-uHcuSCb9G8DWrcjp48op6AEcuXdY3_9WBOTHNZMm0YW74WBF07pMaI1k9fOxgthi_owwHggutHOBw-AKW8bL5bfrYK7asxDbE2s71cX5JBneUEf0Rqy_R8bZLmXRDRzp7JFPbBBB-JMlZCnexyePOxIQ%3D%3D%22%5D%5D; _gcl_au=1.1.1203603058.1731437524; _ttp=0aueWHaVlm-oO12sh6qCS8kzFwK.tt.2; gclubsess=6a7ed54ae8c20e62726f67c2d7ac5b4249a3dbea; gcid:accessToken=O4naxwPP1kTx0RW_63rsdrBJDrOpJyZvVXZANvxsX7I.6nzJsjOiD-kQjCgGud5cB9UrtC1RX5BTUZqsCFm6FWA; _gid=GA1.3.1324656860.1732229445; _ce.clock_data=30676%2C200.207.65.31%2C1%2Cf51bb482c660d0eeadd1f058058a2b35%2CChrome%2CBR; cebs=1; _hjSession_2263196=eyJpZCI6IjA2OTgzYTUyLTA1ZjQtNDc0MC1iNDcwLTczNjJjMzhhN2NkOCIsImMiOjE3MzIzMDE3NjY5MjIsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; cf_clearance=cgh3jM4HrJElbcNMJklmL7lR3k_UKMVXZ.ydaVBteQ4-1732301735-1.2.1.1-8Pk2kJ31Q8ongEKa2Dy0dKaA6h0XYVhg5ryjlE2z8pKj.bQB12Rof6iTyMxjq72Z0Mwd0xRcqGKs3eQS7nVBbqPooT8dlW6n7WF88GgUvZJrkSFNJadFviWnpwUPYr_Hki_MuATMD24b0pGNhFT6yZ7Qz7mx8xYjAiDQq3ZB.FlQuKnMEclXhAkuqRKnfw4c7hy4YR1aeEiBtd807CsV03b61w3zAC5PqeH5ygmlSE8Sle1GHsqM5Mg_c.ZaUkB5oYkqumKSjgULuWAMGMshzdJg7neTlBCTVW9SRc82agLwPGogVKY_H68dU2WtXoa0uIH5qdeO44mToDDKBqspsNJqwu6jp8XHH5b4IgY4_SpBhqG99v2OZpYqHE5cCzPoXNIVpg0Q7X9wFhlsRC4OKGYRQAt_h4iHsdqQW9uJ5i9T2hcBN2hkCLslaO2ZZUw7; __cf_bm=jffTPZkRzM5SpXS6G6Gxy8PCwZICFPhpFXBaczkmmGE-1732302062-1.0.1.1-tNShN6fdCIUWhDJ2JQFJk_.8OSiAxe30vKT5GmI0ChW67W.UrpmMO8UgZmZDUAKnriI4uulmVzKPzi_o6N3Oww; __gads=ID=74fb98acafe7efef:T=1732229414:RT=1732302228:S=ALNI_MZaBvSE_dRe9gFjHrc1t4PgD8WDmA; __gpi=UID=00000e9ecb4feb22:T=1732229414:RT=1732302228:S=ALNI_Mbj9aw_JGo9K2SrKmuJKHe6yOURgA; __eoi=ID=6dbd643f1d21ea59:T=1732229414:RT=1732302228:S=AA-Afjb7pBSjEnS8CgEmnnMqNp6v; _gat_UA-187315934-3=1; _gat_UA-187315934-4=1; _gat_UA-64910362-1=1; _gat_UA-64910362-39=1; cebsp_=10; _ce.s=v~c691c52fbc74677f8985db2ccd1c0493d7e3b845~lcw~1732302332384~vir~returning~lva~1732302327546~vpv~5~as~false~v11.cs~419044~v11.s~6e8c76f0-a903-11ef-a47d-abfc28814d36~v11.sla~1732302332883~v11.send~1732302332384~lcw~1732302332883; _ga_H7ETJY03DT=GS1.1.1732301765.7.1.1732302333.53.0.0; _ga_1WKB6YC210=GS1.1.1732301765.7.1.1732302333.53.0.0; _ga_GDBFGFR1PC=GS1.1.1732301765.7.1.1732302333.53.0.0; _ga_HZPJ0EKL99=GS1.3.1732301766.7.1.1732302333.0.0.0; _ga=GA1.3.1573856931.1732229445',
                    'pragma': 'no-cache',
                    'priority': 'u=1, i',
                    'referer': 'https://gamersclub.com.br/player/' + player.id,
                    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    'sec-ch-ua-arch': '"x86"',
                    'sec-ch-ua-bitness': '"64"',
                    'sec-ch-ua-full-version': '"131.0.6778.71"',
                    'sec-ch-ua-full-version-list': '"Google Chrome";v="131.0.6778.71", "Chromium";v="131.0.6778.71", "Not_A Brand";v="24.0.0.0"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-model': '""',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-ch-ua-platform-version': '"10.0.0"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'x-requested-with': "XMLHttpRequest"
                }
            });


            if (response.status !== 200) {
                throw new Error(`[Match Service] Gamersclub API not responding for match with player stat ID: ${player.id}`);
            }

            let playerHistory = response.data;
            if (playerHistory?.monthMatches.length > 0) {

                if (playerHistory?.monthMatches[0]?.daysInactive && playerHistory?.monthMatches.length == 1) {
                    console.log(`[Match Service] Inactivating player ${player.id} ${player.nick}`);
                    await PlayerService.inactivePlayer(player.id);
                } else {
                    let countMatches = playerHistory?.matches.matches;
                    console.log(`[Match Service] Checking matches count from player ${player.id} ${player.nick} in database: ${player.matches_this_month} on gamersclub:  ${countMatches}`);
                    if (countMatches <= player.matches_this_month) {
                        console.log(`[Match Service] All matches to ${player.id} ${player.nick} already inserted`);
                        return;
                    }
                    console.log('[Match Service] Inserting first page');

                    await this.insertMatches(playerHistory?.monthMatches, player.id);
                    if (countMatches > 20) {
                        console.log(`[Match Service] More pages identified to player ${player.id} ${player.nick} initiating pages matches`);
                        let pagesCount = Math.floor(countMatches / 20);
                        let month = playerHistory?.months[0];
                        await this.fetchMatchByPageByPlayer(pagesCount, player, month);
                    }
                }
            }

        } catch (error) {
            console.error(`[Match Service] Error fetching data for player stat ID: ${player.id}`, error);
            throw error;
        }
    }

    async fetchMatchData(match) {

        const url = `https://gamersclub.com.br/lobby/match/${match.id}/1`;

        const headers = {
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'cache-control': 'no-cache',
            'authorization':  process.env.TOKEN,
            'cookie': 'sib_cuid=0fc425dc-7346-47be-a44b-dfb115c5bb27; _fbp=fb.2.1723654395117.529201941752002953; _tt_enable_cookie=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjJiZmFlODE3LTY0YmMtNThlMC04M2Y5LTVjMTRkY2ViZDA4OSIsImNyZWF0ZWQiOjE3MjM2NTQ0ODkxMDYsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_1963917=eyJpZCI6IjExMDdkZmNiLWY4ZGEtNWI5My04ZjM3LWJlNTc5NTYzNzAzYyIsImNyZWF0ZWQiOjE3MjM2NTQzOTUyMjQsImV4aXN0aW5nIjp0cnVlfQ==; 51QQyhcLyDRpqrY2Gh3vO=1; _ga_1WKB6YC210=deleted; SL_C_23361dd035530_SID={"a14d3638cda988422792e3613234743b983fdd9e":{"sessionId":"Fe32YPsJXXRplQFklqvNH","visitorId":"pznzLWZCfcjtC_JEGCkDB"}}; FCNEC=%5B%5B%22AKsRol_VW-uHcuSCb9G8DWrcjp48op6AEcuXdY3_9WBOTHNZMm0YW74WBF07pMaI1k9fOxgthi_owwHggutHOBw-AKW8bL5bfrYK7asxDbE2s71cX5JBneUEf0Rqy_R8bZLmXRDRzp7JFPbBBB-JMlZCnexyePOxIQ%3D%3D%22%5D%5D; _gcl_au=1.1.1203603058.1731437524; _ttp=0aueWHaVlm-oO12sh6qCS8kzFwK.tt.2; gclubsess=6a7ed54ae8c20e62726f67c2d7ac5b4249a3dbea; gcid:accessToken=O4naxwPP1kTx0RW_63rsdrBJDrOpJyZvVXZANvxsX7I.6nzJsjOiD-kQjCgGud5cB9UrtC1RX5BTUZqsCFm6FWA; _gid=GA1.3.1324656860.1732229445; _ce.clock_data=30676%2C200.207.65.31%2C1%2Cf51bb482c660d0eeadd1f058058a2b35%2CChrome%2CBR; cebs=1; _hjSession_2263196=eyJpZCI6IjA2OTgzYTUyLTA1ZjQtNDc0MC1iNDcwLTczNjJjMzhhN2NkOCIsImMiOjE3MzIzMDE3NjY5MjIsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; __cf_bm=9jR0upBYinJP4JLYwgo9jE7UDG4yT_V7tFeUtM5FP6U-1732303510-1.0.1.1-py35nydGN8R1goMNg71oPTFhGSXBa70sWDhEmGhfuW5duFrbFi9hQAU2_N7MVmjnFggBE_v289d9xSSLuY_IGw; cf_clearance=xOsZjoirPC9tWPHZ0831He6gf9nSXvu2sYv9bk46VTY-1732303511-1.2.1.1-olVO0IFnr3JeCEhWERhbVWoZVkBM1gf.2y2UzAzQQby6eML2Axrq8imv_2EBvSyxosh0EIEiSHDiK7ATeNTpcAE9j_QrluNVQTOdjonBMOn9Gh4gCRHv50zdw5JhyhPJEOHGgxHGJrf6VmXz4Cd0lnxQVB4Y5CRr6lFBxcLy.OoolTyeG3qtj.iNbMnxE4tWUis5sFldzjL3PwZsT9rAlW84k4tnjUQm.AjAAnv8yPX3yrteEWrLnpyojN09P2_oytghFfoofKsbWekdtXRBE0UHLIeY_X9sPlONrGFRXM3axodLy4tD1rvGutkbII3FBrX.RBS8oIAWjKiwXASi7dZrYOxFogTcdHaiCUBMt271dDhDuyobGEXI.pPesVBSeX8nmDm68YMy..qP9HWtwiWlWp_0iwRQhpoLTsxZwWFda51tFbqEwpUDQACTIpSk; __gads=ID=74fb98acafe7efef:T=1732229414:RT=1732303510:S=ALNI_MZaBvSE_dRe9gFjHrc1t4PgD8WDmA; __gpi=UID=00000e9ecb4feb22:T=1732229414:RT=1732303510:S=ALNI_Mbj9aw_JGo9K2SrKmuJKHe6yOURgA; __eoi=ID=6dbd643f1d21ea59:T=1732229414:RT=1732303510:S=AA-Afjb7pBSjEnS8CgEmnnMqNp6v; _ga_HZPJ0EKL99=GS1.3.1732301766.7.1.1732303546.0.0.0; _ga=GA1.3.1573856931.1732229445; cebsp_=13; _ga_GDBFGFR1PC=GS1.1.1732301765.7.1.1732303832.60.0.0; _ga_H7ETJY03DT=GS1.1.1732301765.7.1.1732303832.60.0.0; _ga_1WKB6YC210=GS1.1.1732301765.7.1.1732303832.60.0.0; _ce.s=v~c691c52fbc74677f8985db2ccd1c0493d7e3b845~lcw~1732303832214~vir~returning~lva~1732302335392~vpv~5~as~false~v11.cs~419044~v11.s~6e8c76f0-a903-11ef-a47d-abfc28814d36~v11.sla~1732303832325~v11.send~1732303831928~lcw~1732303832326; _gat_UA-187315934-3=1',
            'pragma': 'no-cache',
            'priority': 'u=1, i',
            'referer': `https://gamersclub.com.br/lobby/partida/${match.id}`,
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
        };


        await axios.get(url, { headers })
            .then(response => {
                let matchData = response.data
                this.processSaveMatchData(match.id, matchData);
            })
            .catch(error => {
                console.error(`[Match Service] Error fetching MATCH DATA match ID: ${match.id}`, error);
                throw error;
            });
    };

}

module.exports = new MatchService();
