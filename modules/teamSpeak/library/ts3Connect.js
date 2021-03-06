//Import Libraries
const TeamSpeak3 = require("ts3-nodejs-library")
const _ = require('lodash');

//Configs
const channel = require('../../../config/channels'); //Objext that contains all the default properties to create a channel
const {ts3connect} = require('../../../config/ts3connect')


//Creates a new Connection to a TeamSpeak Server
const ts3 = new TeamSpeak3(ts3connect)



/**
 * Create channel
 *
 * @public          boolean     Choose between public of private channel
 * @name:           String      Client DB ID
 * @password        String      Channel Password
 * @topic           String      Channel Topic
 * @description     String      Channel Description
 * @subChannel      int         Sub Channel ID (Not Required)
 * @channelOrder    int         Order of the Channel (Not Required)
 */
const create = (public, name, password, topic, description, subChannel, channelOrder) => {


    subChannel = parseInt(subChannel);
    channelOrder = parseInt(channelOrder);

    if ((_.isString(name)) & (_.isBoolean(public))) {

        //Set the channel Plublic or Private

        let properties = { ...channel.public };

        if (!public) {
            properties = { ...channel.private }
         }



        //Add the data into the object
        if (!_.isEmpty(password)) {
            properties.channel_password = password
        }

        if (!_.isEmpty(description)) {
            properties.channel_description = description
        }

        if (!_.isEmpty(topic)) {
            properties.channel_topic = topic
        }

        if (_.isInteger(subChannel)) {
            properties.cpid = subChannel
        }

        if (_.isInteger(channelOrder)) {
            properties.channel_order = channelOrder
        }

        return ts3.channelCreate(name, properties);
    }
}


/**
 * Edit channel
 *
 * @public          boolean     Choose between public of private channel
 * @cid             int         Source Server Group ID
 * @name            String      Client DB ID
 * @password        String      Channel Password
 * @topic           String      Channel Topic
 * @description:    String      Channel Description
 */
const edit = (public, cid, name, password, topic, description) => {

    cid = parseInt(cid);

    if ((_.isBoolean(public)) & (_.isInteger(cid))) {

        //Set the channel Plublic or Private

        let properties = { ...channel.public };

        if (!public) {
            properties = { ...channel.private }
         }



        //Add the data into the object
        if (!_.isEmpty(name)) {
            properties.channel_name = name
        }

        if (!_.isEmpty(password)) {
            properties.channel_password = password
        }

        if (!_.isEmpty(description)) {
            properties.channel_description = description
        }

        if (!_.isEmpty(topic)) {
            properties.channel_topic = topic
        }

        //console.log(properties);
        return ts3.channelEdit(cid, properties)
                .catch(err => {

                    if (parseInt(err.id) == 771) {
                        delete properties.channel_name;

                        return ts3.channelEdit(cid, properties)
                        .catch(err => {
                            console.log(err)
                        })
                    } else {
                        console.log(err)
                    }
                 })
    }
};


const changeUserDescription = (uuid, description) => {



    if ((_.isString(uuid)) && (_.isString(description))) {



        return ts3.getClientByUID(uuid)
        .then(client => {

            let params = {
                clid: client.getID(),
                client_description: description
            };


            return ts3.execute("clientedit", params)
            .then(data => {
                return true;
            })
            .catch(err => {
                throw failedApiReply('changeUserDescription: Error changin user description', err)
            })

        })
        .catch(err => {
            throw failedApiReply('changeUserDescription: Error fetching client', err)
        })



    } else {
        throw failedApiReply('changeUserDescription: Invalid Input', 500)
    }
};

/**
 * Get Array of SubChannels
 *
 * @cid:        int    Channel ID
 */
const subChannelList = (cid) => {

    cid = parseInt(cid);

    if ((_.isInteger(cid))) {

        //TODO: maybe add a way to see if the method as successful by returning true
        return ts3.channelList({pid: cid })
            .then(channels => { return channels })
            .catch(err => {
                throw failedApiReply('setChannelGroupbyUid: Error Saving data on the database', err)
            })

    } else {
        throw failedApiReply('subChannelList: Invalid Input', 500)
    }
}

/**
 * Get Clid From cluid
 *
 * @uid:       String    User Unique Identifier
 */
const getClidFromUid = (uid) => {

    if ((_.isString(uid))) {

        let params = {
            cluid: uid
        };

        return ts3.execute("clientgetids", params)
            .then(data => {
                return data.clid;
            })
            .catch(err => {
                throw failedApiReply('getClidFromUid error:', err)
            });

    } else {
        throw failedApiReply('getClidFromUid: Invalid Input', 500)
    }
};


/**
 * Get dbid From cluid
 *
 * @uid:       String    User Unique Identifier
 */
const getCldbidFromUid = (uid) => {


    if ((_.isString(uid))) {

        let params = {
            cluid: uid
        };

        return ts3.execute("clientgetdbidfromuid", params)
            .then(data => {
                return data.cldbid;
            })
            .catch(err => {
                throw failedApiReply(err, 'setChannelGroupbyUid: Error Saving data on the database');
            })

    } else {
        console.log('getCldbidFromUid: Invalid Input');
    }
};



ts3.on("ready", () => {
    console.log('Connection Ready!')
})


//Error event gets fired when an Error during connecting or an Error during Processing of an Event happens
ts3.on("error", e => {
    console.log("Error", e.message)
})

//Close event gets fired when the Connection to the TeamSpeak Server has been closed
//the e variable is not always set
ts3.on("close", e => {
    console.log("Connection has been closed!", e)
})




const failedApiReply = (msg, error) => {

    if (!error.error) {

        failedApi = {
            status: 'FaiL',
            message: msg,
            error: error
        }
        return failedApi;
    }

    return error;
}

const ApiReply = (msg, data) => {

        api = {
            status: 'OK',
            message: msg,
            data: data
        }

        return api;

}



module.exports = {
    changeUserDescription,
    create,
    edit,
    subChannelList,
    getClidFromUid,
    getCldbidFromUid,
    ts3
}
