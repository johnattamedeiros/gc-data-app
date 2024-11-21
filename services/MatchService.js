const Match = require('../models/Match');
const MatchData = require('../models/MatchData');
const Player = require('../models/Player');
const PlayerService = require('../services/PlayerService');
const { sequelize } = require('../config/db');
const axios = require('axios');

class MatchService {
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
                        'authorization': 'Basic ZnJvbnRlbmQ6NDdhMTZHMmtHTCFmNiRMRUQlJVpDI25X',
                        'cache-control': 'no-cache',
                        'cookie': 'sib_cuid=0fc425dc-7346-47be-a44b-dfb115c5bb27; _fbp=fb.2.1723654395117.529201941752002953; _tt_enable_cookie=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjJiZmFlODE3LTY0YmMtNThlMC04M2Y5LTVjMTRkY2ViZDA4OSIsImNyZWF0ZWQiOjE3MjM2NTQ0ODkxMDYsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_1963917=eyJpZCI6IjExMDdkZmNiLWY4ZGEtNWI5My04ZjM3LWJlNTc5NTYzNzAzYyIsImNyZWF0ZWQiOjE3MjM2NTQzOTUyMjQsImV4aXN0aW5nIjp0cnVlfQ==; _ga_GDBFGFR1PC=deleted; 51QQyhcLyDRpqrY2Gh3vO=1; _ga_H7ETJY03DT=deleted; _ga_1WKB6YC210=deleted; SL_C_23361dd035530_SID={"a14d3638cda988422792e3613234743b983fdd9e":{"sessionId":"Fe32YPsJXXRplQFklqvNH","visitorId":"pznzLWZCfcjtC_JEGCkDB"}}; FCNEC=%5B%5B%22AKsRol_VW-uHcuSCb9G8DWrcjp48op6AEcuXdY3_9WBOTHNZMm0YW74WBF07pMaI1k9fOxgthi_owwHggutHOBw-AKW8bL5bfrYK7asxDbE2s71cX5JBneUEf0Rqy_R8bZLmXRDRzp7JFPbBBB-JMlZCnexyePOxIQ%3D%3D%22%5D%5D; _gcl_au=1.1.1203603058.1731437524; _gid=GA1.3.472262262.1731437524; _ttp=0aueWHaVlm-oO12sh6qCS8kzFwK.tt.2; gclubsess=691b799dc064172d18292a7108d4318e6b6b0661; _ce.clock_data=28254%2C200.207.65.31%2C1%2Cf51bb482c660d0eeadd1f058058a2b35%2CChrome%2CBR; __cf_bm=AigM4zBOuz741hKMUTwARmH.DLKCc_NNI9FoI94uwlY-1732078674-1.0.1.1-DLQX8SIvuYXP8akGwPrE5hWoELasRFsSxJiElWHqWDMcREfwn78m9nePQnUqnDB.zIwphrp7LUYJWlPWLr97Lw; _hjSession_2263196=eyJpZCI6IjViOTBjMTRjLWEyY2YtNDU3My05ODkyLTkyN2E0ZmRjYzIxZiIsImMiOjE3MzIwNzg3MDQxMzQsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; cf_clearance=.iNNWt3wED2TypfVgkVj6FVYUxmlmEjOtK8M_tN1Qls-1732078675-1.2.1.1-gpQZ1GSHQELuPDVMd8hal_C7ZiIN11CDlWKNYRnOq28xFs_npIVodPK1D_TZgsiFVTfQ6Fwl4prphcC9LdADNCuI9MA2hIVqDAurj_IvrrUM.GtvlZhSu474JvwTOGLXCdUrCrVJVV.CLtZwLAzNwCH3e_AO6mI0QGNhdwfkzolBm6iWDIsBV_jOsLJG8l36_.g7LEIUUlKclFAz5hDbHJdxd7fYR6zAgV8ytKSI2wJv14Uy8ycaNIqCYqmaM5T3FwO9V4ayG5vBJhgKVd5Bpz6LvfKuYJAaILHnCHGc8nkf7akekdPDOgshWxpn4jET8NutfoEgxoenZmeLrRh67k.FK3.MkJtWSrziQDM0BFb6tGp1bIiT0Ed5aeNoN4hG3NlPdK7ONpJadhzcjI1JY3ORBBI8xn7o7UyqU.SiKRk2rT0jtzRGbNVWNcGJx9vz',
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
            const response = await axios.get('https://gamersclub.com.br/api/box/history/' + player.id, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'authorization': 'Basic ZnJvbnRlbmQ6NDdhMTZHMmtHTCFmNiRMRUQlJVpDI25X',
                    'cache-control': 'no-cache',
                    'cookie': 'sib_cuid=0fc425dc-7346-47be-a44b-dfb115c5bb27; _fbp=fb.2.1723654395117.529201941752002953; _tt_enable_cookie=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjJiZmFlODE3LTY0YmMtNThlMC04M2Y5LTVjMTRkY2ViZDA4OSIsImNyZWF0ZWQiOjE3MjM2NTQ0ODkxMDYsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_1963917=eyJpZCI6IjExMDdkZmNiLWY4ZGEtNWI5My04ZjM3LWJlNTc5NTYzNzAzYyIsImNyZWF0ZWQiOjE3MjM2NTQzOTUyMjQsImV4aXN0aW5nIjp0cnVlfQ==; _ga_GDBFGFR1PC=deleted; 51QQyhcLyDRpqrY2Gh3vO=1; _ga_H7ETJY03DT=deleted; _ga_1WKB6YC210=deleted; SL_C_23361dd035530_SID={"a14d3638cda988422792e3613234743b983fdd9e":{"sessionId":"Fe32YPsJXXRplQFklqvNH","visitorId":"pznzLWZCfcjtC_JEGCkDB"}}; FCNEC=%5B%5B%22AKsRol_VW-uHcuSCb9G8DWrcjp48op6AEcuXdY3_9WBOTHNZMm0YW74WBF07pMaI1k9fOxgthi_owwHggutHOBw-AKW8bL5bfrYK7asxDbE2s71cX5JBneUEf0Rqy_R8bZLmXRDRzp7JFPbBBB-JMlZCnexyePOxIQ%3D%3D%22%5D%5D; _gcl_au=1.1.1203603058.1731437524; _gid=GA1.3.472262262.1731437524; _ttp=0aueWHaVlm-oO12sh6qCS8kzFwK.tt.2; gclubsess=691b799dc064172d18292a7108d4318e6b6b0661; _ce.clock_data=28254%2C200.207.65.31%2C1%2Cf51bb482c660d0eeadd1f058058a2b35%2CChrome%2CBR; __cf_bm=AigM4zBOuz741hKMUTwARmH.DLKCc_NNI9FoI94uwlY-1732078674-1.0.1.1-DLQX8SIvuYXP8akGwPrE5hWoELasRFsSxJiElWHqWDMcREfwn78m9nePQnUqnDB.zIwphrp7LUYJWlPWLr97Lw; _hjSession_2263196=eyJpZCI6IjViOTBjMTRjLWEyY2YtNDU3My05ODkyLTkyN2E0ZmRjYzIxZiIsImMiOjE3MzIwNzg3MDQxMzQsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; cf_clearance=.iNNWt3wED2TypfVgkVj6FVYUxmlmEjOtK8M_tN1Qls-1732078675-1.2.1.1-gpQZ1GSHQELuPDVMd8hal_C7ZiIN11CDlWKNYRnOq28xFs_npIVodPK1D_TZgsiFVTfQ6Fwl4prphcC9LdADNCuI9MA2hIVqDAurj_IvrrUM.GtvlZhSu474JvwTOGLXCdUrCrVJVV.CLtZwLAzNwCH3e_AO6mI0QGNhdwfkzolBm6iWDIsBV_jOsLJG8l36_.g7LEIUUlKclFAz5hDbHJdxd7fYR6zAgV8ytKSI2wJv14Uy8ycaNIqCYqmaM5T3FwO9V4ayG5vBJhgKVd5Bpz6LvfKuYJAaILHnCHGc8nkf7akekdPDOgshWxpn4jET8NutfoEgxoenZmeLrRh67k.FK3.MkJtWSrziQDM0BFb6tGp1bIiT0Ed5aeNoN4hG3NlPdK7ONpJadhzcjI1JY3ORBBI8xn7o7UyqU.SiKRk2rT0jtzRGbNVWNcGJx9vz; __gads=ID=1889e0dbcd0e6b08:T=1723654493:RT=1732078678:S=ALNI_MZygMTNyAG-QwA6as8BRZSEpvb9AQ; __gpi=UID=00000a4c7793f90f:T=1723654493:RT=1732078678:S=ALNI_MZkcR2HZ1aqVJQUbbrO_qtfriq-Xw; __eoi=ID=567965bec018a6ae:T=1723654493:RT=1732078678:S=AA-AfjZTCD7aIdKdn3vL7K7oYmaD; _gat_UA-64910362-1=1; _gat_UA-64910362-39=1; _gat_UA-187315934-3=1; _gat_UA-187315934-4=1; cebs=1; _ga_H7ETJY03DT=GS1.1.1732078704.427.1.1732078920.50.0.0; _ga_GDBFGFR1PC=GS1.1.1732078704.427.1.1732078920.50.0.0; _ga_1WKB6YC210=GS1.1.1732078704.430.1.1732078920.50.0.0; _ga_HZPJ0EKL99=GS1.3.1732078704.435.1.1732078920.0.0.0; _ga=GA1.3.1337073397.1723654395; cebsp_=2; _ce.s=v~e379774ed971390f241a1d111d6d9cecf073ee9e~lcw~1732078926453~lva~1732078923291~vpv~457~as~false~vir~returning~v11.cs~419044~v11.s~12cb56a0-a6fc-11ef-9e06-434e0e2de865~v11.sla~1732078926519~lcw~1732078926519',
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
        try {
            const response = await fetch(`https://gamersclub.com.br/lobby/match/${match.id}/1`, {
                "headers": {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
                    "sec-ch-ua-arch": "\"x86\"",
                    "sec-ch-ua-bitness": "\"64\"",
                    "sec-ch-ua-full-version": "\"130.0.6723.117\"",
                    "sec-ch-ua-full-version-list": "\"Chromium\";v=\"130.0.6723.117\", \"Google Chrome\";v=\"130.0.6723.117\", \"Not?A_Brand\";v=\"99.0.0.0\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-model": "\"\"",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-ch-ua-platform-version": "\"10.0.0\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                    "cookie": "sib_cuid=0fc425dc-7346-47be-a44b-dfb115c5bb27; _fbp=fb.2.1723654395117.529201941752002953; _tt_enable_cookie=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjJiZmFlODE3LTY0YmMtNThlMC04M2Y5LTVjMTRkY2ViZDA4OSIsImNyZWF0ZWQiOjE3MjM2NTQ0ODkxMDYsImV4aXN0aW5nIjp0cnVlfQ==; _hjSessionUser_1963917=eyJpZCI6IjExMDdkZmNiLWY4ZGEtNWI5My04ZjM3LWJlNTc5NTYzNzAzYyIsImNyZWF0ZWQiOjE3MjM2NTQzOTUyMjQsImV4aXN0aW5nIjp0cnVlfQ==; _ga_GDBFGFR1PC=deleted; 51QQyhcLyDRpqrY2Gh3vO=1; _ga_H7ETJY03DT=deleted; _ga_1WKB6YC210=deleted; SL_C_23361dd035530_SID={\"a14d3638cda988422792e3613234743b983fdd9e\":{\"sessionId\":\"Fe32YPsJXXRplQFklqvNH\",\"visitorId\":\"pznzLWZCfcjtC_JEGCkDB\"}}; FCNEC=%5B%5B%22AKsRol_VW-uHcuSCb9G8DWrcjp48op6AEcuXdY3_9WBOTHNZMm0YW74WBF07pMaI1k9fOxgthi_owwHggutHOBw-AKW8bL5bfrYK7asxDbE2s71cX5JBneUEf0Rqy_R8bZLmXRDRzp7JFPbBBB-JMlZCnexyePOxIQ%3D%3D%22%5D%5D; _gcl_au=1.1.1203603058.1731437524; _gid=GA1.3.472262262.1731437524; gclubsess=90bb072e9a19c18f44ab0883c89a332e2ed57c4d; _ce.clock_data=22799%2C200.207.65.31%2C1%2C7675d59b5e84e0a878ee6f0a97f9056f%2CChrome%2CBR; _hjSession_2263196=eyJpZCI6ImFiNWMxNzExLWU4YjYtNDIxZi05Y2M3LWIxMGUzNzhkYTMxOSIsImMiOjE3MzE1OTIwNzQ5MzAsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; cebs=1; __cf_bm=5LX8hdKd4p1T23kwjy7aOyW8wB6hdcKZjFlB1DtibUA-1731594321-1.0.1.1-rJFAq9XrEgTcvIMDbUnTa8xs9RpgjmCrfZBxrKhXKxl_BbfbpSWhzcgnUVu.1XJH4W8EChzHlVsQMqPl8cJ6yg; cf_clearance=4oIYYQMJBVWb7jzHYUpmw_zen7B5_omKieCDEmzZSBE-1731594322-1.2.1.1-qmgMOrETQHSqps0ja6JKIvgxYQiRc_1B0lVnukMHk.qYgLqsF0iKx4cD7JtaNhAChMIKkITJk2sd8tiMz.8TtHAGjzetLBGGKJ1jPzx5QEqibmB0gyaMHDPkJO.7g_Wz8iaLXyXqLmDMd5ohM6VEE5lw8xAkabvyj.9ERCajsM3ATE0PwhQFo5ozrbS4uedpdpCCoEs9C11AB7dII7kpii7v5sV2NHGwVw97fDzE741EMEWsofBuGSwZqBKntXEN84GzG8jz2U3_9OG6rchZKl_7OJUWCuakDz54jvzkEm0_LWZjFS.zEUs4owRvuAaN4emT6sXzJsJf6gQjoFSCRXupOt3z10VJkYj_O_dT.8s0jZrhW2AWaQEnw7p9.Q2eovkwEq_H0B_EzKUP20B0EoZXf_MJbNn09Npit63IZuKCKBqS0y5pNeV7HgqssS7t; _hjSession_1963917=eyJpZCI6ImRmMWE4NTFjLTU3NWQtNDk3YS04OTJlLTc2YWZhNDFiMTIzMCIsImMiOjE3MzE1OTQzNDY1NjQsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MX0=; _ttp=0aueWHaVlm-oO12sh6qCS8kzFwK.tt.2; _gat_UA-64910362-1=1; _gat_UA-64910362-39=1; _gat_UA-187315934-3=1; _gat_UA-187315934-4=1; __gads=ID=1889e0dbcd0e6b08:T=1723654493:RT=1731594332:S=ALNI_MZygMTNyAG-QwA6as8BRZSEpvb9AQ; __gpi=UID=00000a4c7793f90f:T=1723654493:RT=1731594332:S=ALNI_MZkcR2HZ1aqVJQUbbrO_qtfriq-Xw; __eoi=ID=567965bec018a6ae:T=1723654493:RT=1731594332:S=AA-AfjZTCD7aIdKdn3vL7K7oYmaD; _ga_HZPJ0EKL99=GS1.3.1731594346.403.1.1731594357.0.0.0; cebsp_=4; _ga_1WKB6YC210=GS1.1.1731592075.397.1.1731594365.41.0.0; _ce.s=v~e379774ed971390f241a1d111d6d9cecf073ee9e~lcw~1731594365507~lva~1731594350558~vpv~427~as~false~vir~returning~v11.cs~419044~v11.s~57420a20-a294-11ef-b331-d99cfbe17bd5~v11.sla~1731594365867~v11.send~1731594365507~lcw~1731594365868; _ga=GA1.1.1337073397.1723654395; _ga_H7ETJY03DT=GS1.1.1731592075.394.1.1731594366.40.0.0; _ga_GDBFGFR1PC=GS1.1.1731592075.394.1.1731594366.40.0.0",
                    "Referer": `https://gamersclub.com.br/lobby/partida/${match.id}`,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            });

            if (!response.ok) {
                throw new Error(`Gamersclub API not responding for match ID: ${match.id}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[Match Service] Error fetching data for match ID: ${match.id}`, error);
            throw error;
        }
    };

}

module.exports = new MatchService();
