const express = require('express');
const router = express.Router();
const MatchService = require('../services/MatchService');



router.get('/matches', async (req, res) => {
    try {
       
        const { idPlayer } = req.query;
        const matches = await MatchService.getMatches(idPlayer);

        if (!matches.length) {
            return res.status(404).json({ error: 'Matches not found' });
        }

        res.json(matches);
    } catch (error) {
        console.error('Error to find matches:', error);
        res.status(500).json({ error: 'Error to find matches' });
    }
});

module.exports = router;

module.exports = router;
