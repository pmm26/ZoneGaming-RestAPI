const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash')

var gameAreaSchema = new mongoose.Schema({
    
    areaId: { //make this an index
        type: Number,
        // require: true,
        minLenght: 1
    },

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
var gameArea = mongoose.model('gameArea', gameAreaSchema);


module.exports = {
    gameArea
};

