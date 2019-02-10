//Import NodeJS Extensions
const {ObjectId} = require('mongodb'); // or ObjectID 
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');
const teamSpeak = require('../../teamspeak/main')
const _ = require('lodash');


//Databases
const Members = require('../../db/models/members');
const Teams = require('../../db/models/teams');


const failedApiReply = (statusCode, message, data, params) => {

  let failedRequest = data;

  if (data) {
    //If there was a error from the API request
    if(!(data.statusCode)) {
      failedRequest = Object.assign({
        statusCode: statusCode,
        params: params
      }, data);
    }

    //IF there is an error sent from the TeamSpeak File
    if (!(data.message)) {

      failedRequest = {
        statusCode: statusCode,
        status: 'FaiL',
        message: message,
        error: data,  
        params: params
      }
    }
  
    //If Data is null
  } else {
    
    failedRequest = {
      statusCode: statusCode,
      status: 'FaiL',
      message: message,
      error: data,  
      params: params
    }
  }

  return failedRequest;

}

const ApiReply = (message, data) => {

     api = {
        status: 'OK',
        message: message,
        server: data
      }

      return api;

}

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
const isAdmin = (team, memberId, permissions) => {

  let promiseArr = team.members.map(member => {
    if (_.isEqual(member.memberId, memberId) && member.permissions <= permissions ) {
      // console.log(true);
      return true;
    }
    return false;
  });
    
  //Resolves and Checks if there was any problem with executiong returns results.
  return Promise.all(promiseArr)
  .then(mainChannelsIDs => {
    if (mainChannelsIDs.includes(true))  
      return  true;
    else
      return false;

      // do something after the loop finishes
  }).catch(err => {
    throw failedApiReply(500, 'API isAdmin: Error happened while checking user\'s permissions', err, params);
  })


}

exports.getTeams = (req, res, next) => {
  let params = {}; 
  Teams.find()
    .then(data => {
      if (!data) {
        throw failedApiReply(404, 'API getTeams: Specified Team doesn\'t exist', data, params);
      }
      res.status(200).json(ApiReply('Teams Found', data));
    })
    .catch(err => {
      next(failedApiReply(500, 'API getTeams: Error happened while fetching Teams', err, params));
    });
};

exports.getTeam = (req, res, next) => {

  let params = _.pick(req.params, ['teamId']);

    Teams.findById(params.teamId)
      .then(data => {
        if (!data) {
          throw failedApiReply(404, 'API getTeam: Specified Team doesn\'t exist', data, params);
        }

        res.status(200).json(ApiReply('Team Found', data));
      })
      .catch(err => {
        next(failedApiReply(500, 'API getTeam: Error happened while fetching Team', err, params));
      });
};

exports.createTeam = (req, res, next) => {

    //No team should have that name.
    //Identety and ID should not be in the BlackList.
    //Member Should be part of any other Team. Appart from "Special" Teams.
  
    const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   const error = new Error('Validation failed, entered data is incorrect.');
    //   error.statusCode = 422;
    //   throw error;
    // }

    // IP e Unique ID nao podem estar na BlackList. BlackList nao sei para que serve
    // Nao pode Outro Canal a nao ser que seja Admin
    // Deve ter o ServerGroup X para poder fazer salas
    //


    let params = {

      memberId: req.memberId,
      name: req.body.name,
      password: req.body.password,
      areaId: ObjectId(req.body.areaId),
      move: req.body.move,

    }


    teamSpeak.createTeam(params.name, params.password, params.memberId, params.areaId, params.move)

    // //Check if there is any other team with the same Name.
    // Teams.find()
    //   .then(teams => {
    //     // console.log(teams);
    //     return teams.map(team => {
    //       if (_.isEqual(name, team.teamName)) {
    //         throw failedApiReply('Name is already in use!', name)
    //       }  
    //       //Check if the Member is part of any other team.
    //       Members.find()
    //       .then(members => {
    //         return members.map(member => {
    //           return member.channels.map(channel => {
    //             if (!channel.specialChannel) {
    //               throw failedApiReply('You already have a channel!', name)

    //             }
    //           })
            
    //         })


    //       })

    //     });
    //   })
      .then(data => {
        res.status(201).json(ApiReply('Team created successfully!', data))
      })
      .catch(err => {
        next(failedApiReply(500, 'API createTeam: Name is already in use.', err, params));
      });
  }





