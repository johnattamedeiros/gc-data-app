const cron = require('node-cron');
const PlayerService = require('./services/PlayerService');

const runPlayerScheduler = async () => {
    try {
        let players = await PlayerService.getPlayers();
        for (const playerInstance of players) {
            const player = playerInstance.dataValues;
            await PlayerService.fetchUpdatePlayerData(player);
        }

        console.log(`[Player Scheduler] Data updated for all players. Total: ${players.length}`);
    } catch (error) {
        console.error("[Player Scheduler]Error during scheduled data fetch and processing:", error);
    }
};

console.log("[Player Scheduler] Production mode activated, running every 1 hour");
cron.schedule('0 * * * *', runPlayerScheduler);
//runPlayerScheduler();

module.exports = runPlayerScheduler;
