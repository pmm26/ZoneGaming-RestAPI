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
TODO NEXT TIME:

- Add User to the Channel Member *Done
- Remove user from Channel Member *Done
- Channel Crawl *Done
- Move Channel *Done
- Delete Team 
- 
- Create Server Group *Done
- Change Name *Done

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

    Members.findById(memberObjectID)
    .then(member => {
        console.log(member)
            Teams.findByIdAndUpdate(teamObjectID,
            { $push: {
                members: {   
                    memberId: member._id,      
                    memberUuid: member.uuid,
                    permissions: permission
                }
            }
            
        }).then(say => { 
            console.log(say)
        }).catch(err => console.error('1:' + err))

        return Teams.findById(teamObjectID)
            .then(team => {
                //console.log(team)
                setChannelGroupbyUid(config.groupSettings.guestChannelGroup, team.mainChannelId, member.uuid)
        
                if (team.serverGroupId != null) {
                    setClientServerGroupByUid(member.uuid, sgid)
                    .catch(err => console.error('1:' + err))    
            }
        })
        .catch(err => console.error('1:' + err))
    })
    .catch(err => console.error('1:' + err))
}


/**
 * Removes user from the team. (inc: ServerGroup, ChannelAdmin, DB...)
 * @param {String} teamObjectID - Team objectID of the Database
 * @param {String} memberObjectID - Member objectID of the Database
 */
const removeUserFromTeam = (teamObjectID, memberObjectID) => {

    Members.findById(memberObjectID)
    .then(member => {
        console.log(member)
            Teams.findByIdAndUpdate(teamObjectID,
            { $pull: {
                members: {   
                    memberId: member._id,      
                }
            }
            
        }).then(say => { 
            console.log(say)
        }).catch(err => console.error('1:' + err))

        return Teams.findById(teamObjectID)
            .then(team => {
                //console.log(team)
                setChannelGroupbyUid(config.groupSettings.guestChannelGroup, team.mainChannelId, member.uuid)
        
                if (team.serverGroupId != null) {
                    removeClientServerGroupByUid(member.uuid, team.serverGroupId)
                    .catch(err => console.error('1:' + err))    
            }
        })
        .catch(err => console.error('1:' + err))
    })
    .catch(err => console.error('1:' + err))
}


/**
 * Gives a user ChannelGroup Permission on all the subchannels.
 * @param {Number} sgid - ServerGroup ID
 * @param {Number} mainChannelId - Main id of the channel / spacer
 * @param {String} uuid  - TeamSpeak Client Unique ID
 */
const setChannelGroupbyUid = (sgid, mainChannelId, uuid) => {

    //Get the List of the SubChannels;
    ts3core.subChannelList(mainChannelId)
    .then(channels => {
        //Set Remove Channel Group to all SubChannels
        channels.forEach((channel)  => {
        
            ts3core.getCldbidFromUid(uuid)
                    .then(cldbid => {
                        ts3.setClientChannelGroup(sgid, channel._propcache.cid, cldbid)
                        .catch(err => console.error('1:' + err))
            })
            .catch(err => console.error('1:' + err))
        })
    })
    .catch(err => console.error('1:' + err))
}


/**
 * Removes all Channel Groups from everyone in the team and then reassigns them.
 * @param {String} teamObjectID - TeamObjectID from the Database
 */
