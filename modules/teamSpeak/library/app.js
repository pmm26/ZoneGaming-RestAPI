//Core
const ts3core = require("./ts3Connect") //Create and Claim 
const {ts3} = require("./ts3Connect")  //Dafault Library
const config = require('../../../config/ts3config'); //Objext that contains all the default properties to create a channel
const _ = require('lodash');

//Database
const gameArea = require('../../../database/models/game_area');
const Teams = require('../../../database/models/teams');
const Members = require('../../../database/models/members');
const Groups = require('../../../database/models/groups');

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

const failedApiReply = (error, msg) => {

    if (!error.error) {

        failedApi = {
            message: msg,
            error: error
        }
        return failedApi;
    }

    return error;
}

const ApiReply = (msg, data) => {

    api = {
        message: msg,
        data: data
    }

    return api;

}

const serverInfo = () => {
    return ts3.serverInfo()
}

const createGroup = (name, type) => {


    return ts3.serverGroupCopy(config.groupSettings.gameServerGroupTemplate, 0, 1, name)
        .then(serverGroup => {

            //Add a new Entry to the Groups DB.
            let group = new Groups({
                serverGroupId: serverGroup.sgid,
                serverGroupName: name,
                groupType: type,
                members: []
            });

            group.save()

            //Save the New Channel
            return ApiReply('Group Created!', group);


        }).catch(err => {
            if (err.id === 1282) {
                throw failedApiReply(err, 'createGroup: That name is already in use!');
            }
            throw failedApiReply(err, 'createGroup: Failed to create or save a group');
        })
}

const addUserToGroup = (groupId, member) => {

    //Check if the user has linked his account to TeamSpeak

    //fix the Multiple add to the database/
    return Groups.findByIdAndUpdate(groupId,
        {
            $push: {
                members: {
                    memberId: member._id,
                    memberUuid: member.uuid
                }
            }
        })
        .then(group => {

            return setClientServerGroupByUid(member.uuid, group.serverGroupId)
                .then(info => {

                    return ApiReply('Group Created!', info);
                })
                .catch(err => {
                    throw failedApiReply(err, 'addUserToGroup: Failed add user to the serverGroup');
                })

        }).catch(err => {
            throw failedApiReply(err, 'addUserToGroup: Failed to fetch group database.');
        })

}

const removeUserToGroup = (groupId, member) => {

    //Check if the user has linked his account to TeamSpeak

    //save it on the database
    return Groups.findByIdAndUpdate(groupId,
        {
            $pull: {
                members: {
                    memberId: member._id,
                }
            }
        })
    //  Favorite.update( {cn: req.params.name}, { $pullAll: {uid: [req.params.deleteUid] } } )
        .then(group => {

            return removeClientServerGroupByUid(member.uuid, group.serverGroupId)
                .then(info => {

                    return ApiReply('Group Created!', info);
                })
                .catch(err => {
                    throw failedApiReply(err, 'addUserToGroup: Failed add user to the serverGroup');
                })

        }).catch(err => {
            throw failedApiReply(err, 'addUserToGroup: Failed to fetch group database.');
        })

}


const generateUserDescription = (memberId) => {

    //Check if the user has linked his account to TeamSpeak

    return Members.findById(memberId)
        .then(member => {

            description = `Veja a Minha Pagina em: [url]deepgaming.pt/${member._id}[/url]`

            return ts3core.changeUserDescription(member.uuid, description)
        })

}

const generateTeamDescription = (teamId) => {

    //Check if the user has linked his account to TeamSpeak

    return Teams.findById(teamId)
        .then(team => {

            topic = `Veja a pagina desta equipa em em: [url]deepgaming.pt/${team._id}[/url]`
            description = `Veja a Minha Pagina em: [url]deepgaming.pt/${team._id}[/url]`

            return ts3core.edit(false, team.mainChannelId, null, null, topic, description)
        })


}


const deleteBottonTeams = () => {


}

