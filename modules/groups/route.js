const express = require('express');
const { body } = require('express-validator/check');

//Verifications
const {isAuth} = require('../../verification/auth/isAuth')
// const {isAdmin} = require('../../verification/server/isAdmin')

//Controllers
const groupsController = require('./controller')

//Databases
// const Members = require('../../database/models/members');




const router = express.Router();


//Create Group Route
router.put('/group', isAuth,  groupsController.createGroup); //isAdmin

//Add user to Group
router.put('/user/:groupId', isAuth, groupsController.addUserToGroup);

//Remove user from Group
router.delete('/user/:groupId', isAuth, groupsController.removeUserToGroup);


module.exports = router;
