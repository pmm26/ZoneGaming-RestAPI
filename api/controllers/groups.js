//Import NodeJS Extensions
const { validationResult } = require('express-validator/check');
const _ = require('lodash');


// const Members = require('../../db/models/members');

const teamSpeak = require('../../teamspeak/main')
// const Members = require('../../db/models/members');
const Teams = require('../../db/models/teams');
const Members = require('../../db/models/members');
const Groups = require('../../db/models/groups')

const failedApiReply = (statusCode, message, data, params) => {

  let failedRequest = data;

  if (data) {
    if(!(data.statusCode)) {
      failedRequest = Object.assign({
        statusCode: statusCode,
        params: params
      }, data);
    }

    if (!(data.message)) {

      failedRequest = {
        statusCode: statusCode,
        status: 'FaiL',
        message: message,
        error: data,  
        params: params
      }
    }

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
  




exports.createGroup = (req, res, next) => {
  // let params = _.pick(req.params, ['name', 'type']);

  let params = {
    name: req.body.name,
    type: req.body.type,
  }


  teamSpeak.createGroup(params.name, params.type)
  .then(data => {

    res.status(200).json(ApiReply('Group Created', data));

  }).catch(err => {
    next(failedApiReply(500, 'API createGroup: an error happened while creating group', err, params));
  })
};

exports.addUserToGroup = (req, res, next) => {

  //ADD CHECK TO SEE IF USER IS ALREADY PART OF X AMOUNT OF GROUPS

  let params = {
    groupId: req.params.groupId,
    memberId: req.body.memberId,
  }
  console.log(params)
  
  Members.findById(params.memberId)
  .then(member => {

    teamSpeak.addUserToGroup(params.groupId, member)
    .then(data => {
  
      res.status(200).json(ApiReply('Group Created', data));
  
    }).catch(err => {
      // console.log(err);
      next(failedApiReply(500, 'API createGroup: an error happened while creating group', err, params));
    })

  })

 
  
};


exports.removeUserToGroup = (req, res, next) => {

  let params = {
    groupId: req.params.groupId,
    memberId: req.body.memberId,
  }
  console.log(params)
  
  Members.findById(params.memberId)
  .then(member => {

    teamSpeak.removeUserToGroup(params.groupId, member)
    .then(data => {
  
      res.status(200).json(ApiReply('Group Created', data));
  
    }).catch(err => {
      // console.log(err);
      next(failedApiReply(500, 'API createGroup: an error happened while creating group', err, params));
    })

  })

};
  