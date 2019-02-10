

const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

var membersSchema = new mongoose.Schema({

  //Team Name
      admin: {
        type: Number,
     },
        //Team Name
        name: {
            type: String,
            require: true,
            minLenght: 6,
        },
    
        status: {
            type: String,
            default: 'OK'
        },
    
        nickname: {
            type: String,
            require: true,
            minLenght: 6,
            trim: true, //removes white space behind and in front
        },
    
        ip: {
            type: String,
            // require: true,
        },
        
        uuid: {
            type: String,
            // require: true,
            minLenght: 6,
            trim: true, //removes white space behind and in front
        },
    
        createChannelTimer: {
            type: Date,
            default: Date.now
        },
    
        teams: [ {
            teamId: { 
                type : Schema.Types.ObjectId, 
                ref: 'teams',
            },
    
            specialTeam: { 
                type : Boolean,    
            }
        } ],


        linkTokens: [{

        
          token: {
            type: String,
            required: true
          },
  
          uuid: {
            type: String,
            required: true
          },
  
          expiryDate: {
            type: Date,
            default: Date.now
          }
  
        }],
        

        // AUTH PART
    
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
          validator: validator.isEmail,
          message: '{VALUE} is not a valid email'
        }
      },

      password: {
        type: String,
        require: true,
        minlength: 6
      },

      tokens: [{
        access: {
          type: String,
          required: true
        },
        
        token: {
          type: String,
          required: true
        }
      }]
      
});


membersSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'status', 'name', 'nickname', 'email', 'teams', 'uuid', 'ip', 'createChannelTimer' ]);
};

membersSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens.push({access, token});

  return user.save().then(() => {
    return token;
  })
};

membersSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

membersSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    console.log(e)
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

membersSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

membersSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});


//Create Model
module.exports = mongoose.model('Members', membersSchema);