const reassignChannelGroups = (teamObjectID) => {

    return Teams.findById(teamObjectID)
    .then(team => {

        return channelRemoveChannelGroupClients(team.mainChannelId)
        .then(() => {
            
            //Get the List of the SubChannels;
            return ts3core.subChannelList(team.mainChannelId)
            .then(channels => {


                //Set Remove Channel Group to all SubChannels
                channels.forEach((channel)  => {

                    team.members.forEach( member => {
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

                        ts3core.getCldbidFromUid(member.memberUuid)
                        .then(cldbid => {
                             ts3.setClientChannelGroup(channelGroupId, channel._propcache.cid, cldbid)
                            .catch(err => console.error('1:' + err))
                    
                        }) 
                        .catch(err => console.error('1:' + err))
                    })
                
                })
                

            })
            .then(() => {
                return api = {
                    status: 'OK',
                    msg: 'ChannelGroups reassigned successfully!'
                }

            })
            .catch(err => console.error('1:' + err))
        })
        .catch(err => console.error('1:' + err)) 
    })
    .catch(err => console.error('1:' + err))
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
      
       
        //Set Remove Channel Group to all SubChannels
        channels.forEach((channel)  => {

            //Do this for all the ChannelGroups that exist
            config.ChannelGroupsAdmin.forEach((channelGroupId) => {

            
                //Get ChannelGroup object
                ts3.getChannelGroupByID(channelGroupId)
                .then(channelGroup => {

                    //Get the List of clients that are part of that ChannelGroup
                    channelGroup.clientList(channel._propcache.cid)
                    .then(clients => { 

                        //Set Guest ChannelGroup to all Clients of that group
                        clients.forEach(client => {

                            ts3.setClientChannelGroup(config.groupSettings.guestChannelGroup, client.cid, client.cldbid)
                        })
                    })

                    //If there were no Clients in the ChannelGroup
                    .catch(err => {
                            if (err.id == 1281) {
                            console.error('ChannelGroup was empty')
                            } else {
                                console.error(err)
                            }
                    })
                }).catch(err => console.error('1:' + err)) 
            })
            
        });
    }).catch(e => {
        console.log(e);
    });
}


/**
 * Swaps channel position with another channel.
 * @param {string} teamObjectID - Team objectID from the Database
 * @param {String} memberObjectID - Member objectID from the Database
 */
const moveChannel = (oldTeamObjectID, newTeamObjectID) => {

    Teams.findById(newTeamObjectID)
    .then((newTeam) => {
            Teams.findById(oldTeamObjectID)
            .then((oldTeam) => {
            


                //Update Database Records
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
                .catch(err => console.error('1:' + err))


                //Update Database Records
                Teams.findByIdAndUpdate(
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
                    Teams.findById(oldTeamObjectID)
                    //Teams.find()
                    .then((team) => {
                        console.log(team)
                       
                        claimChannels(team.teamName, '', team.ownerID, team._id, true )
                        .then(() => {
                             

                            freeUpChanels()
                        })
                    })
                    reassignChannelGroup(oldTeamObjectID)
                    
                })
                
            })
            .then((s) => console.log('Sucess 3', s))
            .catch(err => console.error('3:' + err))
    })
    .then((s) => console.log('Sucess 4', s))
    .catch(err => console.error('4:' + err))
}


/**
 * Changes the name of the Team
 * @param {String} teamObjectID - Member objectID from the Database.
 * @param {String} name - New name for the team.
 */
const changeTeamName = ( teamObjectID, name) => {
    
    Teams.findByIdAndUpdate(teamObjectID,
        { $set: {   
            teamName: name,
        }})
        .then(team => {
            console.log(team)
            gameArea.findOne({areaId: team.gameArea})
            .then((area) => {
                if (!area) {
                   console.log('No Area I guess');
                } 
    
                //making the name
                let processedName = '[cspacer' + team.spacerNumber + ']' + area.areaName[0] + team.channelOrder + ' - ★ ' + name + ' ★';
    
                //Edit the claimed channel
                ts3core.edit(true, team.mainChannelId, processedName, '', 'topic', 'description');
    

                ts3.serverGroupRename(team.serverGroupId, name)
            })
            .catch(err => console.error('Error Fetching gameArea changeTeamName:' + err))
    })
        .catch(err => console.error('Error Chaging Name DB changeTeamName:' + err))
}


/**
 * Creates a ServerGroup for the team.
 * @param {String} uuid - TeamSpeak Unique ID
 */
