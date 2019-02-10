const {ObjectId} = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const reply = require('../apiReply');

//Database
const Members = require('../../database/models/members');
const Teams = require('../../database/models/teams');



exports.signup = (req, res, next) => {
  let params = _.pick(req.body, ['email', 'password', 'name', 'nickname']);

  let member = new Members(params);

  member.save().then((user) => {

    user.generateAuthToken()
    .then((token) => {

      //Send Results
      res.status(200).header('x-auth', token).json(reply.success('User Created', user));

    }).catch((err) => { //Error happened while generating a token
      next(reply.failed(500, 'API signup: Error happened while generating a token', err, params));
    })

  }).catch((e) => { //Error happened while creating the user
    next(reply.failed(500, 'API signup: Error happened while creating the user', err, params));
  })
}

exports.me = (req, res, next) => {
  // let token = req.header('x-auth');
  // Auth.findByToken(token)
  // .then(user => {
    res.status(200).json({memberId: req.memberId});

    Teams.findByIdAndUpdate(
      "5c5f5fd9f55bc96ca680e5ad",
      { $set: {   
          nextMove: new Date(dt.getTime() - 14400*60000) //720 Minutes 
      }}, { new: true })             
  .then(team => {
      console.log(team)
  })

  // })
  // let user = req.user;
  
}

exports.login = (req, res, next) => {
  var body = _.pick(req.body, ['email', 'password']);

  Members.findByCredentials(body.email, body.password)
  .then((user) => {

    return user.generateAuthToken()
    .then((token) => {
      //Send Results
      res.status(200).header('x-auth', token).json(reply.success('Welcome Back!', user));

      
    }).catch((err) => { //Error Generating the Token
      next(reply.failed(500, 'API signup: Error happened while generating a token', err, params));
    })

  }).catch((err) => { //Error finding the User by Token
    next(reply.failed(400, 'API login: Error happened while loging-in', err, params));
  });
}

exports.removeToken = (req, res, next) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).json(reply.success('Welcome Back!', ''));
  }, () => {  //Error handeling
    next(reply.failed(400, 'API removeToken: Error happened while removing the token', 'err', params));
  });
}
