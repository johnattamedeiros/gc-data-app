const cron = require('node-cron');
const MatchService = require('./services/MatchService');
const PlayerService = require('./services/PlayerService');

const fetchAndStoreMatchData = async () => {
    try {
        const sequelizedPlayers = await PlayerService.getPlayers();

        for (const sequelizedPlayer of sequelizedPlayers) {
            const player = sequelizedPlayer.dataValues;
            console.log('------------------------ BUSCANDO DADOS DO PLAYER : ' + player.id);
            const responsePlayerData = await fetch("https://gamersclub.com.br/api/box/init/" + player.id, {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                    "authorization": "Basic ZnJvbnRlbmQ6NDdhMTZHMmtHTCFmNiRMRUQlJVpDI25X",
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
                    "cookie": "_gcl_au=1.1.1590980947.1721331780; sib_cuid=04e52cc9-97c5-4103-abf6-e38e62bd13c9; _tt_enable_cookie=1; _ttp=2esRiodI6t1x5LPRySOjX7u9WWk; _fbp=fb.2.1721331780341.773965149448558284; 51QQyhcLyDRpqrY2Gh3vO=1; language=pt-br; _hjSessionUser_2263196=eyJpZCI6IjRiNDA3MmE1LTgyZDEtNWE4YS04OGIyLWRmMDhmMzQ2YzQ1YSIsImNyZWF0ZWQiOjE3MjEzMzE4MDQzODgsImV4aXN0aW5nIjp0cnVlfQ==; _ga_H7ETJY03DT=deleted; _hjSessionUser_1963917=eyJpZCI6IjljYmYxMTc1LWY5YjUtNTFhMy04NDhkLThmNjI0MjJhYWNjMCIsImNyZWF0ZWQiOjE3MjEzMzE3ODA0NDMsImV4aXN0aW5nIjp0cnVlfQ==; FCNEC=%5B%5B%22AKsRol8u-xh6f5r9W-JxCXRYmR3VeN2KIl4eq9iSXBOXcFyn-oGGujvsYAa3Xj543FDN8_XNygfWBnOhrxPnjr6fzosyAnakZUdgEDmtp4f-tko1e_5cHnhiZKkqLKyKDCs6SG2-sBpFOWy1aLH1N1LH7ktSiW0X2A%3D%3D%22%5D%5D; _ga_GDBFGFR1PC=deleted; _gid=GA1.3.279895920.1722811358; cf_clearance=HCae7RpgM4aGLvB6QFXdeyrimb8RZE6KTuoQ6NCp5pw-1722969215-1.0.1.1-jACbj1cgcTRHxJVenSBfQ4p6tBIZMaCpdaZ1UDe0D2oMrw5b4UqufSIYIw6yjfkI0MJsUR3IAmqyfsYU9JN2_w; gclubsess=b320a516e518da61054d2290cc7dcecd744339e3; _ce.clock_event=1; _ce.clock_data=102%2C179.84.96.52%2C1%2C362d7fe3d8b2581bffa359f0eeda7106%2CChrome%2CBR; _ce.irv=returning; cebs=1; __gads=ID=db0b9dc7a53addde:T=1721331810:RT=1723131653:S=ALNI_Ma1jwgyXt8fsGiANg8esF-Zf8xcbw; __gpi=UID=00000a441187fc73:T=1721331810:RT=1723131653:S=ALNI_MbcZ0Q8WX-afz5uNySvNacjPPHVtw; __eoi=ID=8397c1bb7f786164:T=1721331810:RT=1723131653:S=AA-Afja_pE7zIv0WfAknrz41F7xt; _hjSession_2263196=eyJpZCI6Ijg2YzU4ZTcxLWUzOTUtNDMwMy1iMzkxLWM5Njk2YTcxZTg4MSIsImMiOjE3MjMxNDI1ODg0MDcsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MH0=; _ga_HZPJ0EKL99=GS1.3.1723142589.71.1.1723143049.0.0.0; cebsp_=9; _ga=GA1.3.1439008375.1721331780; __cf_bm=S77t1F1sZIQyJQZaD8IQrPpaTFHpeBOv1zr3ZdULJeE-1723144527-1.0.1.1-r9U0nm_GFVB8AnBIZhAf.gT_ee15tk03mFwUCqFo_I5ZXePh5KlH8kzFxttK2zg6cgYMITZEY5QxhQWDPTLi0A; _ga_1WKB6YC210=GS1.1.1723142587.71.1.1723144587.60.0.0; _ga_H7ETJY03DT=GS1.1.1723142587.70.1.1723144587.60.0.0; _ga_GDBFGFR1PC=GS1.1.1723142587.70.1.1723144587.60.0.0; _ce.s=v~8a00dc3dfad74339831de1e854c3626d3a5ff9f2~lcw~1723144587313~lva~1723131241018~vpv~64~as~false~v11.cs~419044~v11.s~0fad28f0-55b6-11ef-873e-bf6b48c0a56b~v11.sla~1723144587666~v11.send~1723144587087~lcw~1723144587666",
                    "Referer": "https://gamersclub.com.br/player/" + player.id,
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            });

            if (!responsePlayerData.ok) throw new Error('Gamersclub API not responding with this id');
            const playerData = await responsePlayerData.json();
            if (playerData.playerInfo.id > 0) {
                if (playerData.lastMatches) {
                    if (playerData.lastMatches[0]) {
                        let lastMatch = playerData.lastMatches[0];
                        if (lastMatch.id !== player.idLastMatch) {
                            lastMatch["idPlayer"] = player.id;
                            MatchService.insertMatch(lastMatch);
                            PlayerService.updateLastMatchForPlayer(player.id, lastMatch.id);
                        } else {
                            console.log("Partida " + lastMatch.id + " já foi inserida para o player " + player.id);
                        }
                    }
                }
                if(playerData.playerInfo){
                    PlayerService.updatePlayer(player.id, playerData.playerInfo);
                }
               
                
            }
        }
        console.log('All players updated data. Total: ' + sequelizedPlayers.length);
    } catch (error) {
        console.log('----------------------- Erro durante agendamento e captura de dados ------------------------');
        console.log(error);
    }

};
//fetchAndStoreMatchData();
cron.schedule('*/5 * * * *', fetchAndStoreMatchData);

module.exports = fetchAndStoreMatchData;