const createServerGroup = (uuid) => {

    Teams.findOne({ownerID: uuid })
    .then(team => {

        //console.log(config.groupSettings.serverGroupTemplate)
        
    
            ts3.serverGroupCopy(config.groupSettings.serverGroupTemplate, 0, 1, team.teamName)
            .then(group => {
            // console.log(group)


                ts3core.getCldbidFromUid(uuid)
                .then(cldbid => {

                    ts3.serverGroupAddClient(cldbid, group.sgid)
                    .then(() => {
                        


                        Teams.findOneAndUpdate(
                            { ownerID: uuid },
                            { $set: {   
                                serverGroupId: group.sgid,
                            }})
                            .catch(err => console.error('Error Saving to Database createServerGroup:' + err))

                        })
                        .catch(err => console.error('Error Adding user to group createServerGroup:' + err))

                    })
                    .catch(err => console.error('Error fetching cldbid createServerGroup:' + err))

                console.log(group.sgid)
            })
            .catch(err => console.error('Error createServerGroup:' + err));
        

    })
    .catch(err => console.error('Database SaveError createServerGroup:' + err))

}


/**
 * Crawls the TeamSpeak every few minutes and stores when the channels were last used. 
 * Used for channel deletion.
 */
const crawlerChannels = () => {
    ts3.channelList()

    .then(channels => {
        //console.log(channels)

        Teams.find({status: 'OK'})
        .then(teams => {
            //console.log(teams)
        
            mainChannelsIDs = [];

            teamsArray.forEach(team => {

                mainChannelsIDs.push(teamsArray.mainChannelId)
            
            });

            //console.log(mainChannelsIDs)

            edited = [];

            channels.forEach(channel => {

                if (mainChannelsIDs.includes(channel._propcache.pid)) {
                    //console.log(channel._propcache.channel_name)
                    
                    if (channel._propcache.total_clients > 0 & !(edited.includes(channel._propcache.pid))) {
                        edited.push(channel._propcache.pid)
                        console.log('Added ', channel._propcache.pid)

                        Teams.findOneAndUpdate(
                            { mainChannelId: channel._propcache.pid },
                            { $set: {   
                                lastUsed: Date.now(),
                            }})
                        .then(info => console.log)
                        //Save to the Database update timeStamp with the current date.

                    }
                }
            });
        })
        .catch(err => console.error('Error Getting the ID:', err));
        
    })
    .catch(err => console.error('Error Claming Channels:', err));  

}


/**
 * Create New Team by Creating Channels of Claming
 * @param {String} name 
 * @param {String} password 
 * @param {String} ownerUuid 
 * @param {Number} gameAreaId 
 * @param {boolean} move 
 */
