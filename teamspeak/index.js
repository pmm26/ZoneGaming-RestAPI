//Core
const ts3core = require("./ts3Connect") //Create and Claim 
const {ts3} = require("./ts3Connect")  //Dafault Library
var config = require('./config'); //Objext that contains all the default properties to create a channel
let _ = require('lodash');

//Database
var mongoose = require('../db/mongoose');

var {gameArea} = require('../models/game_area')
var {Teams} = require('../models/teams')
var {Members} = require('../models/members')
var {channelCrawl} = require('../models/channelCrawl')



//////////////////////////////
//           Todos          //
//////////////////////////////
//Topic/Description Generators.
//Get all the code up to date with the new library.
//Improve database



//////////////////////////////
//      Resource Methods    //
//////////////////////////////

/** 
DONE:

- Add User to the Channel Member *Done
- Remove user from Channel Member *Done
- Channel Crawl *Done
- Move Channel *Done
- Create Server Group *Done
- Change Name *Done


TODO NEXT TIME:


- Delete Team 
- 

Todo Later:
- Add more Channels X
- Add Icon
- Remove Icon


Futuro

Rank para Cada Team
fazer pagina com o score e fazer website.

Futuro erro
Criar um canal kd o user ja nao esta o ts
*/

const failedApiReply = (err, msg) => {

    if (!(err.code == 500)) {

        failedApi = {
            code: 500,
            status: 'FAIL',
            msg: msg,
            err: err
        }
        return failedApi;
    }
    return err;
}

const ApiReply = (msg, data) => {

        api = {
            code: 400,
            status: 'OK',
            msg: msg,
            data: data
        }
        return api;

}



/**
 * 
 * @param {string} nickname - Name of the user in the TeamSpeak
 * @param {String} uuid - TeamSpeak Client Unique ID
 */
const registerClient = (nickname, uuid) => {
    //Storing in the database details about the Channel and the Teamspeak Channel ids.
    let client = new Members({        
        nickname: nickname,
        uuid: uuid                  
    });

    //Save the New Channel
    client.save()

    setClientServerGroupByUid(uuid, config.groupSettings.serverGroupMember)
    
}

const deleteBottonTeams = () => {

    
}


/**
 * Adds User to the Team (inc: ServerGroup, ChannelAdmin, DB...)
 * @param {string} teamObjectID - Team objectID from the Database
 * @param {String} memberObjectID - Member objectID from the Database
 * @param {Number} permission - 1 to 4, 1 = Founder, 4 = Member
 */
const addUserToTeam = (teamObjectID, memberObjectID, permission) => {

    //Fetch Members database
    return Members.findById(memberObjectID)
    .then(member => {
        //adding the user to the team members array
        Teams.findByIdAndUpdate(teamObjectID,
            { $push: {
                members: {   
                    memberId: member._id,      
                    memberUuid: member.uuid,
                    permissions: permission
                }
            }
        }).catch(err => {
            throw failedApiReply(err, 'addUserToTeam: Failed updating the database'); 
        })

        //fetch teams database 
        return Teams.findById(teamObjectID)
        .then(team => {

            //If team has a servergroup, then add the user to it
            if (team.serverGroupId != null) {
                setClientServerGroupByUid(member.uuid, sgid)
                .catch(err => {
                   throw failedApiReply(err, 'addUserToTeam: Failed setClientServerGroupByUid.'); 
                })   
            }

            if (permission == 1) {
                channelGroupId = config.groupSettings.channelAdmin;

            } else if (permission == 2) {
                channelGroupId = config.groupSettings.channelAdmin;

            } else if (permission == 3) {
                channelGroupId = config.groupSettings.channelMod;

            } else if (permission == 4) {
                channelGroupId = config.groupSettings.channelMember;

            } else {
                channelGroupId = config.groupSettings.guestChannelGroup;

            }

            //set channelGroup permission on all channels
            return setChannelGroupbyUid(channelGroupId, team.mainChannelId, member.uuid)
            .then(info => {
                return ApiReply('Channel Group Assigned', info)
            })
            .catch(err => {
                throw failedApiReply(err, 'addUserToTeam: Failed setChannelGroup.'); 
             })

        })
        .catch(err => {
            throw failedApiReply(err, 'addUserToTeam: Failed fetching database team.'); 
        })
    })
    .catch(err => {
        throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
    })
}


/**
 * Removes user from the team. (inc: ServerGroup, ChannelAdmin, DB...)
 * @param {String} teamObjectID - Team objectID of the Database
 * @param {String} memberObjectID - Member objectID of the Database
 */
const removeUserFromTeam = (teamObjectID, memberObjectID) => {

    //Fetch Members database
    return Members.findById(memberObjectID)
    .then(member => {
        //fetch teams database and 
        Teams.findByIdAndUpdate(teamObjectID,
            { $pull: {
                members: {   
                    memberId: member._id,      
                }
            }
            
        }).catch(err => {
            throw failedApiReply(err, 'removeUserFromTeam: Failed updating the db records'); 
        })

        //fetch teams database and 
        return Teams.findById(teamObjectID)
        .then(team => {

            //If team has a servergroup then remove the user
            if (team.serverGroupId != null) {
                removeClientServerGroupByUid(member.uuid, team.serverGroupId)

                .catch(err => {
                    throw failedApiReply(err, 'removeUserFromTeam: Failed clearing ChannelGroup.'); 
                })  
            }

            //set guest channelGroup permission on all channels
            return setChannelGroupbyUid(config.groupSettings.guestChannelGroup, team.mainChannelId, member.uuid)
            .then(info => {
                return ApiReply('removeUserFromTeam: Channel Group Assigned', info)
            })
            .catch(err => {
                throw failedApiReply(err, 'removeUserFromTeam: Failed setChannelGroup.'); 
            })
        })
        .catch(err => {
            throw failedApiReply(err, 'addUserToTeam: Failed fetching database team.'); 
        })
    })
    .catch(err => {
        throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
    })
        
}


