const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('./database/mongoose');


//Database
const Log = require('./database/models/log')

//Routes
const teamRoutes = require('./modules/teams/route');
const authRoutes = require('./modules/auth/route');
const groupsRoutes = require('./modules/groups/route');
const teamSpeakRoutes = require('./modules/teamSpeak/route');


//Start Express
const app = express();


//Image File Store
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Express
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

//Image Save File Path
app.use('/images', express.static(path.join(__dirname, 'images')));

//Setting Headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth');
  next();
});

//Start Routes
app.use('/team', teamRoutes);
app.use('/auth', authRoutes);
app.use('/teamspeak', teamSpeakRoutes);
app.use('/groups', groupsRoutes);

//Error handling
app.use((error, req, res, next) => {

  //Logging
    // let log = new Log(error);

    // log.save().then((log) => {
    // console.log('Log Saved to the Database Saved')
    // })
    console.log(error);

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    data: error.error
  });
});

//Start Mongoose

mongoose.connectDB()
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));
