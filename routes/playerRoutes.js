const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
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

module.exports = router;
