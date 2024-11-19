const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const HighestStatPlayers = require('../models/HighestStatPlayers');
const LowestStatPlayers = require('../models/LowestStatPlayers');
const RatingDiffByPlayer = require('../models/RatingDiffByPlayer');
const PlayerService = require('../services/PlayerService');


router.get('/player', async (req, res) => {
    try {
        const players = await PlayerService.getPlayers();
        res.json(players);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error to find Players' });
    }
});
router.post('/player', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Field id no null.' });
        }
        const newPlayer = await Player.create({ id });

        res.status(201).json(newPlayer);
    } catch (error) {
        console.error('Error to insert player:', error);
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
        console.error('Error fetching highest stats:', error);
        res.status(500).json({ error: 'Error fetching highest stats' });
    }
});

router.get('/player/lowest-stats', async (req, res) => {
    try {
        const stats = await LowestStatPlayers.findAll(); // Busca todos os registros da view

        if (!stats.length) {
            return res.status(404).json({ error: 'No stats found' });
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching lowest stats:', error);
        res.status(500).json({ error: 'Error fetching lowest stats' });
    }
});

router.get('/player/rating-diff', async (req, res) => {
    try {
        const data = await RatingDiffByPlayer.findAll(); // Busca todos os registros da view

        if (!data.length) {
            return res.status(404).json({ error: 'No data found' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data from view:', error);
        res.status(500).json({ error: 'Error fetching data from view' });
    }
});


module.exports = router;
