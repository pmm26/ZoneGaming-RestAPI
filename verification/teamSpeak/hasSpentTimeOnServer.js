//In this file Need to check if the user has spent X amount of time on the server.
//This could also be archived by checking if the user has a Certain ServerGroup. but that causes a request to the server. .
const _ = require('lodash');
const reply = require('../VerifyReply')
const tsConfig = require('../../config/ts3config')
const teamSpeak = require('../../modules/teamSpeak/library/app')

const ts3 = teamSpeak.ts3;

//Requires authMember


const hasSpentTimeOnServer = (req, res, next) => {

    if (!_.isUndefined(req.db.authMember)) {
        if (!req.db.authMember.admin) {

            //Get a list of the serverGroups that the user has to be part of.
            let promiseArr = tsConfig.createChannelServerGroups.map(sgid => {

                //Get the Client list of the serverGroup
                return ts3.serverGroupClientList(sgid)
                .then(serverGroupClientList => {

                    //Checking if the user is there if so return true
                    if(_.isEqual(serverGroupClientList.client_unique_identifier, req.db.authMember.uuid)) {
                        return true;
                    } else {
                        return false;
                    }
                                    
               })
            })

            //Resolves and Checks if there was any problem with executiong returns results.
            Promise.all(promiseArr)
            .then(resultsArray => {

                //Is any of the results true
                if (resultsArray.includes(true)) {
               
                    //Continue
                    next()
                
                } else {
                    res.status(401).json(reply.failed('err', 'isChannelAdmin: You don\' have enough permissions to do that'));
                }
           })
           .catch((err =>{
                res.status(500).json(reply.failed(err, 'isChannelAdmin: Failed to check permissions'));
            }))
                
        } else { 
            //Continue
            next()
        }

    } else {

        throw Error('authMember not loaded')
    }


};



module.exports = {hasSpentTimeOnServer};