//Import NodeJS Extensions
const express = require('express');
const { body } = require('express-validator/check');

//Databases
const Members = require('../../db/models/members');

//Express Controller
const memberController = require('../controllers/member');



const router = express.Router();

//get members
router.get('/member', memberController.getMembers);

//Get member
router.get('/member/:memberId', memberController.getMember);

//Change Details
router.patch('/member/:memberId', memberController.updateDetails);

//Change Details
router.put('/link/:memberId', memberController.linkTeamSpeak);