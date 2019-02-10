const _ = require('lodash');
const reply = require('../VerifyReply')


const isMember = (req, res, next) => {

    //Check if the user is admin
    if (!req.db.authMember.admin) {
        
        //Check if the logged in user is Channel Admin or above
        let promiseArr = req.db.team.members.map(member => {
            if ((member.permissions <= 4) && (_.isEqual(member.memberId, req.input.authMemberId))) {
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
};

module.exports = {isMember};