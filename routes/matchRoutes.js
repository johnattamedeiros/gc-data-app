const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const MatchService = require('../services/MatchService');



router.get('/matches', async (req, res) => {
    try {
        const matches = await MatchService.getMatches();

        if (!matches.length) {
            return res.status(404).json({ error: 'Nenhuma partida encontrada' });
        }

        res.json(matches);
    } catch (error) {
        console.error('Erro ao buscar partidas:', error);
        res.status(500).json({ error: 'Erro ao buscar partidas' });
    }
});

module.exports = router;

module.exports = router;
