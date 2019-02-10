var mongoose = require('mongoose');


const uri = 'mongodb://localhost:27017/dgchannel';  // mongodb://localhost - will fail




const connectDB = () => {

    mongoose.Promise = global.Promise; //Set up Mongoose to use promisses.
    return mongoose.connect(uri, { useNewUrlParser: true })
        .then((res) => {
            console.log('Database Connected!')
            
        })
        .catch(err => {
            console.log(err)
        })
}

module.exports = {
    connectDB
};