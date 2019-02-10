const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash')

var teamsSchema = new mongoose.Schema({
    
    //Team Name
    teamName: { 
        type: String,
        // require: true,
        minLenght: 6,
        trim: true, //removes white space behind and in front
    },

    //Area of the Game 
    gameArea: {
        type: Number,
        // require: true,
        minLenght: 1
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
                type: String,
                // require: true,
                minLenght: 6
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

    //Date of the Creation of the Channel
    creationDate: {
        type: Date,
        // require: true,
        default: Date.now
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
    
});


//Create Model
var Teams = mongoose.model('Teams', teamsSchema);


module.exports = {
    Teams
};




// //Create Entry
// var newUser = new User({
//     email: 'pmm34@kent.ac.uk  ',
// });


// //Save Data on Database
// newUser.save().then((doc) => {

//     console.log('Saved:', doc);
    
// }, (e) => {
//     console.log('Unable to save', e)
// });
