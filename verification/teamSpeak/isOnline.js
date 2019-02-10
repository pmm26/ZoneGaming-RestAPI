const _ = require('lodash');
const reply = require('../VerifyReply')
const teamSpeak = require('../../modules/teamSpeak/library/app')

const ts3 = teamSpeak.ts3;


const checkOnline = (uuid) => {
    return ts3.getClientByUID(uuid)
    .then(client => {
        if (!_.isUndefined(client)) {
            return true;
        } else {
            return false;
        }
    })
}

const isOnline = (req, res, next) => {

    let needOnline = []
    //Check if the user is admin
    if (!_.isUndefined(req.db.authMember)) {
        if (!req.db.authMember.admin) {
            
            if (!_.isUndefined(req.input.memberId)) 
                needOnline.push('member')


            if (!_.isUndefined(req.input.authMemberId))
                needOnline.push('authMember')
                    

             //Check if the logged in user is Channel Admin or above
             let promiseArr = needOnline.map(online => {

                if (_.isEqual(online, 'member')) {

                    return checkOnline(req.db.member.uuid)
                    
                } else if (_.isEqual(online, 'authMember')) {

                    return checkOnline(req.db.authMember.uuid)
                    
                }
            })
                        
            //Resolves and Checks if there was any problem with executiong returns results.
            Promise.all(promiseArr)
            .then(resultsArray => {

                if (!(resultsArray.includes(false))) {
                
                //Continue
                next()

                } else {
                    res.status(401).json(reply.failed('err', 'isOnline: You need to be online in order to perform this task.'));
                }
            })
            .catch((err =>{
                res.status(500).json(reply.failed(err, 'isOnline: You need to be online in order to perform this task.'));
            }))
        
        } else { 
            next()
        }

    } else {

        throw Error('authMember not loaded')
    }
};

module.exports = {isOnline};

