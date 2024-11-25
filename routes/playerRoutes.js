const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const HighestStatPlayers = require('../models/HighestStatPlayers');
const LowestStatPlayers = require('../models/LowestStatPlayers');
const RatingDiffByPlayer = require('../models/RatingDiffByPlayer');
const PlayerService = require('../services/PlayerService');

router.get('/update-players', async (req, res) => {
    try {
        await PlayerService.runPlayerScheduler();
        res.status(200).json({ success: 'ok' });
    } catch (err) {
        res.status(500).json({ error: 'Error to update Players' });
    }
});
router.get('/player', async (req, res) => {
    try {
        const players = await PlayerService.getPlayers();
        res.json(players);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error to find Players' });
    }
});
router.get('/player/info/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const player = await PlayerService.getPlayerById(id);

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json(player);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error to find Player' });
    }
});
router.post('/player', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Field id no null.' });
        }
        let player = await PlayerService.getPlayerById(id);

        if (player) {
            await PlayerService.activePlayer(player.id);
            console.log('[Player Route] Fetching player data on reactivate ');
            PlayerService.fetchUpdatePlayerData(player);
            
        } else {
            const newPlayer = await Player.create({ id });
            console.log('[Player Route] Fetching player data on create ');
            PlayerService.fetchUpdatePlayerData(newPlayer);
            player = newPlayer;
        }

        return res.status(201).json(player);
    } catch (error) {
        console.error('[Player Route] Error to insert player:', error);
        res.status(500).json({ error: 'Error to insert player.' });
    }
});

router.get('/player/highest-stats', async (req, res) => {
    try {
        const stats = await HighestStatPlayers.findAll();

        if (!stats.length) {
            return res.status(404).json({ error: 'No stats found' });
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error('[Player Route] Error fetching highest stats:', error);
        res.status(500).json({ error: 'Error fetching highest stats' });
    }
});

router.get('/player/lowest-stats', async (req, res) => {
    try {
        const stats = await LowestStatPlayers.findAll();

        if (!stats.length) {
            return res.status(404).json({ error: 'No stats found' });
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error('[Player Route] Error fetching lowest stats:', error);
        res.status(500).json({ error: 'Error fetching lowest stats' });
    }
});

router.get('/player/rating-diff', async (req, res) => {
    try {
        const data = await RatingDiffByPlayer.findAll();

        if (!data.length) {
            return res.status(404).json({ error: 'No data found' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('[Player Route] Error fetching data from view:', error);
        res.status(500).json({ error: 'Error fetching data from view' });
    }
});


module.exports = router;
