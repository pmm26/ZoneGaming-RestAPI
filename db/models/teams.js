const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var teamsSchema = new mongoose.Schema({
    
    //Team Name
    teamName: { 
        type: String,
        // require: true,
        unique: true,
        minLenght: 6,
        trim: true, //removes white space behind and in front
    },

    //Area of the Game 
    areaId: {
        type: Schema.Types.ObjectId,
        ref: 'gameArea',
        required: true
    },

    //Order of the Channel
    channelOrder: {
        type: Number,
        // require: true,
        minLenght: 1
    },


    //Area of the Game 
    ownerID: {
        type: String,
        // require: true,
        minLenght: 1
    },

    members: [
        {   
            memberId: {
                type: Schema.Types.ObjectId,
                ref: 'Members',
            },

            memberUuid: {
                type: String,
                // require: true,
                minLenght: 6
            },

            permissions: {
                type: Number,
                // require: true,
                minLenght: 6
                //add min and max value
            },

        }
    
    ],
   

    //Number of the Spacer to make multiple spacer of the same name.
    spacerNumber: {
        type: Number,
        // require: true,
        minLenght: 1
    },

    //Id of the Main Channel
    mainChannelId: {
        type: Number,
        // require: true,
        minLenght: 1
    },

    //Id of the empty Spacer 
    spacerEmptyId: {
        type: Number,
        // require: true,
        minLenght: 1
    },

    //If othe Spacer Bar
    spacerBarId: {
        type: Number,
        // require: true,
    minLenght: 1
    },

    //Id of the Server Group of the Team
    serverGroupId: {
        type: Number,
        default: null,
        // require: true,
        minLenght: 1
    },

    //Free or In use?
    status: {
        type: String,
        // require: true,
        minLenght: 1,
        default: 'OK'
    },

    //When can the channel Move 
    nextMove: {
        type: Date,
        // require: true,
        default: Date.now
    },

    //When was the channel last used.
    lastUsed: {
        type: Date,
        // require: true,
        default: Date.now
    },
    
    
}, { timestamps: true });


//Create Model
module.exports = mongoose.model('Teams', teamsSchema);
