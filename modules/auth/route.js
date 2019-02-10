const express = require('express');
const { body } = require('express-validator/check');

//Verifications
const {isAuth} = require('../../verification/auth/isAuth')


//Controllers
const authController = require('./controller')

//Databases
// const Members = require('../../database/models/members');




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


module.exports = router;
