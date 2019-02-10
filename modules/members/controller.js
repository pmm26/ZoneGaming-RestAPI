//Import NodeJS Extensions
const { validationResult } = require('express-validator/check');

const reply = require('../apiReply');

const Members = require('../../db/models/members');

const teamSpeak = require('../../teamspeak/main')


exports.getMembers = (req, res, next) => {
  let params = {}; 
  Members.find()
  .then(data => {
    res.status(200).json(reply.success('Members Found', data));
  })
  .catch(err => {
    next(reply.failed(500, 'API getMembers: Error happened while getting the members', err, params));
  });
};

exports.getMember = (req, res, next) => {
    let params = _.pick(req.params, ['memberId']);
    Members.findById(memberId)
      .then(data => {
        if (!data) {
          throw reply.failed(404, 'API getMember: No Members where found', data, params);
        }
        res.status(200).json(reply.success('Member Found', data));
      })
      .catch(err => {
        next(reply.failed(500, 'API getMember: Error happened while getting the members', err, params));
      });
};

exports.updateDetails = (req, res, next) => {

};

exports.linkTeamSpeak = (req, res, next) => {

  let params = {
    memberId: req.memberId,
    token: req.body.token,
    uuid: req.body.uuid
  }

  Members.findById(params.memberId)
  .then(member => {
    if (!member) {
      throw reply.failed(404, 'API getUsersByIp: Member not found', 'err', 'params');
    }

      let promiseArr = member.linkTokens.map(token => {
        if ((_.isEqual(token.token, params.token)) && (_.isEqual(token.uuid, params.uuid)) && (new Date() < token.expiryDate)) {
        return true;
        }
        return false;
    });
        
    //Resolves and Checks if there was any problem with executiong returns results.
    Promise.all(promiseArr)
    .then(tokens => {
        if (tokens.includes(true))  
        return true;
        else
        return false;
    
        // do something after the loop finishes
    }).then(result => {
      if (result) {
         Members.findByIdAndUpdate(
            params.memberId,
            { $set: {   
              uuid: params.uuid,
              linkTokens: []
            }
        })
        .then(member => {
          res.status(200).json(reply.success('TeamSpeak Linked Successfully', member));
        })

      } else {
        res.status(200).json(reply.success('Wrong Token', result));
      }   
    })
    .catch(err => {
        throw reply.failed(500, 'API getUsersByIp: Error happened while checking if the user is connected to the server', err, params);
    })
  })
    //Go to the database and Find the UUID by token. 
    //Check if the ID that is going to be assign is connected using the same IP that is being used on the Website.
    //Sore UUID on the Database of the member
  };


exports.sendTokenRequest = (req, res, next) => {
  
  //Can't send requests to IDs that already on the Members Database.
  //Check the client that is being assigned matches the ip used on the website.

  let params = {
    memberId: req.memberId,
    clid: req.body.clid,
    uuid: req.body.uuid
  }


  teamSpeak.sendTokenRequest(params.memberId, params.clid, params.uuid)
    .then(data => {
      if (!data) {
        throw reply.failed(404, 'API sendTokenRequest: No Members where found', data, params);
      }
      res.status(200).json(reply.success('Token Sent', data));
    })
    .catch(err => {
      next(reply.failed(500, 'API sendTokenRequest: Error happened while sending the token', err, params));
    });

};