//Import NodeJS Extensions
const express = require('express');
const { body } = require('express-validator/check');


const {isAuth} = require('../isAuth')


//Import Controller
const teamController = require('../controllers/team');

const router = express.Router();


// //Create Team
router.put('/team', isAuth, teamController.createTeam);

//Get Teams
router.get('/team', teamController.getTeams);

//Get Team
router.get('/team/:teamId', isAuth, teamController.getTeam);

//Change Team Name
router.patch('/team/:teamId', isAuth, teamController.changeTeamName);

// //Upload Logo
// router.post('/logo/:teamId', isAuth, teamController.uploadLogo);

// //Delete logo
// router.delete('/logo/:teamId', isAuth, teamController.deleteLogo);

//Add user to team
router.put('/member/:teamId', isAuth, teamController.addUserToTeam);

//Remove user from team
router.delete('/member/:teamId', isAuth, teamController.removeUserFromTeam);

// //Move Team
router.patch('/move/:teamId', isAuth, teamController.moveChannel);

//Create Server Group
router.patch('/servergroup/:teamId', isAuth, teamController.createServerGroup);

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