/**
 * Gives a user ChannelGroup Permission on all the subchannels.
 * @param {Number} sgid - ServerGroup ID
 * @param {Number} mainChannelId - Main id of the channel / spacer
 * @param {String} uuid  - TeamSpeak Client Unique ID
 */
const setChannelGroupbyUid = (sgid, mainChannelId, uuid) => {

    //Get the List of the SubChannels;
    return ts3core.subChannelList(mainChannelId)
    .then(channels => {

        //Get cldbid of User (Required to set Channel Admin)
        return ts3core.getCldbidFromUid(uuid)
        .then(cldbid => {
                                
            //Works Like a ForEach Loop but it's async
                let promiseArr = channels.map(channel => {
                    //Set ChannelGroup to user
                    return ts3.setClientChannelGroup(sgid, channel._propcache.cid, cldbid)
                    .then(info => {
                        return info;
                    })
                });
                
                //Resolves and Checks if there was any problem with executiong returns results.
                return Promise.all(promiseArr)
                .then(resultsArray => {
                    return ApiReply('Channel Group Assigned', resultsArray)
                    // do something after the loop finishes
                }).catch(err => {
                    throw failedApiReply(err, 'setChannelGroupbyUid: Error Setting ChannelGroup.'); 
                    // do something when any of the promises in array are rejected
                })
            //
        })
        .catch(err => {
            throw failedApiReply(err, 'setChannelGroupbyUid: Error getting cldbid of client.'); 
        })
    })
    .catch(err => {
        throw failedApiReply(err, 'setChannelGroupbyUid: Error Getting SubChannel List.'); 
    })
}


/**
 * Removes all Channel Groups from everyone in the team and then reassigns them.
 * @param {String} teamObjectID - TeamObjectID from the Database
 */
const reassignChannelGroups = (teamObjectID) => {

    //Fetch Team from DB
    return Teams.findById(teamObjectID)
    .then(team => {

        //Remove all ChannelGroup users from the channels.
        return channelRemoveChannelGroupClients(team.mainChannelId)
        .then(() => {
            
            //Get the List of the SubChannels;
            return ts3core.subChannelList(team.mainChannelId)
            .then(channels => {

                //Works Like a ForEach Loop but it's async
                let promiseArr1 = channels.map(channel => {
                    // return the promise to array

                    //Works Like a ForEach Loop but it's async
                    let promiseArr2 = team.members.map(member => {
                        // return the promise to array                

                   
                        if (member.permissions == 1) {
                            channelGroupId = config.groupSettings.channelAdmin;

                        } else if (member.permissions == 2) {
                            channelGroupId = config.groupSettings.channelAdmin;


                        } else if (member.permissions == 3) {
                            channelGroupId = config.groupSettings.channelMod;

                        } else if (member.permissions == 4) {
                            channelGroupId = config.groupSettings.channelMember;

                        } else {
                            channelGroupId = config.groupSettings.guestChannelGroup;

                        }

                        return ts3core.getCldbidFromUid(member.memberUuid)
                        .then(cldbid => {
                            return ts3.setClientChannelGroup(channelGroupId, channel._propcache.cid, cldbid)
                            .then(() => {
                                return ApiReply('Channel Group Assigned', member.memberUuid)
                            })                   
                        })
                    })


                    //2 FOR EACH
                    //Resolves and Checks if there was any problem with executiong returns results.
                    return Promise.all(promiseArr2)
                    .then(resultsArray2 => {
                        
                        return resultsArray2;
                    })
                    .catch(err => {
                        throw failedApiReply(err, 'reassignChannelGroups: Set Channel Group Failed.'); 
                    })
                    //

                });
                

                //1 FOR EACH
                //Resolves and Checks if there was any problem with executiong returns results.
                return Promise.all(promiseArr1)
                .then(resultsArray1 => {
                    return resultsArray1;
                })
                .catch(err => {
                    throw failedApiReply(err, 'reassignChannelGroups: Failed getting ClDbID.'); 
                })
                //

            })
            .catch(err => {
                throw failedApiReply(err, 'reassignChannelGroups: Failed getting subChannelList.'); 
            })
        })
        .catch(err => {
            throw failedApiReply(err, 'reassignChannelGroups: Failed clearing ChannelGroup.'); 
        })
    })
    .catch(err => {
        throw failedApiReply(err, 'reassignChannelGroups: Failed getting Team from the database.'); 
    })
}


/**
 *  Removes all Channel Groups from everyone in the team
 * @param {Number} mainChannelId - Main Channel/Spacer ID 
 */
