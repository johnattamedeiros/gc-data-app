const cron = require('node-cron');
const MatchService = require('./services/MatchService');

const getTeamResults = async (teamResults) => {
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

const processSaveMatchData = async (id, matchData) => {
    let matchDataCapture = {};
    matchDataCapture["prob_win_a"] = matchData.prob_win_a;
    matchDataCapture["prob_win_b"] = matchData.prob_win_b;
    matchDataCapture["data"] = matchData.data;

    matchDataCapture["teamAResults"] = await getTeamResults(matchData.jogos.players.team_a);
    matchDataCapture["teamBResults"] = await getTeamResults(matchData.jogos.players.team_b);

    await MatchService.insertMatchData({ id: id, data: matchDataCapture });
    console.log(`[Match Data Scheduler] Data updated for match : ${id}`)

};

const runMatchDataScheduler = async () => {
    try {
        let matches = await MatchService.getUniqueIdMatches();

        for (const match of matches) {
            console.log(`[Match Data Scheduler] Fetching data for match ID: ${match.id}`);

            const matchData = await MatchService.fetchMatchData(match);
            await processSaveMatchData(match.id, matchData);

        }

        console.log(`[Match Data Scheduler] Data updated for all matches . Total: ${matches.length}`);
    } catch (error) {
        console.error("[Match Data Scheduler] Error during scheduled data fetch and processing:", error);
    }
};

console.log("[Match Data Scheduler] Production mode activated, running every 10 minutes");
cron.schedule('*/10 * * * *', runMatchDataScheduler);
//runMatchDataScheduler();


module.exports = runMatchDataScheduler;
