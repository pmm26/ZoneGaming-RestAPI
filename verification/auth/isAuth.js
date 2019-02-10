var Members = require('../../database/models/members');

var isAuth = (req, res, next) => {
  var token = req.header('x-auth');

  Members.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }


    req.input = {
      authMemberId: user._id
    };


    next();
  }).catch((e) => {
    res.status(401).json({message: 'Please Login First'});
  });
};

module.exports = {isAuth};