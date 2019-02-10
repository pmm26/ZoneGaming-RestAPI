const _ = require('lodash');
const reply = require('../VerifyReply')


const isLinkedToTs3 = (req, res, next) => {

    //Check if the user is admin
    if (!_.isUndefined(req.db.authMember)) {
        if (!req.db.authMember.admin) {
            
            if (_.isUndefined(data.authMember.uuid)) {
                res.status(401).json(reply.failed('err', 'isLinkedToTs3: You first need to link your account.'));
            } else {
                next()
            }
        } else { 
            next()
        }

    } else {

        throw Error('authMember not loaded')
    }
};

module.exports = {isLinkedToTs3};