const serverView = () => {

    return ts3.channelList()
        .then(channels => {

            return ts3.clientList()
                .then(clients => {

                    //Start
                    let promiseArr2 = channels.map(channel => {

                        let channelObject = {
                            cid: channel._propcache.cid,
                            pid: channel._propcache.pid,
                            channel_order: channel._propcache.channel_order,
                            channel_name: channel._propcache.channel_name,
                            channel_flag_password: channel._propcache.channel_flag_password,
                            channel_icon_id: channel._propcache.channel_icon_id,
                            total_clients: channel._propcache.total_clients

                        }

                        //START
                        let promiseArr = clients.map(client => {

                            return Members.findOne({uuid: client._propcache.client_unique_identifier})
                                .then(member => {

                                    UserObject = {};

                                    if (member) {

                                        let UserObject = {
                                            registered: true,
                                            _id: member._id,
                                            uuid: client._propcache.client_unique_identifier,
                                            clid: client._propcache.clid,
                                            cid: client._propcache.cid,
                                            client_nickname: client._propcache.client_nickname
                                        }

                                        return UserObject;

                                    } else {
                                        let UserObject = {
                                            registered: false,
                                            uuid: client._propcache.client_unique_identifier,
                                            clid: client._propcache.clid,
                                            cid: client._propcache.cid,
                                            client_nickname: client._propcache.client_nickname
                                        }
                                        return UserObject;

                                    }


                                })


                        })

                        //Resolves and Checks if there was any problem with executiong returns results.
                        return Promise.all(promiseArr)
                            .then(clientsArray => {

                                channelClients = clientsArray.filter(cl => channelObject.cid == cl.cid);

                                return channelClients

                            }).then(clients => {
                                channelObject.clients = clients

                                return channelObject;

                            }).catch(err => {
                                throw failedApiReply(err, 'API serverView: Error in the filtering process.');
                            })
                        //END

                    })


                    //Resolves and Checks if there was any problem with executiong returns results.
                    return Promise.all(promiseArr2)
                        .then(serverView => {

                            return serverView;

                            // do something after the loop finishes
                        }).catch(err => {
                            throw failedApiReply(err, 'API serverView: Failed to return data');
                        })

                }).catch(err => {
                    throw failedApiReply(err, 'API serverView: Failed to get clientList');
                })

        }).catch(err => {
            throw failedApiReply(err, 'API serverView: Failed to get channelList');
        })

}


const channelView = (cid) => {
    return serverView()
        .then(view => {
            // console.log(view);
            return view.filter(channel => channel.pid == cid);
        }).catch(err => {
            throw failedApiReply(err, 'API channelView: Failed to get channels');
        })
}

const isMemberOnTheServer = (uuid) => {

    //Check is uuid is connected to
    let filteredClients = [];

    return ts3.clientList()
        .then(clients => {

            let promiseArr = clients.map(client => {
                if (_.isEqual(client._propcache.connection_client_ip, clientIp)) {
                    return true;
                }
                return false;
            });

            //Resolves and Checks if there was any problem with executiong returns results.
            return Promise.all(promiseArr)
                .then(users => {
                    if (users.includes(true))
                        return ApiReply('Member is connected!', true);
                    else
                        return ApiReply('Member is not connected', false);

                    // do something after the loop finishes
                }).catch(err => {
                    throw failedApiReply(err, 'API isMemberOnTheServer: Error happened while checking if the user is connected to the server');
                })
        }).catch(err => {
            throw failedApiReply(err, 'API isMemberOnTheServer: Failed to get clientList');
        })
}


const getUsersByIp = (clientIp) => {

    let filteredClients = [];

    return ts3.clientList()
        .then(clients => {

            let promiseArr = clients.map(client => {
                if (_.isEqual(client._propcache.connection_client_ip, clientIp)) {
                    filteredClients.push({
                        name: client._propcache.clid,
                        name: client._propcache.client_nickname,
                        uuid: client._propcache.client_unique_identifier
                    })
                }
            });

            //Resolves and Checks if there was any problem with executiong returns results.
            return Promise.all(promiseArr)
                .then(() => {

                    return ApiReply('Users fetched sucessfully', filteredClients);

                    // do something after the loop finishes
                }).catch(err => {
                    throw failedApiReply(err, 'getUsersByIp: Failed to get users from TeamSpeak');
                })
        }).catch(err => {
            throw failedApiReply(err, 'API getUsersByIp: Failed to get clientList');
        })

}

