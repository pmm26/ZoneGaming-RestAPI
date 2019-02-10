//Import
const _ = require('lodash')
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');


// //TeamSpeak
// const teamspeak = require('../teamspeak/index')

// //Database
// var mongoose = require('../db/mongoose');

// var {gameArea} = require('../models/game_area')
// var {Teams} = require('../models/teams')
// var {Members} = require('../models/members')
// var {channelCrawl} = require('../models/channelCrawl')


const channelManagerRoutes = require('./routes/channelManager');

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use('/feed', channelManagerRoutes);

app.listen(3001);