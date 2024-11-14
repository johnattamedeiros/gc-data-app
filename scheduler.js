const cron = require('node-cron');
require('dotenv').config();
const MatchService = require('./services/MatchService');
const PlayerService = require('./services/PlayerService');

const fetchPlayerData = async (player) => {
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
            throw new Error(`Gamersclub API not responding for player ID: ${player.id}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching data for player ID: ${player.id}`, error);
        throw error;
    }
};

const processPlayerMatches = async (player, playerData) => {
    if (!playerData.lastMatches || !playerData.lastMatches.length) {
        console.log(`No recent matches found for player ID: ${player.id}`);
        return;
    }
    let latestMatch = playerData.lastMatches[0];

    if (latestMatch.daysInactive) {
        console.log(`Player ID: ${player.id} is inactive.`);
        return;
    }

    if (latestMatch.id !== player.idLastMatch) {
        console.log(`New match found for player ID: ${player.id}, Match ID: ${latestMatch.id}`);
        latestMatch.idPlayer = player.id;
        await MatchService.insertMatch(latestMatch);
        await PlayerService.updateLastMatchForPlayer(player.id, latestMatch.id);
    } else {
        console.log(`Match ID: ${latestMatch.id} already recorded for player ID: ${player.id}`);
    }
};

const updatePlayerData = async (player, playerData) => {
    if (playerData) {
        console.log(`Updating player data for ID: ${player.id}`);
        await PlayerService.updatePlayer(player.id, playerData);
    }
};

const fetchAndStoreMatchData = async () => {
    try {
        let players = await PlayerService.getPlayers();
        if (process.env.DEBUG) {
            console.warn("@@@@@@@ Debug mode activated, finding only 1 player @@@@@@@");
            let playerDebug = await PlayerService.getPlayerById(process.env.DEBUG);
            players = [];
            players[0] = playerDebug;
        }

        for (const playerInstance of players) {
            const player = playerInstance.dataValues;
            console.log(`Fetching data for player ID: ${player.id}`);

            const playerData = await fetchPlayerData(player);

            if (playerData?.playerInfo?.id > 0) {
                await processPlayerMatches(player, playerData);
                await updatePlayerData(player, playerData);
            }
        }

        console.log(`Data updated for all players. Total: ${players.length}`);
    } catch (error) {
        console.error("Error during scheduled data fetch and processing:", error);
    }
};
if (process.env.DEBUG) {
    console.warn("@@@@@@@ Debug mode activated, running every 5 minutes @@@@@@@");
    fetchAndStoreMatchData();
} else {
    console.log("Production mode activated, running every 5 minutes");
    cron.schedule('*/5 * * * *', fetchAndStoreMatchData);
}


module.exports = fetchAndStoreMatchData;
