const express = require('express');
require('dotenv').config();
const router = express.Router();
const { exec } = require('child_process');
const bodyParser = require('body-parser');

router.post('/webhook', (req, res) => {
    const sig = req.headers['x-hub-signature-256'];

    console.log("Acionando webhook");
    if (process.env.SECRET && sig !== `sha256=${require('crypto').createHmac('sha256', process.env.SECRET).update(JSON.stringify(req.body)).digest('hex')}`) {
        console.log("Secret incorreto");
        return res.status(403).send('Invalid signature.');
    }

    const { ref } = req.body;
    if (ref === 'refs/heads/main') {
        console.log('Push na master detectado! Executando script...');

        // Executar o script .sh
        exec('bash /usr/projects/gc-data-app/Rebuild.sh', (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao executar script: ${error.message}`);
                return res.status(500).send('Erro ao executar script.');
            }

            console.log(`Saída do script: ${stdout}`);
            console.error(`Erros do script: ${stderr}`);
            res.status(200).send('Script executado com sucesso.');
        });
    } else {
        console.log("Push identificado porém não é na master");
        res.status(200).send('Não é um push na master. Nada a fazer.');
    }
});


module.exports = router;
