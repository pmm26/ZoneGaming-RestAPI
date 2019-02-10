//Import NodeJS Extensions
const { validationResult } = require('express-validator/check');
const _ = require('lodash');


// const Members = require('../../db/models/members');

const teamSpeak = require('../../teamspeak/main')
// const Members = require('../../db/models/members');
const Teams = require('../../db/models/teams');

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
  


exports.getserverView = (req, res, next) => {

  ip = '90.252.25.247'

  teamSpeak.serverView()
  .then(data => {

    res.status(200).json(ApiReply('Channels fetched', data));

  }).catch(err => {
    throw failedApiReply(500, 'API getserverView: Failed to get channel information', err, '');
  })

};

exports.getchannelView = (req, res, next) => {

  let params = _.pick(req.params, ['cid']);

  
  teamSpeak.channelView(params.cid)
  .then(data => {

    res.status(200).json(ApiReply('Teams name Changed', data));

  }).catch(err => {
    throw failedApiReply(500, 'API getchannelView: an error happened while getting channel View', err, '');
  })

};

exports.getUsersByIp = (req, res, next) => {
  //Getting the client IP **MAY NOT WOK**
  // var ip = (req.headers['x-forwarded-for'] ||
  //    req.connection.remoteAddress ||
  //    req.socket.remoteAddress ||
  //    req.connection.socket.remoteAddress).split(",")[0];
    
  ip = '90.252.25.247'

  teamSpeak.getUsersByIp(ip)
  .then(data => {

    res.status(200).json(ApiReply('Users Fetched', data));

  })
  .catch(err => {
    throw failedApiReply(500, 'API getUsersByIp: an error happened while fetching get Users By Ip', err, '');
  })

};

exports.serverInfo = (req, res, next) => {

  teamSpeak.serverInfo()
  .then(data => {

    res.status(200).json(ApiReply('Here is the ServerInfo', data));

  })
  .catch(err => {
    throw failedApiReply(500, 'API serverInfo: an error happened while fetching serverInfo', err, '');
  })

};