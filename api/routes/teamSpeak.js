
const express = require('express');
const { body } = require('express-validator/check');


const {isAuth} = require('../isAuth')

//Databases
const Members = require('../../db/models/members');

const teamSpeakController = require('../controllers/teamSpeak')

const router = express.Router();

//Get Channels + Users. To make a viewer
router.get('/serverview', teamSpeakController.getserverView);

//Get TeamChannels + Users. To make Team Viewer
router.get('/channelview/:cid', teamSpeakController.getchannelView);

//TeamSpeak Server Info.. Players online and
router.get('/serverinfo', teamSpeakController.serverInfo);

//Get User by IP
router.get('/usersbyip', isAuth, teamSpeakController.getUsersByIp);

module.exports = router;