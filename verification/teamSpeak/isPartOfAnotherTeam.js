// Add to team model a search for member in teams

const _ = require('lodash');
const reply = require('../VerifyReply')
const Teams = require('../../database/models/teams')


const isPartOfAnotherTeam = (req, res, next) => {

    //Check if the user is admin
    if (!_.isUndefined(req.db.authMember)) {
        if (!req.db.authMember.admin) {

            return Teams.find()
            .then(teams => {
                

                //Get a list of the serverGroups that the user has to be part of.
                let promiseArr = teams.map(team => {

                    let members =  team.members.filter(function(membro) {
                        return _.isEqual(membro.memberId, req.db.authMember._id);
                    });

                    if (_.isEmpty(members)) {
                            return false;
                        } else {
                            return true;
                        }
                                        
                })

                //Resolves and Checks if there was any problem with executiong returns results.
                Promise.all(promiseArr)
                .then(resultsArray => {

                    //Is any of the results true
                    if (!resultsArray.includes(true)) {
                
                        //Continue
                        next()
                    
                    } else {
                        res.status(401).json(reply.failed('err', 'isPartOfAnotherTeam: You already bellong to another team'));
                    }
                })
                .catch((err =>{
                        res.status(500).json(reply.failed(err, 'isPartOfAnotherTeam: Failed to check permissions'));
                    }))
          
        })

        } else { 
            //Continue
            next()
        }

    } else {

        throw Error('authMember not loaded')
    }
};

module.exports = {isPartOfAnotherTeam};