const channelRemoveChannelGroupClients = (mainChannelId) => {



    cid = parseInt(mainChannelId);

    //Get the List of the SubChannels;
    return ts3core.subChannelList(cid)
    .then(channels => {
      
       
        //Works Like a ForEach Loop but it's async
        let promiseArr1 = channels.map(channel => {

            //Works Like a ForEach Loop but it's async
            let promiseArr2 = config.ChannelGroupsAdmin.map(channelGroupId => {
                // return the promise to array                

                //Get ChannelGroup object
                return ts3.getChannelGroupByID(channelGroupId)
                .then(channelGroup => {

                    //Get the List of clients that are part of that ChannelGroup
                    return channelGroup.clientList(channel._propcache.cid)
                    .then(clients => {                       
                        
                        
                        
                        //Works Like a ForEach Loop but it's async
                        let promiseArr3 = clients.map(client => {
                            // return the promise to array                

                            return ts3.setClientChannelGroup(config.groupSettings.guestChannelGroup, client.cid, client.cldbid)
                            .then(() => {
                                return ApiReply('Channel Group Assigned', {cgid:channelGroupId})
                            })
                            

                        })


                        //3 FOR EACH
                        //Resolves and Checks if there was any problem with executiong returns results.
                        return Promise.all(promiseArr3)
                        .then(resultsArray3 => {
                            
                            return resultsArray3;
                        })
                        .catch(err => {
                            throw failedApiReply(err, 'channelRemoveChannelGroupClients: Error Setting ChannelGroup.'); 
                        })
                        //

                    }).catch(err => {
                        if (err.id==1281) {
                            return ApiReply('No Members in the group', {cgid:channelGroupId})
                        } else {
                            throw failedApiReply(err, 'reassignChannelGroups: Failed getting Client List.'); 
                        }
                    })
                })
                .catch(err => {
                    throw failedApiReply(err, 'reassignChannelGroups: Failed to getting channelGroup.'); 
                })
            })


            //2 FOR EACH
            //Resolves and Checks if there was any problem with executiong returns results.
            return Promise.all(promiseArr2)
            .then(resultsArray2 => {
                
                    return resultsArray2;
                
            })
            .catch(err => {
                throw failedApiReply(err, 'reassignChannelGroups: Failed to get Channel Group by ID Or getting ClientList of group.'); 
            })
            //

        })


        //3 FOR EACH
        //Resolves and Checks if there was any problem with executiong returns results.
        return Promise.all(promiseArr1)
        .then(resultsArray1 => {
                
            return resultsArray1;
        })
        .catch(err => {
            throw failedApiReply(err, 'reassignChannelGroups: Failed to do Everything.'); 
        })
        //

    }).then(results => {
        return ApiReply('Sucess', results)
    
    }).catch(err => {
        throw failedApiReply(err, 'reassignChannelGroups: Failed to get SubChannel List.'); 
    })
}


/**
 * Swaps channel position with another channel.
 * @param {string} teamObjectID - Team objectID from the Database
 * @param {String} memberObjectID - Member objectID from the Database
 */
const moveChannel = (oldTeamObjectID, newTeamObjectID) => {

    //Getting New Team data from the Database 
    return Teams.findById(newTeamObjectID)
    .then((newTeam) => {

            //Getting Old Team data from the Database 
            return Teams.findById(oldTeamObjectID)
            .then((oldTeam) => {
            


                //Update New Team Database with location info of old team
                Teams.findByIdAndUpdate(
                    newTeamObjectID,
                    { $set: {   
                        channelOrder: oldTeam.channelOrder,
                        spacerNumber: oldTeam.spacerNumber,
                        mainChannelId: oldTeam.mainChannelId,
                        spacerEmptyId: oldTeam.spacerEmptyId,
                        spacerBarId: oldTeam.spacerBarId,
                        gameArea: oldTeam.gameArea,
                        status: 'clean'
                    }
                })
                .catch(err => {
                    throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
                })


                //Update Old Team Database with location info of New team
                return Teams.findByIdAndUpdate(
                    oldTeamObjectID,
                    { $set: {   

                        channelOrder: newTeam.channelOrder,
                        spacerNumber: newTeam.spacerNumber,
                        mainChannelId: newTeam.mainChannelId,
                        spacerEmptyId: newTeam.spacerEmptyId,
                        spacerBarId: newTeam.spacerBarId,
                        gameArea: newTeam.gameArea
                    }
                })             
                
                
                .then(() => {
                    //Find old Team
                    return Teams.findById(oldTeamObjectID)
                    .then((team) => {
                       
                        //Claim Channels on TeamSpeak
                        return claimChannels(team.teamName, '', team.ownerID, team._id, true )
                        .then(() => {

                            //Free Up Old Channel
                            return freeUpChanels()
                            .then(() => {

                                //Giving Channel Permission to Users
                                return reassignChannelGroups(oldTeamObjectID)
                                .then(info => {
                                    //Return Success!
                                    return ApiReply('Channel Group Assigned', info)

                                })
                                .catch(err => {
                                    throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
                                })
                                
                            })
                            .catch(err => {
                                throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
                            })
                            

                        })
                        .catch(err => {
                            throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
                        })
                    })
                    .catch(err => {
                        throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
                    })
                    
                    
                    
                })
                .catch(err => {
                    throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
                })
                
            })
            .catch(err => {
                throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
            })
    })
    .catch(err => {
        throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.'); 
    })
}


/**
 * Changes the name of the Team
 * @param {String} teamObjectID - Member objectID from the Database.
 * @param {String} name - New name for the team.
 */
