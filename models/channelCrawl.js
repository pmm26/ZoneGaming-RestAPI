const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash')

var channelSchema = new mongoose.Schema({
    


    //When can the channel Move 
    timespamp: {
        type: Date,
        // require: true,
        default: Date.now
    },

});


//Create Model
var channelCrawl = mongoose.model('channelCrawl', channelSchema);


module.exports = {
    channelCrawl
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
