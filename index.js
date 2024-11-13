const express = require('express');
const { sequelize } = require('./config/db');
const matchRoutes = require('./routes/matchRoutes');
const playerRoutes = require('./routes/playerRoutes');
const fetchAndStoreMatchData = require('./scheduler');


const app = express();
app.use(cors())
const PORT = 3000;
const allowCrossDomain = (req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, `*`);
    res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.header(`Access-Control-Allow-Headers`, `*`);
    next();
  };

app.use(allowCrossDomain);

sequelize.sync()
    .then(() => console.log('Modelos sincronizados com o banco de dados.'))
    .catch((err) => console.error('Erro ao sincronizar os modelos:', err));

app.use(express.json());
app.use('/api', matchRoutes);
app.use('/api', playerRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