const changeTeamName = ( teamObjectID, name) => {
    
    return Teams.findByIdAndUpdate(teamObjectID,
        { $set: {   
            teamName: name,
        }})
        .then(team => {

            //Get Area ID to add the First Letter to the Name
            return gameArea.findOne({areaId: team.gameArea})
            .then((area) => {
                if (!area) {
                    throw failedApiReply('err', 'changeTeamName: No area Found!');
                } 
    
                //making the name
                let processedName = '[cspacer' + team.spacerNumber + ']' + area.areaName[0] + team.channelOrder + ' - ★ ' + name + ' ★';
    
                //Edit the claimed channel
                return ts3core.edit(true, team.mainChannelId, processedName, '', 'topic', 'description')
                .then(() => {
                    ts3.serverGroupRename(team.serverGroupId, name)
                    .then(() => {
                        return ApiReply('Name Changed Sucessfully', group.sgid)
                    })    
                    .catch(err => {
                        throw failedApiReply(err, 'changeTeamName: Error Changing ServerGroup Name');
                    })
                })
            })
            .catch(err => {
                throw failedApiReply(err, 'changeTeamName: Error Changing Name');
            })
    })
    .catch(err => {
        throw failedApiReply(err, 'changeTeamName: Error Fetching Team');
    })
}


/**
 * Creates a ServerGroup for the team.
 * @param {String} uuid - TeamSpeak Unique ID
 */
const createServerGroup = (uuid) => {

    return Teams.findOne({ownerID: uuid })
    .then(team => {

        //console.log(config.groupSettings.serverGroupTemplate)
        
        //Make a Copy of the template ServerGroup
        return ts3.serverGroupCopy(config.groupSettings.serverGroupTemplate, 0, 1, team.teamName)
        .then(group => {

            //get cldbid of the user
            return ts3core.getCldbidFromUid(uuid)
            .then(cldbid => {

                //Add ServerGroup to Client
                return ts3.serverGroupAddClient(cldbid, group.sgid)
                .then(() => {
                        


                    return Teams.findByIdAndUpdate(team._id,
                        { $set: {   
                            serverGroupId: group.sgid,
                        }})
                        //Group was created sucessfully Return Sucessfull Message
                        .then(() => {
                            return ApiReply('ServerGroup Created Sucessfully', group.sgid)
                        })

                        .catch(err => {
                            throw failedApiReply(err, 'createServerGroup: Error Saving data on the database'); 
                        })

                })
                .catch(err => {
                    throw failedApiReply(err, 'createServerGroup: Error Adding user to group');
                })

            })
            .catch(err => {
                throw failedApiReply(err, 'createServerGroup: Error fetching cldbid '); 
            })

        })
        .catch(err => {
            throw failedApiReply(err, 'createServerGroup: Error Copying Group');
        })
    })
    .catch(err => {
        throw failedApiReply(err, 'createServerGroup: Error Fetching Team');
    })
}


/** Needs work
 * Crawls the TeamSpeak every few minutes and stores when the channels were last used. 
 * Used for channel deletion.
 */
const crawlerChannels = () => {
    
    return ts3.channelList()
    .then(channels => {
        //console.log(channels)

        return Teams.find({status: 'OK'})
        .then(teams => {
            //console.log(teams)
        
            mainChannelsIDs = [];

            //Works Like a ForEach Loop but it's async
            let promiseArr = teams.map(team => {
                // return the promise to array
                
                return team.mainChannelId;
            });
              
            //Resolves and Checks if there was any problem with executiong returns results.
            return Promise.all(promiseArr)
            .then(mainChannelsIDs => {
                return  mainChannelsIDs;
                // do something after the loop finishes
            }).catch(err => {
                throw failedApiReply(err, 'setChannelGroupbyUid: Error Setting ChannelGroup.'); 
                // do something when any of the promises in array are rejected
            })
            //
        })
        
        
        .then(mainChannelsIDs => {

            edited = [];


            //Works Like a ForEach Loop but it's async
            let promiseArr2 = channels.map(channel => {
                //console.log(mainChannelsIDs)

                //If the channel parent ID is in the mainChannelsIDs array then do this
                if (mainChannelsIDs.includes(channel._propcache.pid)) {
                    
                    //if the channel has users inside and the team hasn't been edited yet.
                    if (channel._propcache.total_clients > 0 & !(edited.includes(channel._propcache.pid))) {
                        //Add the channel to the list of Edited channels
                        edited.push(channel._propcache.pid)

                        //Update lastused on the DB
                        return Teams.findOneAndUpdate(
                            { mainChannelId: channel._propcache.pid },
                            { $set: {   
                                lastUsed: Date.now(),
                            }})
                        .then(info => {
                            return ApiReply("Channel Updated.", channel._propcache.cid)
                        })
                        //Save to the Database update timeStamp with the current date.

                    } else {
                        return ApiReply("Channel has already been edited or doesn't have anyone inside.", channel._propcache.cid)
                    }
                } else {
                    return ApiReply("Channel doesn't belong to any team / is a spacer!", channel._propcache.cid)
                }
            });

        
            
            //Resolves and Checks if there was any problem with executiong returns results.
            return Promise.all(promiseArr2)
            .then(resultsArray => {
                return ApiReply('Channel Group Assigned', resultsArray)
                // do something after the loop finishes
            }).catch(err => {
                throw failedApiReply(err, 'setChannelGroupbyUid: Error Setting ChannelGroup.'); 
                // do something when any of the promises in array are rejected
            })
        //
  
        })

        .catch(err => {
            throw failedApiReply(err, 'createTeam: Failed to fetch Team DB');
        }) 
        
    })
    .catch(err => {
        throw failedApiReply(err, 'createTeam: Failed to fetch Team DB');
    }) 

}


