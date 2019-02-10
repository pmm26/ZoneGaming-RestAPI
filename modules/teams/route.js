const express = require('express');
const { body } = require('express-validator/check');

const db = require('../../verification/helpers/db')

//Verifications
const {isAuth} = require('../../verification/auth/isAuth')
const {isChannelAdmin} = require('../../verification/channelGroups/isChannelAdmin')
const {isChannelMod} = require('../../verification/channelGroups/isChannelMod')
const {hasSpentTimeOnServer} = require('../../verification/teamSpeak/hasSpentTimeOnServer')
const {isOnline} = require('../../verification/teamSpeak/isOnline')
const {isPartOfAnotherTeam} = require('../../verification/teamSpeak/isPartOfAnotherTeam')


//Controllers
const teamController = require('./controller');

//Databases
// const Members = require('../../database/models/members');




const router = express.Router();



//Get Teams
router.get('/team', teamController.getTeams);

//Get Team
router.get('/team/:teamId', teamController.getTeamConfig, db.loadConfig, teamController.getTeam);

// //Create Team
router.put('/team', isAuth, teamController.createTeamConfig, db.loadConfig, isPartOfAnotherTeam, hasSpentTimeOnServer, isOnline, teamController.createTeam);


//Change Team Name
router.patch('/team/:teamId', isAuth, teamController.changeTeamNameConfig, db.loadConfig, isChannelAdmin, teamController.changeTeamName);

// //Upload Logo
// router.post('/logo/:teamId', dbLoad, isAuth, isChannelAdmin, teamController.uploadLogo);

// //Delete logo
// router.delete('/logo/:teamId', dbLoad, isAuth, isChannelAdmin, teamController.deleteLogo);

//Add user to team
router.post('/member/:teamId', isAuth, teamController.setUserPermissionsConfig, db.loadConfig, isChannelMod, isOnline, teamController.setUserPermissions);

//Move Team
router.patch('/move/:teamId',  isAuth, teamController.moveChannelConfig, db.loadConfig, isChannelAdmin, isOnline, teamController.moveChannel);

//Create Server Group
router.patch('/servergroup/:teamId',  isAuth, teamController.changeTeamNameConfig, db.loadConfig, isChannelAdmin, teamController.createServerGroup);

module.exports = router;


// // POST /feed/post
// router.post('/post',
//     // isAuth,
//     [
//       body('title')
//         .trim()
//         .isLength({ min: 5 }),
//       body('content')
//         .trim()
//         .isLength({ min: 5 })
//     ],
//     feedController.createTeam
//   );



// router.put('/post/:postId',
//     // isAuth,
//     [
//       body('title')
//         .trim()
//         .isLength({ min: 5 }),
//       body('content')
//         .trim()
//         .isLength({ min: 5 })
//     ],
//     feedController.updatePost
//   );

