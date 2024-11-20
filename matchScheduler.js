const cron = require('node-cron');
const PlayerService = require('./services/PlayerService');
const MatchService = require('./services/MatchService');

const runMatchByPlayerScheduler = async () => {
    try {
        let players = await PlayerService.getPlayersToScheduler();
        for (const player of players) {
            await MatchService.fetchUpdateMatchesByPlayer(player);
        }

        console.log(`[Match Scheduler] Data updated for all players matches. Total: ${players.length}`);
    } catch (error) {
        console.error("[Match Scheduler]Error during scheduled data fetch and processing:", error);
    }
};

console.log("[Match Scheduler] Production mode activated, running every 20 minutes");
//cron.schedule('*/20 * * * *', runMatchByPlayerScheduler);
runMatchByPlayerScheduler();


module.exports = runMatchByPlayerScheduler;
