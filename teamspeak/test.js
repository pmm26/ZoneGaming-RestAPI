const app = require("./index"); //Main


//Core
const ts3core = require("./ts3Connect"); //Create and Claim 
const {ts3} = require("./ts3Connect");  //Dafault Library
var config = require('./config'); //Objext that contains all the default properties to create a channel
let _ = require('lodash');



//Database
var {mongoose} = require('../db/mongoose');
var {gameArea} = require('../models/game_area');
var {Teams} = require('../models/teams');



//let ownerUuid = 'slOGgvdBuVrdr5EAPVdtdpiO2I8=';
let ownerUuid = '0z3KOFg5TVbq0VesMmkGz54rrGk=';

ts3.on("ready", () => {

    const failedApiReply = (err, msg) => {

        if (!(err.status == 'FAIL')) {
    
            failedApi = {
                code: 500,
                status: 'FAIL',
                msg: msg,
                err: err
            }
            return failedApi;
        }
    }

/*
    ts3.getChannelGroupByID(5).then(cannel => {
        console.log(cannel)

        //Get the List of clients that are part of that ChannelGroup


        return cannel.clientList(520)
        .then(clients => { 
            console.log(clients)
        }).catch(err => {
            console.log('Error getting client list'); 
        })
    }).catch(err => {
        console.log('1'); 
    })


    ts3.clientInfo(1)
    .then(info => {

        //console.log(info)



        ts3.clientInfo(1)
        .then(info => {
            //console.log(info)
            Swag = {msg: 'Error Main'}
            throw Swag;
 
        })
        .catch(e => {
            
            api = failedApiReply(e, 'Failed MF')
            throw api;
         })

    })
    .catch(e => {
        console.log('executed2')
        console.log(e)
    })
   
    
*/



/*
    ts3.clientInfo(1)
    .then(info => {

        //console.log(info)



        return ts3.clientInfo(1)
        .then(info => {
            //console.log(info)
            
            throw failedApiReply('Fail', 'fail');
 
        }).catch(e => {
            console.log(e)
            throw e;
        })

        
    }).catch(e => {
        console.log(e)
    })
*/

    // app.setChannelGroupbyUid(50, 491, ownerUuid)
    // .then(api => {
    //     console.log(api);
    // })
    // .catch(api => {
    //     console.log(api);
    // })

    //app.addUserToTeam('5bcc8d0f732f3c14ece73b4d', '5bcd18143455c75fb3a112ad', 2)

    //app.removeUserFromTeam('5bcc8d0f732f3c14ece73b4d', '5bcd18143455c75fb3a112ad')

    //app.registerClient('Hard', ownerUuid)

    // app.reassignChannelGroups('5bcc8d0f732f3c14ece73b4d')
    

    app.channelRemoveChannelGroupClients(519)

    //app.moveChannel('5bcc8d0f732f3c14ece73b4d', '5bcc8d0b3c1af814d72dc716')


    //app.changeTeamName('5bcc8d0b3c1af814d72dc716', 'Scrub')

    //    app.createServerGroup(ownerUuid)


    //app.crawlerChannels()

    //app.claimChannels(ownerUuid, 'name')

   // app.createTeam('name', 'password', '5bcd16547e63455f2b1afdaf', 1, true)
    // .then(api => {
    //     console.log(api);
    // })
    // .catch(api => {
    //     console.log(api);
    // })

    //app.addUserToTeam('5bd1c3787b14440d6d55cd08', '5bcd16547e63455f2b1afdaf', 1)

    //app.getTopFreeChannel(1).then(console.log())

    app.freeUpChanels()



    //app.createTeam('ZoneG', 'password', ownerUuid, 2, true)
    //app.createTeam('name', 'password', ownerUuid, 2, false)


    //ts3.getClientByUID(ownerUuid)
    //.then(client => {
    //    console.log(client);
    //});

    //app.delClientServerGroupUid(ownerUuid, 6)

    //app.moveToFirstChannel(116, ownerUuid)

    //app.setClientChannelGroupUid(5, 547, ownerUuid)

    .then(api => {
        console.log(api);
    })
    .catch(api => {
        console.log(api);
    })
    //ts3core.getClidFromUid(ownerUuid)
    //ts3.setClientChannelGroup(5, 126, 4);

    //app.createChannels("name", "password", ownerUuid, 1, true)

  

    //app.createGroupOfChannels("Zg1", "password", "topic", "description", 101, 2)
   


    //Storing in the database details about the Channel and the Teamspeak Channel ids.

//    app.setSubChannelsPublic(547)

    // app.setSubChannelsPrivate(547)

 

   
    /* Test SubChannelList

    ts3core.subChannelList(3).then(channels => {
       console.log(channels);
    })

    */


    /* Test Channel Create

    ts3core.create(true, "name", "password", "topic", "description", 2, "")
    */


    /* Test Channel Edit
    
    ts3core.edit(false, 3, "Default", "password", "topic", "description")
    */

    //Add Game Areas
    /*
     
     let team = new gameArea({
        areaId: 2,
        areaName: 'Default',
        nextChannelNumber: 3,
        lastChannelId: 20000,
           
    });
    
    BUGs : Kd a erro a criar a sala ele escreve na DB na mesma.
    team.save()
    */

})
