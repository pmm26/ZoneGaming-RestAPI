const {ObjectId} = require('mongodb');
const _ = require('lodash');
const reply = require('../apiReply');

//Load Module
const teamSpeak = require('./library/app')

//Database
const Teams = require('../../database/models/teams');
// const Members = require('../../db/models/members');


 



exports.getserverView = (req, res, next) => {

  teamSpeak.serverView()
  .then(data => {

    res.status(200).json(reply.success('Channels fetched', data));

  }).catch(err => {
    throw reply.failed(500, 'API getserverView: Failed to get channel information', err, '');
  })

};


exports.getchannelView = (req, res, next) => {

  let params = _.pick(req.params, ['cid']);

  
  teamSpeak.channelView(params.cid)
  .then(data => {
    console.log(data);
    res.status(200).json(reply.success('Channels Fetched', data));

  }).catch(err => {
    throw reply.failed(500, 'API getchannelView: an error happened while getting channel View', err, '');
  })

};



exports.getUserByIp = (req, res, next) => {
  //Getting the client IP **MAY NOT WOK**
  // var ip = (req.headers['x-forwarded-for'] ||
  //    req.connection.remoteAddress ||
  //    req.socket.remoteAddress ||
  //    req.connection.socket.remoteAddress).split(",")[0];
    
  ip = '90.252.25.247'

  teamSpeak.getUsersByIp(ip)
  .then(data => {

    res.status(200).json(reply.success('Users Fetched', data));

  })
  .catch(err => {
    throw reply.failed(500, 'API getUsersByIp: an error happened while fetching get Users By Ip', err, '');
  })

};


exports.serverInfo = (req, res, next) => {

  teamSpeak.serverInfo()
  .then(data => {

    res.status(200).json(reply.success('Here is the ServerInfo', data));

  })
  .catch(err => {
    throw reply.failed(500, 'API serverInfo: an error happened while fetching serverInfo', err, '');
  })

};