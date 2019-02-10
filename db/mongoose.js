var mongoose = require('mongoose');


const uri = 'mongodb://localhost:27017/dgchannel';  // mongodb://localhost - will fail


mongoose.Promise = global.Promise; //Set up Mongoose to use promisses.
mongoose.connect(uri,{ useNewUrlParser: true });

module.exports = {
    mongoose
};