/**
 * Create New Team by Creating Channels of Claming
 * @param {String} name 
 * @param {String} password 
 * @param {String} ownerUuid 
 * @param {Number} gameAreaId 
 * @param {boolean} move 
 */
const createTeam = (name, password, memberObjectID, gameAreaId, move) => {

    //Get top free Channel
    return getTopFreeChannel(gameAreaId)
    .then(team => {
        
        //Get Members Database
        return Members.findById(memberObjectID)
        .then(member => {
            //If there is a Free Team then Claim it
            if (team != null) {
                //Claim Channel
                return claimChannels(name, password, member.uuid, team._id, move )
                .then(() => {
                    //Add user to the Channel and Give Permissions
                    return addUserToTeam(team._id, memberObjectID, 1)
                    .then(() => {
                        return ApiReply('createChannels: Channels Sucessfully Claimed', team)
                        
                    })
                    .catch(err => {
                        throw failedApiReply(err, 'createTeam: Failed to add to Team');
                    })  
                })
                .catch(err => {
                    throw failedApiReply(err, 'createTeam: Failed to Claim Channels');
                })  
                
            //If not Create a new one
            } else {
                //Create Channel
                return createChannels(name, password, member.uuid, gameAreaId, move)
                .then((newteam) => {
                    //Add user to the Channel and Give Permissions
                    return addUserToTeam(newteam.data._id, memberObjectID, 1)
                    .then(() => {
                        return ApiReply('createChannels: Channels Sucessfully Created', newteam)


                    })
                    .catch(err => {
                        throw failedApiReply(err, 'createTeam: Failed to add to Team');
                    })  
                })
                .catch(err => {
                    throw failedApiReply(err, 'createTeam: Failed to create Channels');
                })  
                
            }
            
        })
        .catch(err => {
            throw failedApiReply(err, 'createTeam: Failed fetch Member DB');
        })  
        
    })
    .catch(err => {
        throw failedApiReply(err, 'createTeam: Failed to fetch Team DB');
    })  


}


/**
 * Gets the Top free Channel on a Specific areaID
 * @param {Number} gameAreaId 
 */
const getTopFreeChannel = (gameAreaId) => {

    return Teams.findOne({status: 'free', gameArea: gameAreaId})
    .sort('+channelOrder')
    .then((team) => {
       return(team);
    })
    .catch(err => {
        throw failedApiReply(err, 'getTopFreeChannel: Failed to get db');
    })


}


/**
 * Claims a Channel - Used by another function not to use by itself
 * @param {String} name - Name of the Channel
 * @param {String} password - Password of the Channel
 * @param {String} ownerUuid - TeamSpeak User Unique Id
 * @param {Number} teamObjectID -Database Object id of the Team to claim
 * @param {boolean} move - Move the Client to the channel
 */
const claimChannels = (name, password, ownerUuid, teamObjectID, move ) => {


    //TODO ADD CHECK TO SEE IF CHANNEL IS FREE


    return Teams.findById(teamObjectID).then((team) => {
        
        gameArea.findOne({areaId: team.gameArea})
        .then((area) => {
            if (!area) {
                throw failedApiReply('err', 'claimChannels: No Area Claiming');
            } 

            //making the name
            let processedName = '[cspacer' + team.spacerNumber + ']' + area.areaName[0] + team.channelOrder + ' - ★ ' + name + ' ★';

            //Edit the claimed channel
            return ts3core.edit(true, team.mainChannelId, processedName, '', 'topic', 'description')
            .then(() => {
            
            
            //Make subchannels Public
            setSubChannelsPublic(team.mainChannelId, password)
            .catch(err => {
                throw failedApiReply(err, 'claimChannels: Failed to edit channel');
            })
            

            //Move client to channel
            if (move) {
                moveToFirstChannel(team.mainChannelId, ownerUuid)
            }
                
            //Update Database Records
            return Teams.findByIdAndUpdate(
                team._id,
                { $set: {   
                    teamName: name,
                    status: 'OK',
                    ownerID: ownerUuid,
                }}) 
                
                .then((teamClaimed) => {
                    if (!teamClaimed) { 
                        throw failedApiReply(err, 'claimChannels: No db');
                    }  

                    return ApiReply('createChannels: Channels Sucessfully Created', teamClaimed)
    
            }).catch(err => {
                throw failedApiReply(err, 'claimChannels: Failed to edit Database');
            })
    
            }).catch(err => {
                throw failedApiReply(err, 'claimChannels: Failed to edit channel!');
            })


        })

    }).catch(err => {
        throw failedApiReply(err, 'createChannels: Failed to find gameArea');
    })
}


 /**
 * Creates a Channel a Channel - Used by another function not to use by itself
 * @param {String} name - Name of the Channel
 * @param {String} password - Password of the Channel
 * @param {String} ownerUuid - TeamSpeak User Unique Id
 * @param {Number} gameAreaId - Id of the Area where the channel is going to be created.
 * @param {boolean} move - Move the Client to the channel
 */
