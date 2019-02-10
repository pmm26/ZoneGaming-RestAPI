const {ObjectId} = require('mongodb');
const _ = require('lodash');

const reply = require('../apiReply');

//Load Module
const teamSpeak = require('../teamSpeak/library/app')

//Database
const Teams = require('../../database/models/teams');
const Members = require('../../database/models/members');
const Groups = require('../../database/models/groups')

  




exports.createGroup = (req, res, next) => {
  // let params = _.pick(req.params, ['name', 'type']);

  let params = {
    name: req.body.name,
    type: req.body.type,
  }


  teamSpeak.createGroup(params.name, params.type)
  .then(data => {

    res.status(200).json(reply.success('Group Created', data));

  }).catch(err => {
    next(reply.failed(500, 'API createGroup: an error happened while creating group', err, params));
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
  
      res.status(200).json(reply.success('User Added', data));
  
    }).catch(err => {
      // console.log(err);
      next(reply.failed(500, 'API createGroup: an error happened while creating group', err, params));
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
  
      res.status(200).json(reply.success('Used Removed', data));
  
    }).catch(err => {
      // console.log(err);
      next(reply.failed(500, 'API createGroup: an error happened while creating group', err, params));
    })

  })

};
  