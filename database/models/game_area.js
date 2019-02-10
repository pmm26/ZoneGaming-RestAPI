const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash')

var gameAreaSchema = new mongoose.Schema({
    
    areaName: {
        type: String,
        // require: true,
        minLenght: 1
    },

    nextChannelNumber: {
        type: Number,
        // require: true,
        minLenght: 1
    },	

    nextSpacerNumber: {
        type: Number,
        // require: true,
        minLenght: 1
    },

    lastChannelId: {
        type: Number,
        // require: true,
        minLenght: 1
    }, 	
});


//Create Model
module.exports = mongoose.model('gameArea', gameAreaSchema);
