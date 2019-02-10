const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash')

var membersSchema = new mongoose.Schema({
    
    //Team Name
    name: { 
        type: String,
        // require: true,
        minLenght: 6,
        trim: true, //removes white space behind and in front
    },

    nickname: { 
        type: String,
        // require: true,
        minLenght: 6,
        trim: true, //removes white space behind and in front
    },

    uuid: { 
        type: String,
        // require: true,
        minLenght: 6,
        trim: true, //removes white space behind and in front
    },

    //Team Name
    email: { 
        type: String,
        // require: true,
        minLenght: 6,
        trim: true, //removes white space behind and in front
    },

    steamid: { 
        type: String,
        // require: true,
        minLenght: 6,
        trim: true, //removes white space behind and in front
    },

    games: [
        {   
            gameId: {
                type: String,
                // require: true,
                minLenght: 6
            },

            gameName: {
                type: String,
                // require: true,
                minLenght: 6
            },
        }
    
    ],

     //Date of the Creation of the Channel
     creationDate: {
        type: Date,
        // require: true,
        default: Date.now
    },

});




//Create Model
var Members = mongoose.model('Members', membersSchema);


module.exports = {
    Members
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
