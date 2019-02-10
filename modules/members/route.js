const express = require('express');
const { body } = require('express-validator/check');

//Verifications
const {isAuth} = require('../../verification/auth/isAuth')
const {isOnline} = require('../../verification/teamSpeak/isOnline')


//Controllers
const memberController = require('./controller');

//Databases
// const Members = require('../../database/models/members');




const router = express.Router();


//get members
router.get('/member', memberController.getMembers);

//Get member
router.get('/member/:memberId', memberController.getMember);

//UpdateDetails
router.patch('/member/:memberId', isAuth, memberController.updateDetails);

//Link TeamSpeak
router.put('/link/:memberId', isAuth, isOnline, memberController.linkTeamSpeak);

//Link TeamSpeak
router.post('/link/:memberId', isAuth, isOnline, memberController.sendTokenRequest);


module.exports = router;