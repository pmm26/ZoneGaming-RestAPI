
const {ObjectId} = require('mongodb');
const { validationResult } = require('express-validator/check');
const _ = require('lodash');
const reply = require('../apiReply');

//Modules
const teamSpeak = require('../teamSpeak/library/app')

//Database
const Members = require('../../database/models/members');
const Teams = require('../../database/models/teams');



/**
 * 
 * @param {Object} team Object from the database 
 * @param {String} memberId ObjectID from the database
 * @param {Number} permissions Permission ID 
 * 0 - Founder, 
 * 1 - ChannelAdmin, 
 * 2 - Channel Mod, 
 * 3 - Member 
 */
exports.getTeams = (req, res, next) => {
  let params = {}; 
  Teams.find()
    .then(data => {
      if (!data) {
        throw reply.failed(404, 'API getTeams: Specified Team doesn\'t exist', data, req.input);
      }
      res.status(200).json(reply.success('Teams Found', data));
    })
    .catch(err => {
      next(reply.failed(500, 'API getTeams: Error happened while fetching Teams', err, req.input));
    });
};

exports.getTeamConfig = (req, res, next) => {

  //Input Parameters of the Route
  req.input = {...req.input,
      teamId: req.params.teamId,
    }

  //Specify which databases to load
  const loadDb = ['team'];
  req.loadDb = loadDb;
  next();
}

exports.getTeam = (req, res, next) => {

  res.status(200).json(reply.success('Team Found', req.db.team));

};

exports.createTeamConfig = (req, res, next) => {

  //Input Parameters of the Route
  req.input = {...req.input,
    name: req.body.name,
    password: req.body.password,
    areaId: req.body.areaId,
    move: req.body.move,
  }

  //Specify which databases to load
  const loadDb = ['authMember'];
  req.loadDb = loadDb;
  next()

}

exports.createTeam = (req, res, next) => {

  
    const errors = validationResult(req); // read about this
    // if (!errors.isEmpty()) {
    //   const error = new Error('Validation failed, entered data is incorrect.');
    //   error.statusCode = 422;
    //   throw error;
    // }

    //Check if there is a team with that name
    Teams.findOne({teamName: req.input.name})
    .then((team) => {

      if (!team) {
        //Create Team
        teamSpeak.createTeam(req.input.name, req.input.password, req.input.authMemberId, req.input.areaId, req.input.move)
        .then(data => {
          res.status(201).json(reply.success('Team created successfully!', data))
        })
        .catch(err => {
          next(reply.failed(500, 'API createTeam: Failed to Create a team.', err, req.input));
        });
      } else {
        next(reply.failed(500, 'API createTeam: Name is already in use.', 'err', req.input));
      }

    }).catch(err => {
      next(reply.failed(500, 'API createTeam: Erro checking if Name was already in use.', err, req.input));
    })

  }



exports.changeTeamNameConfig = (req, res, next) => {

  //Input Parameters of the Route
  req.input = {...req.input,
    teamId: req.params.teamId,
    name: req.body.name
  }
  
  //Specify which databases to load
  const loadDb = ['authMember', 'team'];
  req.loadDb = loadDb;
  next()
}

exports.changeTeamName = (req, res, next) => {

    if (req.db.team.nextNameChange < new Date()) {
  

    Teams.find({teamName: req.input.name})
    .then(teams => {
      
      if (_.isEmpty(teams)) {
        teamSpeak.changeTeamName(req.db.team, req.input.name)
        .then(data => {
          res.status(200).json(reply.success('Teams name Changed', data));
        })
      } else {
        next(reply.failed(402, 'API changeTeamName: Name already in use.', 'err', req.input));
      }
    })
    .catch(err => {
      next(reply.failed(402, 'API changeTeamName: Failed to check DB.', err, req.input));
    })
  } else {
    next(reply.failed(500, 'API changeTeamName: You can\'t change name yet.', req.db.team.nextNameChange, req.input));
  }

  
};

// exports.uploadLogo = (req, res, next) => {
//   Must be ChannelAdmin of said team.
// };

// exports.deleteLogo = (req, res, next) => {
//   Must be ChannelAdmin of said team.
// };


exports.setUserPermissionsConfig = (req, res, next) => {

  //Input Parameters of the Route
  req.input = {...req.input,
    teamId: req.params.teamId,
    memberId: req.body.memberId,
    permission: req.body.permission
  }
  
  //Specify which databases to load
  const loadDb = ['authMember', 'team', 'member'];
  req.loadDb = loadDb;
  next()
}


exports.setUserPermissions = (req, res, next) => {



  let members =   req.db.team.members.filter(function(member) {
    return _.isEqual(member.memberId, req.db.authMember._id);
  });

  if (!_.isEmpty(members)) {
    if (req.input.permission > members[0].permissions) {

      teamSpeak.addUserToTeam(req.db.team, req.db.member, req.input.permission)
          .then(data => {

            res.status(200).json(reply.success('User Permissions Changed Sucessfully', data));

          }).catch(err => {
        next(reply.failed(500, 'API addUserToTeam: An error hapenned while Adding the user the team.', err, req.input));
      });
    } else {
      next(reply.failed(500, 'API addUserToTeam: You don\'t have enought permissions to do this operation.', 'err', req.input));
    }
  } else {
    next(reply.failed(500, 'API addUserToTeam: You are not part of this team.', 'err', req.input));
  }
};





exports.moveChannelConfig = (req, res, next) => {

  //Input Parameters of the Route
  req.input = {...req.input,
    teamId: ObjectId(req.params.teamId),
    newTeamId: ObjectId(req.body.newTeamId)
  }
  
  //Specify which databases to load
  const loadDb = ['authMember', 'team'];
  req.loadDb = loadDb;
  next()

}

exports.moveChannel = (req, res, next) => {

  //Must not be in the timeout of 1 Day.
  if (req.db.team.nextMove < new Date()) {

   
      teamSpeak.moveChannel(req.db.team, req.input.newTeamId) 
      .then(data => {
        if (!data) {
          throw reply.failed(404, 'API moveChannel: Specified Team doesn\'t exist', data, req.input);
        }
        res.status(200).json(reply.success('Channel Moved Sucessfully', data))
      })
      .catch(err => {
        next(reply.failed(500, 'API moveChannel: An error hapenned while moving the channel.', err, req.input));
      });
   
    } else {
      next(reply.failed(500, 'API moveChannel: You can\'t move your channel yet.', req.db.team.nextMove, req.input));
    }
};


exports.createServerGroupConfig = (req, res, next) => {

  //Input Parameters of the Route
  req.input = {...req.input,
    teamId: req.params.teamId,
  }
  
  //Specify which databases to load
  const loadDb = ['authMember', 'team'];
  req.loadDb = loadDb;
  next()

}

exports.createServerGroup = (req, res, next) => {

  if (_.isNull(req.db.team.serverGroupId)) {

    teamSpeak.createServerGroup(req.db.team) 
    .then(data => {
      if (!data) {
        throw reply.failed(404, 'API createServerGroup: Specified Team doesn\'t exist', data, req.input);
      }
      res.status(200).json(reply.success('Server Group Created!', data));
    })
    .catch(err => {
      next(reply.failed(500, 'API createServerGroup: An error hapenned while creating a Group.', err, req.input));
    });

  } else {

    next(reply.failed(500, 'API createServerGroup: This team already has a ServerGroup.', 'err', req.input));
  }
};

