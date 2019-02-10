const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var logSchema = new mongoose.Schema({

    //Team Name
    status: { 
        type: String,
        // require: true,
        // unique: true,
        trim: true, //removes white space behind and in front
    },
    
    //Team Name
    message: { 
        type: String,
        // require: true,
        // unique: true,
        minLenght: 6,
        trim: true, //removes white space behind and in front
    },


    //Area of the Game 
    params: {
        type: Object,
        // require: true,
        minLenght: 1
    },
    
    
}, { timestamps: true });


//Create Model
module.exports = mongoose.model('Log', logSchema);
