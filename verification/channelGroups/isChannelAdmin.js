const _ = require('lodash');
const reply = require('../VerifyReply')


const isChannelAdmin = (req, res, next) => {

    //Check if the user is admin
    if (!_.isUndefined(req.db.authMember)) {
        if (!req.db.authMember.admin) {
            

            //Maybe change this to an array Filter


            //Check if the logged in user is Channel Admin or above
            let promiseArr = req.db.team.members.map(member => {
                if ((member.permissions <= 2) && (_.isEqual(member.memberId, req.input.authMemberId))) {
                    return true;
                }
                else {
                    return false;   
                }
            })
                        
            //Resolves and Checks if there was any problem with executiong returns results.
            Promise.all(promiseArr)
            .then(resultsArray => {
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

module.exports = {isChannelAdmin};