exports.changeTeamName = (req, res, next) => {

  let params = {
    memberId: req.memberId,
    teamId: ObjectId(req.params.teamId),
    name: req.body.name
  }

  //Add a way for a an admin to to execute this route.

  // //Check if team Exist 
  // Teams.findById(params.teamId)
  // .then(team => {
  //   if (!team) {
  //     throw failedApiReply(404, 'API changeTeamName: Specified Team doesn\'t exist', data, params);
  //   }


  // Must be ChannelAdmin of said team. *Done
    // Nao pode ter Outro Canal a nao ser que seja Admin 
    // Add 10 sec timeout
    // Outro Canal nao deve ter esse Nome *Done
    // Captcha


  Teams.findByIdAndUpdate(params.teamId,
    { $set: {   
        teamName: params.name,
    }}, 
    { new: true })
    .then(team => {



        //Check if User has enough permissions
      isAdmin(team, params.memberId, 2)
      .then(swag => {
        if (!(swag)) {
          throw failedApiReply(403, 'You don\'t have enought permissions to perform this action', params.teamId, params)
        }
      })

        teamSpeak.changeTeamName(team, name)
        .then(data => {
          res.status(200).json(ApiReply('Teams name Changed', data));
        })
  
    .catch(err => {
      next(failedApiReply(500, 'API changeTeamName: An error hapenned while changing the name.', err, params));
    });
  })
};

// exports.uploadLogo = (req, res, next) => {
//   Must be ChannelAdmin of said team.
// };

// exports.deleteLogo = (req, res, next) => {
//   Must be ChannelAdmin of said team.
// };

exports.addUserToTeam = (req, res, next) => {

  //Must be ChannelAdmin of said team.
  //Member isn't already in the highest Rank


  let params = {
    memberId: req.memberId,
    teamId: ObjectId(req.params.teamId),
    adminLevel: req.body.adminLevel
  }

  teamSpeak.addUserToTeam(params.teamId, params.memberId, params.adminLevel)
  .then(data => {
    if (!data) {
      throw failedApiReply(404, 'API addUserToTeam: Specified Team doesn\'t exist', data, params);
    }
    res.status(200).json(ApiReply('User added to the team Sucessfully', data));
  })
  .catch(err => {
    next(failedApiReply(500, 'API addUserToTeam: An error hapenned while Adding the user the team.', err, params));
  });

};

exports.removeUserFromTeam = (req, res, next) => {

  //Must be ChannelAdmin of said team.
  //Founder can't be removed.
  //Can't be part of the team

  let params = {
    memberId: req.memberId,
    teamId: ObjectId(req.params.teamId),
  }

  teamSpeak.removeUserFromTeam(params.teamId, params.memberId)
  .then(data => {
    if (!data) {
      throw failedApiReply(404, 'API removeUserFromTeam: Specified Team doesn\'t exist', data, params);
    }
    res.status(200).json(ApiReply('User removed from the team Sucessfully', data));
  })
  .catch(err => {
      next(failedApiReply(500, 'API removeUserFromTeam: An error hapenned while removing the user from the team.', err, params));
  })
};

exports.moveChannel = (req, res, next) => {

  //Must not be in the timeout of 1 Day.
  //Must be ChannelAdmin of said team.
  //Channel Must be Free

  let params = {
    memberId: req.memberId,
    oldTeamId: ObjectId(req.params.teamId),
    newTeamId: ObjectId(req.body.teamId)
  }
  
  //Add testing. Make sure the channel that is replacing is not in use and that the channel isn't in timeout.

  teamSpeak.moveChannel(params.oldTeamId, params.newTeamId) 
  .then(data => {
    if (!data) {
      throw failedApiReply(404, 'API moveChannel: Specified Team doesn\'t exist', data, params);
    }
    res.status(200).json(ApiReply('Channel Moved Sucessfully', data))
  })
  .catch(err => {
    next(failedApiReply(500, 'API moveChannel: An error hapenned while moving the channel.', err, params));
  });

};

exports.createServerGroup = (req, res, next) => {

  let params = {
    memberId: req.memberId,
    teamId: ObjectId(req.params.teamId),
  }

  //Must be ChannelAdmin of said team.
  //ServerGroup should not exist previously.

  
  //Add testing. Make sure the channel that is replacing is not in use and that the channel isn't in timeout.

  teamSpeak.createServerGroup(params.teamId) 
  .then(data => {
    if (!data) {z
      throw failedApiReply(404, 'API createServerGroup: Specified Team doesn\'t exist', data, params);
    }
    res.status(200).json(ApiReply('Server Group Created!', data));
  })
  .catch(err => {
    next(failedApiReply(500, 'API createServerGroup: An error hapenned while creating a Group.', err, params));
  });

};

