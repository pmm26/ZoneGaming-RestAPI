const Members = require('../../database/models/members');
const Team = require('../../database/models/teams')
const gameArea = require('../../database/models/game_area');
const Groups = require('../../database/models/groups');

const reply = require('../VerifyReply');

exports.loadConfig = (req, res, next) => {

    req.db = {}

    let loadDb = req.loadDb;

    
    let promiseArr = loadDb.map(db => {

        switch (db) {
            case 'member':
                return getMember(req.input.memberId)
                .then(member => {
                    req.db.member = member;

                    return member;
                })
                .catch(err => {
                    throw reply.failed(err, 'loadDB: member not found');
                })
                break;                 
                
            case 'authMember':
                console.log(req.input.authMemberId);
                return getAuthMember(req.input.authMemberId)
                .then(member => {
                    req.db.authMember = member;

                    return member;
                })
                .catch(err => {
                    throw reply.failed(err, 'loadDB: authMember not found');
                })
                break;

            case 'team':
                return getTeam(req.input.teamId)
                .then(team => {
                    req.db.team = team;

                    return team;
                })
                .catch(err => {
                    throw reply.failed(err, 'loadDB: team not found');
                })
                break;
        
            case 'gameArea':
                return getArea(req.input.areaId )
                .then(gameArea => {
                    req.db.gameArea = gameArea;

                    return gameArea;
                })
                .catch(err => {
                    throw reply.failed(err, 'loadDB: gameArea not found');
                })
                break;

            case 'groups':
                return getGroups(req.input.groupId )
                .then(group => {
                    req.db.group = group;

                    return group;
                })
                .catch(err => {
                    throw reply.failed(err, 'loadDB: groups not found');
                })

                break;
            default:
                console.log('No Db Loaded!')
                break;
        }
    
    })

    //Resolves and Checks if there was any problem with executiong returns results.
    Promise.all(promiseArr)
    .then(clientsArray => {
        

        next();

    }).catch(err => {
        res.status(404).json(reply.failed(err, 'loadConfig: Failed to load DB'));
    })
}


const getTeam = (teamId ) => {

    return Team.findById(teamId)
    .then((team) => {

        if (!team) {
           throw reply.failed('error', 'getTeam: team not found');
        }

        return team;
  
      }).catch(err => {
        throw reply.failed(err, 'getTeam: failed to get team / Team not Found');
    })
}


const getAuthMember = (authMemberId) => {

    return Members.findById(authMemberId)
    .then((member) => {

        if (!member) {
            throw reply.failed('error', 'getAuthMember: AuthMemberID not Found');
        }

        return member;
        
    }).catch(err => {
        throw reply.failed(err, 'getAuthMember: Error Fetching AuthMember / Team not Found');
    })          
}


const getMember = (memberId) => {

    return Members.findById(memberId)
    .then((member) => {

        if (!member) {
            throw reply.failed('error', 'getMember: Member not Found');
        }

        return member;
        
    }).catch(err => {
        throw reply.failed(err, 'getMember: Error Fetching Member / Team not Found');
    })          
}


const getGroups = (groupId) => {

    return Groups.findById(groupId)
    .then((group) => {

        if (!group) {
            throw reply.failed('error', 'getGroups: Group not Found');
        }

        return group;
        
    }).catch(err => {
        throw reply.failed(err, 'getGroups: Error Fetching Group / Team not Found');
    })          
}


const getArea = (areaId ) => {

    return gameArea.findById(areaId)
    .then((area) => {

        if (!area) {
            throw reply.failed('error', 'getArea: Area not Found');
        }

        return area;
        
    }).catch(err => {
        throw reply.failed(err, 'getArea: Error Fetching Area / Team not Found');
    })          
}