const createChannels = (name, password, ownerUuid, gameAreaId, move) => {


    /**
     * Temporary
     */

    let topic = '';
    let description = '';
    

    //TODO Add the Topic and Description Generator

    //Fetch Game Area data
    return gameArea.findOne({areaId: gameAreaId})
    .then((area) => {
        if (!area) {
           console.log('No Area I guess');
        } 
 

        //Generate the Name of the Channel
        let processedName = '[cspacer' + area.nextSpacerNumber + ']' + area.areaName[0] + area.nextChannelNumber + ' - ★ ' + name + ' ★'

        //Create Channels
        return createGroupOfChannels(processedName, password, topic, description, area.nextSpacerNumber, area.lastChannelId)
        .then(channelIds => {
            channelIds = channelIds.data

           
             //Update the GameArea
            return gameArea.findOneAndUpdate(
                { areaId: gameAreaId },
                { $inc: { nextChannelNumber: 1, nextSpacerNumber: 1 },
                $set: { lastChannelId: channelIds.spacerBarId } })
            
            .then(() => {
                //Moving client to the first channel
                if (move) {
                    moveToFirstChannel(channelIds.mainChannelId, ownerUuid) 
                    .catch(err => {
                        throw failedApiReply(err, 'createChannels: Failed to Move User');
                    })
                }
            })
            .then(() => { //Saving the data to the database

                //Storing in the database details about the Channel and the Teamspeak Channel ids.
                let team = new Teams(Object.assign({
                    teamName: name,
                    ownerID: ownerUuid,
                    channelOrder: area.nextChannelNumber,
                    spacerNumber: area.nextSpacerNumber,
                    gameArea: gameAreaId,
                }, channelIds));
                
                //Adding team to the Database
                return team.save()
                .then((saved) => {
                    return ApiReply('createChannels: Channels Sucessfully Created', saved)
                }, (err) => {
                    throw failedApiReply(err, 'createChannels: Failed to save team on the DB');
                })
                
                .catch(err => {
                    throw failedApiReply(err, 'createChannels: Failed Saving Team / Moving / setChannelGroup');
                })

            
            }).catch(err => {
                throw failedApiReply(err, 'createChannels: Failed to update gameArea DB');
            })
        }).catch(err => {
            throw failedApiReply(err, 'createChannels: Failed to create Group of Channels');
        })

    }).catch(err => {
        throw failedApiReply(err, 'createChannels: Failed to find gameArea');
    })

}


 /**
 * Creates a group of channels - Used by another function not to use by itself
 * @param {String} name - Name of the Channel
 * @param {String} password - Password of the Channel
 * @param {String} topic - Topic of the channel
 * @param {String} description - Description of the channel
 * @param {Number} spacerNumber - Number for the spacer.
 * @param {Number} lastCid - cid of the last channel of that area.
 */
const createGroupOfChannels = (name, password, topic, description, spacerNumber, lastCid) => {

    

    //Create the mainChannel
    return ts3core.create( false, name, '', topic, description, '', lastCid)
    .then(mainChannel => { 
        //Create Sub Channels
        ts3core.create(true, config.channelSettings.subChannelName + ' 1', password, topic, description, mainChannel._propcache.cid, '')
        ts3core.create(true, config.channelSettings.subChannelName + ' 2', password, topic, description, mainChannel._propcache.cid, '');
        ts3core.create(true, config.channelSettings.subChannelName + ' 3', password, topic, description, mainChannel._propcache.cid, '');
        ts3core.create(true, config.channelSettings.awayChannelName, password, topic, description, mainChannel._propcache.cid, '');
        
        //Create Spacer Bar
        return ts3core.create(false, '[rspacer' + spacerNumber + ']', '', '', '', '', mainChannel._propcache.cid)
        .then(spacerChannel => {
            
            //Create Spacer Bar
            return ts3core.create(false, '[*spacer' + spacerNumber + ']' + config.channelSettings.spacerBar, '', '', '', '', spacerChannel._propcache.cid)
            .then(spacerBar => {
                
                //Create a object with all the Channels Ids that were just created
                let channelIds = {
                    mainChannelId: mainChannel._propcache.cid,
                    spacerEmptyId: spacerChannel._propcache.cid,
                    spacerBarId: spacerBar._propcache.cid
                }


                //Return Data
                return ApiReply('createGroupOfChannels: Channels Sucessfully Created', channelIds)
            
            })
            .catch(err => {
                throw failedApiReply(err, 'createGroupOfChannels: Failed to create Spacer Bar');
            })        
        })
        .catch(err => {
            throw failedApiReply(err, 'createGroupOfChannels: Failed to create Blank Spacer');
        })
    })
    .catch(err => {
        throw failedApiReply(err, 'createGroupOfChannels: Failed to Main Channel/SubChannels');
    })
}


/**
 * Free's Up unused channels.
 */
