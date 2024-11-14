const cron = require('node-cron');
require('dotenv').config();
const MatchService = require('./services/MatchService');
const PlayerService = require('./services/PlayerService');

const fetchMatchData = async (match) => {
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
        console.error(`Error fetching data for match ID: ${match.id}`, error);
        throw error;
    }
};

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

    matchDataCapture["teamAResults"] = await getTeamResults(matchData.jogos.players.team_a);
    matchDataCapture["teamBResults"] = await getTeamResults(matchData.jogos.players.team_b);

    await MatchService.insertMatchData({id:id,data:matchDataCapture});
    console.log(`Data updated for match : ${id}`)

};

const fetchAndStoreMatchData = async () => {
    try {
        let matches = await MatchService.getUniqueIdMatches();

        for (const match of matches) {
            console.log(`Fetching data for match ID: ${match.id}`);

            const matchData = await fetchMatchData(match);
            await processSaveMatchData(match.id, matchData);

        }

        console.log(`Data updated for all matches . Total: ${matches.length}`);
    } catch (error) {
        console.error("Error during scheduled data fetch and processing:", error);
    }
};
//fetchAndStoreMatchData();
console.log("[MATCH SCHEDULER] Production mode activated, running every 5 minutes");
cron.schedule('*/5 * * * *', fetchAndStoreMatchData);

module.exports = fetchAndStoreMatchData;
