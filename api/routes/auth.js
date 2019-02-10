//Import NodeJS Extensions
const express = require('express');
const { body } = require('express-validator/check');


//Databases
// const MemberLogin = require('../../db/models/unsused/'); //wrong route

//Express Controller
const authController = require('../controllers/auth');

const {isAuth} = require('../isAuth')

const router = express.Router();

router.put(
  '/signup',
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
  authController.signup
);


router.put('/login', authController.login
);

router.put('/me', isAuth, authController.me
);

// router.post('/login', authController.login);

module.exports = router;
