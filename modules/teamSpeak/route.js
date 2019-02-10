const express = require('express');
const { body } = require('express-validator/check');

//Verifications
const {isAuth} = require('../../verification/auth/isAuth')

//Controllers
const teamSpeakController = require('./controller')

//Databases
// const Members = require('../../database/models/members');




const router = express.Router();


//Get Channels + Users. To make a viewer
router.get('/serverview', teamSpeakController.getserverView);

//Get TeamChannels + Users. To make Team Viewer
router.get('/channelview/:cid', teamSpeakController.getchannelView);

//TeamSpeak Server Info.. Players online and
router.get('/serverinfo', teamSpeakController.serverInfo);

//Get User by IP
router.get('/userip', isAuth, teamSpeakController.getUserByIp);

module.exports = router;