const createTeam = (name, password, ownerUuid, gameAreaId, move) => {

    return getTopFreeChannel(gameAreaId)
    .then(team => {
        console.log()
        console.log(team)
        console.log()
        if (team != null) {
            claimChannels(name, password, ownerUuid, team._id, move )
            .catch(err => console.error('Error Claming Channels:', err));
            
        } else {
            createChannels(name, password, ownerUuid, gameAreaId, move)
            .catch(err => console.error('Error Creating Channels:', err));
            
        }
        
    })
    .catch(err => console.error('createTeam error:', err));


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
               console.log('No Area I guess');
            } 

            //making the name
            let processedName = '[cspacer' + team.spacerNumber + ']' + area.areaName[0] + team.channelOrder + ' - ★ ' + name + ' ★';

            //Edit the claimed channel
            ts3core.edit(true, team.mainChannelId, processedName, '', 'topic', 'description');

            //Make subchannels Public
            setSubChannelsPublic(team.mainChannelId, password)

            //Make client Channel Admin
            setClientChannelGroupUid(config.groupSettings.channelAdmin, team.mainChannelId, ownerUuid)

            //Move client to channel
            moveToFirstChannel(team.mainChannelId, ownerUuid)
            
            .then(() => {

                //Update Database Records
                Teams.findByIdAndUpdate(
                    team._id,
                    { $set: {   
                        teamName: name,
                        status: 'OK',
                        ownerID: ownerUuid,
                        members: [ {   
                            memberId: 1,      
                            memberUuid: ownerUuid,
                            permissions: 1
                        } ]
                    }}) //Add Member


                .then((todo) => {
                    if (!todo) { 
                        console.log('Error', todo);
                    }
                    console.log('Sucess', todo);
    
                }).catch((e) => {
                    console.log('Error', e);
                });
    
            }).catch(e => {
                console.log('claimTeam: Error Editing Channels', e);
            });
        })

    }).catch(e => {
        console.log('claimTeam: Team Not Found', e);
        
    });
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


    return gameArea.findOne({areaId: gameAreaId})
    .then((area) => {
        if (!area) {
           console.log('No Area I guess');
        } 
 

        //Generate the Name of the Channel
        let processedName = '[cspacer' + area.nextSpacerNumber + ']' + area.areaName[0] + area.nextChannelNumber + ' - ★ ' + name + ' ★'
        //console.log(name);

        
        createGroupOfChannels(processedName, password, topic, description, area.nextSpacerNumber, area.lastChannelId)
        .then(channelIds => {

            //Storing in the database details about the Channel and the Teamspeak Channel ids.
            let team = new Teams(Object.assign({
                    teamName: name,
                    ownerID: ownerUuid,
                    channelOrder: area.nextChannelNumber,
                    spacerNumber: area.nextSpacerNumber,
                    gameArea: gameAreaId,
                    // creationDate:
                    // nextMove:
                    // lastUsed:
                    members: [ {   
                        memberId: 1,      
                        memberUuid: ownerUuid,
                        permissions: 1
                    }
                    ]
                    
                }, channelIds));

            //Save the New Channel
            team.save()
            .then((doc) => { //Saving the data to the database
                console.log();
                console.log('Data Saved Successfully', doc)
                console.log();
            }, (e) => {
                console.log('Data Could not be saved:', e)
            }).catch((e) => {
                console.log('Error Writing to DB', e);
            });

            //Update the GameArea
            gameArea.findOneAndUpdate(
                { areaId: gameAreaId },
                { $inc: { nextChannelNumber: 1, nextSpacerNumber: 1 },
                  $set: { lastChannelId: channelIds.spacerBarId } })
            .then((todo) => {
                if (!todo) { 
                    console.log('Error', todo);
                }
                console.log('Sucess', todo);
        
            }).catch((e) => {
                console.log('Error', e);
            });

            setClientChannelGroupUid(config.groupSettings.channelAdmin, channelIds.mainChannelId, ownerUuid)

            if (move) {
                moveToFirstChannel(channelIds.mainChannelId, ownerUuid) 
            }
            
         
        
        })
        .catch((e) => {
            console.log('Error', e);
        });
    })
    .catch((e) => {
            console.log('Not found!', e)
    });

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

    //Connect to the database and get the last ids and numbers of the channel

    return ts3core.create( false, name, '', topic, description, '', lastCid)
    .then(mainChannel => { 
        
        ts3core.create(true, config.channelSettings.subChannelName + ' 1', password, topic, description, mainChannel._propcache.cid, '')
        ts3core.create(true, config.channelSettings.subChannelName + ' 2', password, topic, description, mainChannel._propcache.cid, '');
        ts3core.create(true, config.channelSettings.subChannelName + ' 3', password, topic, description, mainChannel._propcache.cid, '');
        ts3core.create(true, config.channelSettings.awayChannelName, password, topic, description, mainChannel._propcache.cid, '');
            
        return ts3core.create(false, '[rspacer' + spacerNumber + ']', '', '', '', '', mainChannel._propcache.cid)
        .then(spacerChannel => {
            return ts3core.create(false, '[*spacer' + spacerNumber + ']' + config.channelSettings.spacerBar, '', '', '', '', spacerChannel._propcache.cid)
            .then(spacerBar => {
                          
                let channelIds = {
                    mainChannelId: mainChannel._propcache.cid,
                    spacerEmptyId: spacerChannel._propcache.cid,
                    spacerBarId: spacerBar._propcache.cid
                }

                console.log(channelIds);

                //SAVE DATA TO THE DATABASE
                return channelIds;
            
            })
            .catch(err => console.log('Errror Saving', err));        
        })
        .then(channelIds => { return channelIds; })
        .catch(err => console.log('Error Creating Sub Channels', err));
    })
    .then(channelIds => { return channelIds; })
    .catch(err => console.log('Error Creating Main Channel', err));
}


