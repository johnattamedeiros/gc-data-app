const express = require('express');
const { sequelize } = require('./config/db');

const Match = require('./models/Match');
const Player = require('./models/Player');
const MatchData = require('./models/MatchData');

const matchRoutes = require('./routes/matchRoutes');
const playerRoutes = require('./routes/playerRoutes');

//const playerScheduler = require('./playerScheduler');
//const matchScheduler = require('./matchScheduler');
//const matchDataScheduler = require('./matchDataScheduler');
var cors = require('cors')

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
    .then(() => console.log('Models of databased updated.'))
    .catch((err) => console.error('Error to syncronize models:', err));

app.use(express.json());
app.use('/api', matchRoutes);
app.use('/api', playerRoutes);

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);
});
