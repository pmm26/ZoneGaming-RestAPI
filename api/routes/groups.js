//Import NodeJS Extensions
const express = require('express');
const { body } = require('express-validator/check');


//Databases
// const MemberLogin = require('../../db/models/unsused/'); //wrong route

//Express Controller
const groupsController = require('../controllers/groups');

const {isAuth} = require('../isAuth')

const router = express.Router();

router.put(
  '/group', isAuth,
  // [
  //   body('email')
  //     .isEmail()
  //     .withMessage('Please enter a valid email.')
  //     .custom((value, { req }) => {
  //       return MemberLogin.findOne({ email: value }).then(memberDoc => {
  //         if (memberDoc) {
  //           return Promise.reject('E-Mail address already exists!');
  //         }
  //       });
  //     })
  //     .normalizeEmail(),
  //   body('password')
  //     .trim()
  //     .isLength({ min: 5 }),
  // ],
  groupsController.createGroup
);


router.put('/user/:groupId', isAuth, groupsController.addUserToGroup);

router.delete('/user/:groupId', isAuth, groupsController.removeUserToGroup);


module.exports = router;
