const cron = require('node-cron');
const MatchService = require('./services/MatchService');



const runMatchDataScheduler = async () => {
    try {
        let matches = await MatchService.getUniqueIdMatches();

        for (const match of matches) {
            console.log(`[Match Data Scheduler] Fetching data for match ID: ${match.id}`);

            const matchData = await MatchService.fetchMatchData(match);

        }

        console.log(`[Match Data Scheduler] Data updated for all matches . Total: ${matches.length}`);
    } catch (error) {
        console.error("[Match Data Scheduler] Error during scheduled data fetch and processing:", error);
    }
};

console.log("[Match Data Scheduler] Production mode activated, running every 10 minutes");
//cron.schedule('*/10 * * * *', runMatchDataScheduler);
//runMatchDataScheduler();

module.exports = runMatchDataScheduler;
