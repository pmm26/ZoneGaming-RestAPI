const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');


const Members = require('../../db/models/members');

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



exports.signup = (req, res, next) => {
  let params = _.pick(req.body, ['email', 'password', 'name', 'nickname']);

  let member = new Members(params);

  member.save().then((user) => {

    user.generateAuthToken()
    .then((token) => {

      //Send Results
      res.status(200).header('x-auth', token).json(ApiReply('User Created', user));

    }).catch((err) => { //Error happened while generating a token
      next(failedApiReply(500, 'API signup: Error happened while generating a token', err, params));
    })

  }).catch((e) => { //Error happened while creating the user
    next(failedApiReply(500, 'API signup: Error happened while creating the user', err, params));
  })
}

exports.me = (req, res, next) => {
  // let token = req.header('x-auth');
  // Auth.findByToken(token)
  // .then(user => {
    res.status(200).json({memberId: req.memberId});
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
      res.status(200).header('x-auth', token).json(ApiReply('Welcome Back!', user));

      
    }).catch((err) => { //Error Generating the Token
      next(failedApiReply(500, 'API signup: Error happened while generating a token', err, params));
    })

  }).catch((err) => { //Error finding the User by Token
    next(failedApiReply(400, 'API login: Error happened while loging-in', err, params));
  });
}

exports.removeToken = (req, res, next) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).json(ApiReply('Welcome Back!', ''));
  }, () => {  //Error handeling
    next(failedApiReply(400, 'API removeToken: Error happened while removing the token', 'err', params));
  });
}