const sendTokenRequest = (memberId, clid, uuid) => {

    let dt = new Date();

    let randomNumber = Math.floor(100000 + Math.random() * 900000);

    ts3.sendTextMessage(clid, 1, randomNumber)

    return Members.findByIdAndUpdate(memberId,
        {
            $push: {
                linkTokens: {
                    token: randomNumber,
                    uuid: uuid,
                    expiryDate: new Date(dt.getTime() + 10 * 60000)
                }
            }
        }
    ).catch(err => {
        throw failedApiReply(err, 'sendTokenRequest: Failed to save Token to the DB');
    })


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


/**
 * Adds User to the Team (inc: ServerGroup, ChannelAdmin, DB...)
 * @param {string} teamObjectID - Team objectID from the Database
 * @param {String} memberObjectID - Member objectID from the Database
 * @param {Number} permission - 1 to 4, 1 = Founder, 4 = Member
 */
const addUserToTeam = (team, member, permission) => {


    if (permission == 1) {
        channelGroupId = config.groupSettings.channelAdmin;

    } else if (permission == 2) {
        channelGroupId = config.groupSettings.channelAdmin;

    } else if (permission == 3) {
        channelGroupId = config.groupSettings.channelMod;

    } else if (permission == 4) {
        channelGroupId = config.groupSettings.channelMember;

    } else {
        return removeUserFromTeam(team, member)
            .catch(err => {
                throw failedApiReply(err, 'addUserToTeam: removeUserFromTeam failed');
            })
    }

    let teamMemberArray = team.members.filter(teamMember => _.isEqual(teamMember.memberId, member._id));
    //TODO Remove Code Duplication
    //if the user is not a member of the team
    if (_.isEmpty(teamMemberArray)) {

        return Teams.findByIdAndUpdate(team._id,
            {
                $push: {
                    members: {
                        memberId: member._id,
                        memberUuid: member.uuid,
                        permissions: permission
                    }
                }
            }, {new: true}
        ).then(newTeam => {
            //If team has a servergroup, then add the user to it
            if (team.serverGroupId != null) {
                setClientServerGroupByUid(member.uuid, team.serverGroupId)
                    .catch(err => {
                        throw failedApiReply(err, 'addUserToTeam: setClientServerGroupByUid failed');
                    })
            }


            //reset channelGroup permission on all channels
            return setChannelGroupbyUid(channelGroupId, team.mainChannelId, member.uuid)
                .then(() => {
                    return newTeam;
                })
                .catch(err => {
                    throw failedApiReply(err, 'addUserToTeam: Failed updating the database');
                })

        })
            .catch(err => {
                throw failedApiReply(err, 'addUserToTeam: Failed updating the database');
            })

        //If User is already in the Team Remove and Add
    } else {

        newTeamMembers = team.members.filter(teamMember => !_.isEqual(teamMember.memberId, member._id));
        teamMemberArray[0].permissions = permission;
        newTeamMembers.push(teamMemberArray[0]);

        return Teams.findByIdAndUpdate(team._id,
            {
                $set: {
                    members: newTeamMembers
                }
            }, {new: true})
            .then(newTeam => {
                //If team has a servergroup, then add the user to it
                if (team.serverGroupId != null) {
                    setClientServerGroupByUid(member.uuid, team.serverGroupId)
                        .catch(err => {
                            throw failedApiReply(err, 'addUserToTeam: setClientServerGroupByUid failed');
                        })
                }


                //reset channelGroup permission on all channels
                return setChannelGroupbyUid(channelGroupId, team.mainChannelId, member.uuid)
                    .then(() => {
                        return newTeam;
                    })
                    .catch(err => {
                        throw failedApiReply(err, 'addUserToTeam: Failed updating the database');
                    })

            })
            .catch(err => {
                throw failedApiReply(err, 'addUserToTeam: Failed updating the database');
            })


    }

    // adding the user to the team members array

}


/**
 * Removes user from the team. (inc: ServerGroup, ChannelAdmin, DB...)
 * @param {String} teamObjectID - Team objectID of the Database
 * @param {String} memberObjectID - Member objectID of the Database
 */
const removeUserFromTeam = (team, member) => {


    //set guest channelGroup permission on all channels
    return setChannelGroupbyUid(config.groupSettings.guestChannelGroup, team.mainChannelId, member.uuid)
        .then(info => {

            //fetch teams database and remove user
            return Teams.findByIdAndUpdate(team._id,
                {
                    $pull: {
                        members: {
                            memberId: member._id,
                        }
                    }
                }, {new: true})
                .then(team => {

                    return ApiReply('removeUserFromTeam: User Removed', team)
                })
                .catch(err => {
                    throw failedApiReply(err, 'removeUserFromTeam: Failed updating the db records');
                })
        })
        .then(reply => {
            //Remove ServerGroup if exist
            if (!_.isNull(team.serverGroupId)) {
                removeClientServerGroupByUid(member.uuid, team.serverGroupId)
                    .catch(err => {
                        throw failedApiReply(err, 'removeUserFromTeam: Failed clearing ChannelGroup.');
                    })
            }

            return reply;
        })
        .catch(err => {
            throw failedApiReply(err, 'removeUserFromTeam: Failed setChannelGroup.');
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
                                                return ApiReply('Channel Group Assigned', {cgid: channelGroupId})
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
                                    if (err.id == 1281) {
                                        return ApiReply('No Members in the group', {cgid: channelGroupId})
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
const moveChannel = (oldTeam, newTeamObjectID) => {

    let dt = new Date();

    //Getting New Team data from the Database 
    return Teams.findById(newTeamObjectID)
        .then((newTeam) => {

            if (_.isEqual(newTeam.status, 'free')) {

                //TODO Got to add the new Variables in the DB to copy over those things as well.

                //Update New Team Database with location info of old team
                Teams.findByIdAndUpdate(
                    newTeamObjectID,
                    {
                        $set: {
                            channelOrder: oldTeam.channelOrder,
                            spacerNumber: oldTeam.spacerNumber,
                            mainChannelId: oldTeam.mainChannelId,
                            spacerEmptyId: oldTeam.spacerEmptyId,
                            spacerBarId: oldTeam.spacerBarId,
                            areaId: oldTeam.areaId,
                            status: 'clean'
                        }
                    })
                    .catch(err => {
                        throw failedApiReply(err, 'addUserToTeam: Failed fetching database members.');
                    })


                //Update Old Team Database with location info of New team
                return Teams.findByIdAndUpdate(
                    oldTeam._id,
                    {
                        $set: {
                            channelOrder: newTeam.channelOrder,
                            spacerNumber: newTeam.spacerNumber,
                            mainChannelId: newTeam.mainChannelId,
                            spacerEmptyId: newTeam.spacerEmptyId,
                            spacerBarId: newTeam.spacerBarId,
                            areaId: newTeam.areaId,
                            nextMove: new Date(dt.getTime() + 720 * 60000) //720 Minutes
                        }
                    }, {new: true})
                    .then(team => {

                        //Claim Channels on TeamSpeak
                        return claimChannels(team.teamName, '', team.ownerID, team._id, true)
                            .then(() => {

                                //Free Up Old Channel
                                return freeUpChanels()
                                    .then(() => {

                                        //Giving Channel Permission to Users
                                        return reassignChannelGroups(team._id)
                                            .then(info => {
                                                //Return Success!
                                                return ApiReply('Channel Group Assigned', team)
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

            } else {
                throw failedApiReply('err', 'moveChannel: Team Selected is not free.');
            }
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
const changeTeamName = (team, name) => {

    let dt = new Date();

    //Get Area ID to add the First Letter to the Name
    return gameArea.findById(team.areaId)
        .then((area) => {

            if (!area) {
                throw failedApiReply('Area Not Found', 'changeTeamName: No area Found!');
            }

            //making the name
            let processedName = '[cspacer' + team.spacerNumber + ']' + area.areaName[0] + team.channelOrder + ' - ★ ' + name + ' ★';

            //Edit the claimed channel
            return ts3core.edit(true, team.mainChannelId, processedName, '', 'topic', 'description')
                .then(() => {
                    if (team.serverGroupId !== null) {
                        return ts3.serverGroupRename(team.serverGroupId, name)
                            .then(() => {

                                Teams.findByIdAndUpdate(team._id,
                                    {
                                        $set: {
                                            teamName: name,
                                            nextNameChange: new Date(dt.getTime() + 1 * 60000) //720 Minutes
                                        }
                                    }, {new: true})
                                    .then(team => {
                                        return ApiReply('Name Changed Sucessfully', team)
                                    }).catch(err => {
                                    throw failedApiReply(err, 'changeTeamName: Failed to Saved to the DB');
                                })

                            })
                            .catch(err => {
                                throw failedApiReply(err, 'changeTeamName: Error Changing ServerGroup Name');
                            })
                    }
                    return ApiReply('Name Changed Sucessfully', team)
                })
        }).catch(err => {
            throw failedApiReply(err, 'changeTeamName: Error Changing Name');
        })
}


/**
 * Creates a ServerGroup for the team.
 * @param {String} uuid - TeamSpeak Unique ID
 */
const createServerGroup = (team) => {

    //loop
    //Make a Copy of the template ServerGroup
    return ts3.serverGroupCopy(config.groupSettings.serverGroupTemplate, 0, 1, team.teamName)
        .then(group => {


            //Works Like a ForEach Loop but it's async
            let addMembersToGroupArray = team.members.map(teamMember => {


                //get cldbid of the user
                return ts3core.getCldbidFromUid(teamMember.memberUuid)
                    .then(cldbid => {

                        //Add ServerGroup to Client
                        return ts3.serverGroupAddClient(cldbid, group.sgid)
                            .then(() => {


                                return Teams.findByIdAndUpdate(team._id,
                                    {
                                        $set: {
                                            serverGroupId: group.sgid,
                                        }
                                    })
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

            });

            return Promise.all(addMembersToGroupArray)
                .then(array => {
                    return array;
                })
                .catch(err => {
                    throw failedApiReply(err, 'channelRemoveChannelGroupClients: Error Setting ChannelGroup.');
                })


        })
        .catch(err => {
            throw failedApiReply(err, 'createServerGroup: Error Copying Group');
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

                    //Works Like a ForEach Loop but it's async
                    let promiseArr = teams.map(team => {
                        // return the promise to array

                        return team.mainChannelId;
                    });

                    //Resolves and Checks if there was any problem with executiong returns results.
                    return Promise.all(promiseArr)
                        .then(mainChannelsIDs => {
                            return mainChannelsIDs;
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
                                    {mainChannelId: channel._propcache.pid},
                                    {
                                        $set: {
                                            lastUsed: Date.now(),
                                        }
                                    })
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
 * @param {Number} areaId
 * @param {boolean} move
 */
const createTeam = (name, password, memberObjectID, areaId, move) => {

    //Get top free Channel
    return getTopFreeChannel(areaId)
        .then(team => {

            //Get Members Database
            return Members.findById(memberObjectID)
                .then(member => {
                    //If there is a Free Team then Claim it
                    if (team != null) {
                        //Claim Channel
                        return claimChannels(name, password, member.uuid, team._id, move)
                            .then(() => {
                                //Add user to the Channel and Give Permissions
                                return addUserToTeam(team, member, 1)
                                    .then(updatedTeam => {
                                        return ApiReply('createChannels: Channels Sucessfully Claimed', updatedTeam)

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
                        return createChannels(name, password, member.uuid, areaId, move)
                            .then((newteam) => {
                                //Add user to the Channel and Give Permissions
                                return addUserToTeam(newteam.data, member, 1)
                                    .then(updatedTeam => {
                                        return ApiReply('createChannels: Channels Sucessfully Created', updatedTeam)


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
 * @param {Number} areaId
 */
const getTopFreeChannel = (areaId) => {

    return Teams.findOne({status: 'free', areaId: areaId})
        .sort('+channelOrder')
        .then((team) => {
            return (team);
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
const claimChannels = (name, password, ownerUuid, teamObjectID, move) => {


    return Teams.findById(teamObjectID).then((team) => {

        gameArea.findById(team.areaId)
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
                            {
                                $set: {
                                    teamName: name,
                                    status: 'OK',
                                    ownerID: ownerUuid,
                                }
                            })

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
 * @param {Number} areaId - Id of the Area where the channel is going to be created.
 * @param {boolean} move - Move the Client to the channel
 */
const createChannels = (name, password, ownerUuid, areaId, move) => {


    /**
     * Temporary
     */

    let topic = '';
    let description = '';


    //TODO Add the Topic and Description Generator

    //Fetch Game Area data
    return gameArea.findById(areaId)
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
                    return gameArea.findByIdAndUpdate(areaId,
                        {
                            $inc: {nextChannelNumber: 1, nextSpacerNumber: 1},
                            $set: {lastChannelId: channelIds.spacerBarId}
                        })

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
                                areaId: area._id,
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
    return ts3core.create(false, name, '', topic, description, '', lastCid)
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

                let timeDiference = new Date() - team.lastUsed;


                if ((team.status == 'clean') || ((team.status == 'OK') && timeDiference > 14400 * 60000)) {
                    //    if ((team.status == 'clean')) {
                    //Get the First Letter of the Area Name
                    return gameArea.findById(team.areaId)
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
                                {
                                    $set: {
                                        serverGroupId: null,
                                        status: 'free',
                                        ownerID: null,
                                        members: []
                                    }

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
                .catch(err => {
                    throw failedApiReply(err, 'setClientServerGroupByUid: Failed to get cldbid');
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
    setChannelGroupbyUid,
    getUsersByIp,
    sendTokenRequest,
    isMemberOnTheServer,
    serverView,
    channelView,
    generateUserDescription,
    generateTeamDescription,
    serverInfo,
    createGroup,
    addUserToGroup,
    removeUserToGroup,
    ts3
};


ts3.on("ready", () => {

})