/**
 * Free's Up unused channels.
 */
const freeUpChanels = () => {

    return Teams.find().then((teams) => {
        teams.forEach(team => {
            
           // if ((team.status == 'OK') | (team.status == 'clean')) { //TODO: Add Time Check
           if ( (team.status == 'clean')) {
                //Get the First Letter of the Area Name
                gameArea.findOne({areaId: team.gameArea})
                .then((area) => {
                    if (!area) {
                       console.log('Area Not Found!');
                    } 

                    //Make the Name of the Channel
                    let channelNameFree = '[cspacer' + team.spacerNumber + ']' + area.areaName[0] + team.channelOrder + ' - ★ ' + config.channelSettings.freeSpacerName + ' ★'

                    //Edit Channel to set the New Name
                    ts3core.edit(false, team.mainChannelId, channelNameFree, '', '', '')
                    .then(() => console.log('Name Channel changed!'))
                    .catch((e) => {
                        console.log('Error', e);
                    });
                })
                .catch((e) => {
                    console.log('Error', e);
                });

                //Make all the SubChannels Private
                setSubChannelsPrivate(team.mainChannelId)

                //TODO: Remove old Channel Admins
                channelRemoveChannelGroupClients(team.mainChannelId)

               
                //Set channel free in the database.
                Teams.findByIdAndUpdate(team._id,
                    { $set: { 
                        serverGroupId: null, 
                        teamName: null, 
                        status: 'free', 
                        ownerID: null,
                        members: [] } 
                
                    }).then((todo) => {
                    if (!todo) { 
                        console.log('Error', todo);
                    }
                    console.log('Sucess', todo);
            
                    }).catch((e) => {
                    console.log('Error', e);
                });
            }
        });
    }, (e) => {
        console.log('Data Could not be retrived:', e)
    })
    .catch(e => {
        console.log(e);
    });
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
    
            ts3core.getClidFromUid(ownerUuid)
            .then(clid => { 
                //Set Channel Group to all SubChannels                
                    ts3.clientMove(clid, channels[0]._propcache.cid)
            })
        })
        .catch(err => console.error('getClidFromUid error:', err));
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
       ts3.serverGroupAddClient(cldbid, sgid);
            
    })
    .catch(err => console.error('getClidFromUid error:', err));
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
        //Get list of SubChannels
       ts3.serverGroupDelClient(cldbid, sgid);
            
    })
    .catch(err => console.error('getClidFromUid error:', err));
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
        ts3core.subChannelList(mainChannelId)
        .then(channels => {
    
            //Set Channel Group to all SubChannels
            channels.forEach(channel => {
            ts3.setClientChannelGroup(cgid, channel._propcache.cid, cldbid);
            
            });     
        })
        .catch(err => console.error('getClidFromUid error:', err));
    })
    .catch(err => console.error('getClidFromUid error:', err));
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
      
       
        //Set Channel Group to all SubChannels
        channels.forEach((value, i)  => {

            subIndex = i + 1;
        
            if (!(subIndex == channels.length)) {
                subName = config.channelSettings.subChannelName + " " + subIndex;

            } else {
                subName = config.channelSettings.awayChannelName;
            }

            ts3core.edit(false, value._propcache.cid, subName, '', '', '');
        });

    }).catch(e => {
        console.log(e);
    });

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
      
       
        //Set Channel Group to all SubChannels
        channels.forEach((value, i)  => {

            subIndex = i + 1;
        
            if (!(subIndex == channels.length)) {
                subName = config.channelSettings.subChannelName + " " + subIndex;

            } else {
                subName = config.channelSettings.awayChannelName;
            }

            ts3core.edit(true, value._propcache.cid, subName, password, '', '');
        });

    }).catch(e => {
        console.log(e);
    });

}


/**
 * Gets and array of the channels that are free.
 */
const getFreeTeams = () => {
    //Find all the Teams that are Free
    return Teams.find({status: 'free'}).then((teams) => {
            return teams;
        })
    .catch(e => {
        console.log(e);
    });
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
    setClientChannelGroupUid
    
};




ts3.on("ready", () => {

})