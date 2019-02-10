const mongoose = require('mongoose');

const dbconfig = require('../config/dbconfig') 


const uri = dbconfig.mongoDBServerURL;  // mongodb://localhost - will fail


const connectDB = () => {

    mongoose.Promise = global.Promise; //Set up Mongoose to use promisses.
    return mongoose.connect(uri, { useNewUrlParser: true })
        .then((res) => {
            console.log('Database Connected!')
            //Add Logging
        })
        .catch(err => {
            console.log(err)
            //Add Logging
        })
}

module.exports = {
    connectDB
};