const freeUpChanels = () => {

    return Teams.find()
    .then((teams) => {

        //Works Like a ForEach Loop but it's async
        let promiseArr = teams.map(team => {
        // return the promise to array
                
           // if ((team.status == 'OK') | (team.status == 'clean')) { //TODO: Add Time Check
           if ((team.status == 'clean')) {
                //Get the First Letter of the Area Name
                return gameArea.findOne({areaId: team.gameArea})
                .then((area) => {
                    if (!area) {
                       console.log('Area Not Found!');
                    } 

                    //Make the Name of the Channel
                    let channelNameFree = '[cspacer' + team.spacerNumber + ']' + area.areaName[0] + team.channelOrder + ' - ★ ' + config.channelSettings.freeSpacerName + ' ★'

                    //Edit Channel to set the New Name
                    ts3core.edit(false, team.mainChannelId, channelNameFree, '', '', '')
                    .catch(err => {
                        throw failedApiReply(err, 'freeUpChanels: Failed to edit channel');
                    })


                }).then(() => {

                    //Make all the SubChannels Private
                    setSubChannelsPrivate(team.mainChannelId)
                    .catch(err => {
                        throw failedApiReply(err, 'freeUpChanels: Failed to setSubChannelsPrivate');
                    })

                }).then(() => {

                    
                    channelRemoveChannelGroupClients(team.mainChannelId)
                    .catch(err => {
                        throw failedApiReply(err, 'freeUpChanels: Failed to channelRemoveChannelGroupClients');
                    })


                }).then(() => {

                    //Set channel free in the database.
                    return Teams.findByIdAndUpdate(team._id,
                        { $set: { 
                            serverGroupId: null, 
                            teamName: null, 
                            status: 'free', 
                            ownerID: null,
                            members: [] } 
                    
                        }).then(() => {
                        return ApiReply('freeUpChanels: Channel freed up', {name: team.teamName, _id: team._id})
                
                        }).catch(err => {
                            throw failedApiReply(err, 'freeUpChanels: Failed to find team db and Update');
                        })
                })
                
            } else if (team.status == 'free') {
                return ApiReply('freeUpChanels: Channel is already free', {name: team.teamName, _id: team._id})
            } else {
                return ApiReply('freeUpChanels: Channel is still in use', {name: team.teamName, _id: team._id})
            }
        });

            
        //Resolves and Checks if there was any problem with executiong returns results.
        return Promise.all(promiseArr)
        .then(resultsArray => {
            return ApiReply('freeUpChanels: Sucess', resultsArray)
            // do something after the loop finishes
        }).catch(err => {
            throw failedApiReply(err, 'freeUpChanels: For Each Failed.'); 
            // do something when any of the promises in array are rejected
        })
        //

    }, (err) => {
        throw failedApiReply(err, 'freeUpChanels: Failed to find team');
    })
    .catch(err => {
        throw failedApiReply(err, 'freeUpChanels: Failed to find team');
    })
}

////////////////////////////////////
//      Main/Exported Methods     //
////////////////////////////////////


/**
 * Moves client to the first channel of a team.
 * @param {Number} mainChannelId - CID of the Main Channel
 * @param {String} ownerUuid - TeamSpeak User Unique Identifier
 */
const moveToFirstChannel = (mainChannelId, ownerUuid) => {

    return ts3core.subChannelList(mainChannelId)
       .then(channels => {
    
            return ts3core.getClidFromUid(ownerUuid)
            .then(clid => { 
                //Set Channel Group to all SubChannels                
                    return ts3.clientMove(clid, channels[0]._propcache.cid)
                    .then(() => {
                        return ApiReply('moveToFirstChannel: Client Moved Sucessfully', null)
                    })
                    .catch(err => {
                        throw failedApiReply(err, 'moveToFirstChannel: Failed to Move Client');
                    })
            })
            .catch(err => {
                throw failedApiReply(err, 'moveToFirstChannel: Failed to get getClidFromUid');
            })
        })
        .catch(err => {
            throw failedApiReply(err, 'moveToFirstChannel: Failed to get subChannelList');
        })
}


/**
 * Adds client to a ServerGroup
 * @param {String} ownerUuid - TeamSpeak User Unique Identifier
 * @param {Number} sgid - ServerGroup Id
 */
const setClientServerGroupByUid = (ownerUuid, sgid) => {

    //Get User DBID
    return ts3core.getCldbidFromUid(ownerUuid)
    .then(cldbid => { 
        //Get list of SubChannels
       return ts3.serverGroupAddClient(cldbid, sgid)
       .then((data) => {
            return ApiReply('setClientServerGroupByUid: Server Group Assigned', data)
       })
            
    })
    .catch(err => {
        throw failedApiReply(err, 'setClientServerGroupByUid: Failed to get cldbid');
    })
}


/**
 * Removes client from ServerGroup
 * @param {String} ownerUuid - TeamSpeak User Unique Identifier
 * @param {Number} sgid - ServerGroup ID
 */
const removeClientServerGroupByUid = (ownerUuid, sgid) => {

    //Get User DBID
    return ts3core.getCldbidFromUid(ownerUuid)
    .then(cldbid => { 
        //Remove Server Group
        return ts3.serverGroupDelClient(cldbid, sgid)
        .then((data) => {
            return ApiReply('removeClientServerGroupByUid: Success', data)
        })       
    })
    .catch(err => {
        throw failedApiReply(err, 'removeClientServerGroupByUid: Failed to get cldbid');
    })
}


/**
 * Sets channelgroup to a user by is uuid
 * @param {Number} cgid - ChannelGroup ID.
 * @param {Number} mainChannelId - CID of the Main Channel.
 * @param {String} ownerUuid - TeamSpeak User Unique Identifier 
 */
