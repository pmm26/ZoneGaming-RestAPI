const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const Schema = mongoose.Schema;
const uniqueArrayPlugin = require('mongoose-unique-array');

var groupsSchema = new mongoose.Schema({
    
    serverGroupId: {
        type: Number,
        // require: true,
        minLenght: 1
    },	

    serverGroupName: {
        type: String,
        // require: true,
        minLenght: 1
    },

    serverGroupIcon: {
        type: String,
        // require: true,
        minLenght: 1
    },

    //1 Template / other numbers could be user for other types
    groupType: {
        type: Number,   
        // require: true,
        minLenght: 1
    },

    members: [
        {   
            memberId: {
                type: Schema.Types.ObjectId,
                ref: 'Members',
                unique: true,
            },

            memberUuid: {
                type: String,
                // require: true,
                minLenght: 6,
                unique: true,
            },
        }
    
    ],

});

// membersSchema.statics.findByCredentials = function (email, password) {
//     var User = this;
  
//     return User.findOne({email}).then((user) => {
//       if (!user) {
//         return Promise.reject();
//       }
  
//       return new Promise((resolve, reject) => {
//         // Use bcrypt.compare to compare password and user.password
//         bcrypt.compare(password, user.password, (err, res) => {
//           if (res) {
//             resolve(user);
//           } else {
//             reject();
//           }
//         });
//       });
//     });
//   };

//Create Model
groupsSchema.plugin(uniqueArrayPlugin);
module.exports = mongoose.model('groups', groupsSchema);



