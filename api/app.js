const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('../db/mongoose');
const multer = require('multer');


//Database
const Log = require('../db/models/log')

//Routes
const teamRoutes = require('./routes/team');
const authRoutes = require('./routes/auth');
const groupsRoutes = require('./routes/groups');
const teamSpeakRoutes = require('./routes/teamSpeak');


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
    let log = new Log(error);
        
    log.save().then((log) => {
    console.log('Log Saved to the Database Saved')
    })
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