const setClientChannelGroupUid = (cgid, mainChannelId, ownerUuid) => {

    //Get User DBID
    return ts3core.getCldbidFromUid(ownerUuid)
    .then(cldbid => { 
        //Get list of SubChannels
        return ts3core.subChannelList(mainChannelId)
        .then(channels => {

            //Works Like a ForEach Loop but it's async
            let promiseArr = channels.map(channel => {
                
                //Set  Channel Group to Client
                return ts3.setClientChannelGroup(cgid, channel._propcache.cid, cldbid)
                .then(() => {
                    return channel._propcache.cid;
                })
                .catch(err => {
                    throw failedApiReply(err, 'setClientChannelGroupUid: Failed to get cldbid');
                })
            });
                
            //Resolves and Checks if there was any problem with executiong returns results.
            return Promise.all(promiseArr)
            .then(resultsArray => {
                return ApiReply('Channel Group Assigned', resultsArray)
                // do something after the loop finishes
            }).catch(err => {
                throw failedApiReply(err, 'setChannelGroupbyUid: Error Setting ChannelGroup.'); 
            // do something when any of the promises in array are rejected
            })
            //

        })
        .catch(err => {
            throw failedApiReply(err, 'setClientChannelGroupUid: Failed to get cldbid');
        })
    })
    .catch(err => {
        throw failedApiReply(err, 'setClientChannelGroupUid: Failed to get cldbid');
    })
}


/**
 * Sets SubChannels private
 * @param int ChannelId 
 */
const setSubChannelsPrivate = (cid) => {

    cid = parseInt(cid);

    //Get the List of the SubChannels;
    return ts3core.subChannelList(cid)
    .then(channels => {
        if (channels.length == 0) {
        throw failedApiReply('', 'setSubChannelsPrivate: Channel doesn\'t exist');
       
        } else {

            //Works Like a ForEach Loop but it's async
            let promiseArr = channels.map((channel, i) => {
                //This is used to name the SubChannels
                subIndex = i + 1;
                //Making the Name
                if (!(subIndex == channels.length)) {
                    subName = config.channelSettings.subChannelName + " " + subIndex;

                } else {
                    subName = config.channelSettings.awayChannelName;
                }

                //Change the name of the channel
                return ts3core.edit(false, channel._propcache.cid, subName, '', '', '')
                .then(() => {
                    return ApiReply('Channel Edited', channel._propcache.cid)
                })
                .catch(err => { 
                    throw failedApiReply(err, 'setSubChannelsPrivate: Failed to edit channel');
                })
            });
                            
            //Resolves and Checks if there was any problem with executiong returns results.
            return Promise.all(promiseArr)
            .then(resultsArray => {
                return ApiReply('setSubChannelsPrivate: Channel Edited', resultsArray)
                // do something after the loop finishes
            }).catch(err => {
                throw failedApiReply(err, 'setSubChannelsPrivate: Error Editing.'); 
            // do something when any of the promises in array are rejected
            })
             //
        }
    })
    .catch(err => {
        throw failedApiReply(err, 'setSubChannelsPrivate: Failed to get subChannelList');
    })

}


/**
 * Sets SubChannels public 
 * @param int ChannelId 
 */
const setSubChannelsPublic = (cid, password) => {

    cid = parseInt(cid);

    //Get the List of the SubChannels;
    return ts3core.subChannelList(cid)
    .then(channels => {
        //If there aren;t any subchannels then throw error
        if (channels.length == 0) {
        throw failedApiReply('', 'setSubChannelsPublic: Channel doesn\'t exist');
       
        } else {

            //Works Like a ForEach Loop but it's async
            let promiseArr = channels.map((channel, i) => {
                //Making the Name
                subIndex = i + 1;
                
                if (!(subIndex == channels.length)) {
                    subName = config.channelSettings.subChannelName + " " + subIndex;

                } else {
                    subName = config.channelSettings.awayChannelName;
                }

                //Change the name of the channel
                return ts3core.edit(true, channel._propcache.cid, subName, password, '', '')
                .then(() => {
                    return ApiReply('Channel Edited', channel._propcache.cid)
                })
                .catch(err => { 
                    throw failedApiReply(err, 'setSubChannelsPublic: Failed to edit channel');
                })
            });
                            
            //Resolves and Checks if there was any problem with executiong returns results.
            return Promise.all(promiseArr)
            .then(resultsArray => {
                return ApiReply('setSubChannelsPublic: Channel Edited', resultsArray)
                // do something after the loop finishes
            }).catch(err => {
                throw failedApiReply(err, 'setSubChannelsPublic: Error Editing.'); 
            // do something when any of the promises in array are rejected
            })
             //
        }
    })
    .catch(err => {
        throw failedApiReply(err, 'setSubChannelsPublic: Failed to get subChannelList');
    })

}



/**
 * Gets and array of the channels that are free.
 */
const getFreeTeams = () => {
    //Find all the Teams that are Free
    return Teams.find({status: 'free'}).then((teams) => {
        return ApiReply('setSubChannelsPublic: Channel Edited', teams)
        })
    .catch(err => {
        throw failedApiReply(err, 'setClientChannelGroupUid: Failed to get cldbid');
    })
}


module.exports = {
    registerClient,
    addUserToTeam,
    removeUserFromTeam,
    reassignChannelGroups,
    channelRemoveChannelGroupClients,
    moveChannel,
    changeTeamName,
    createServerGroup,
    crawlerChannels,
    getTopFreeChannel,
    createTeam,
    createChannels,
    claimChannels,
    createGroupOfChannels,
    setSubChannelsPrivate,
    setSubChannelsPublic,
    getFreeTeams,
    freeUpChanels,
    moveToFirstChannel,
    setClientServerGroupByUid,
    removeClientServerGroupByUid,
    setClientChannelGroupUid,
    setChannelGroupbyUid
    
};




ts3.on("ready", () => {

})