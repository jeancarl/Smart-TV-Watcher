// Filename: app.js

var PORT = 3000;
var MONGODB_ADDRESS = 'mongodb://127.0.0.1:27017/test';

var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.json());

mongoose.connect(MONGODB_ADDRESS);

var DeviceModel = mongoose.model('Device', {
  deviceId: String,
  deviceName: String,
  timeLeft: Number,  
});

// Creates a device profile if one doesn't exist, and returns the rewarded time.
app.post('/api/gettime', function(req, res) {
  DeviceModel.findOne({deviceId: req.body.id}, function(err, device) {
    if(err || !device) {
      DeviceModel.create({
        deviceId: req.body.id,
        deviceName: req.body.displayname,
        timeLeft: 0
      }, function(err, device) {
        if(err) {
          console.log(err);
          return;
        }
        
        res.send({timeLeft: device.timeLeft});
      });
    } else {
      res.send({timeLeft: device.timeLeft});  
    }
  });
});

// Returns the time that has been rewarded to this device.
app.get('/api/gettime/:deviceId', function(req, res) {
  DeviceModel.findOne({deviceId: req.params.deviceId}, function(err, device) {
    if(err || !device) {
      console.log(err);
      return;
    } else {
      res.send({timeLeft: device.timeLeft});  
    }
  });
});

// Resets the time that has been rewarded to this device.
app.post('/api/resettime/:deviceId', function(req, res) {
  DeviceModel.findOne({deviceId: req.params.deviceId}, function(err, device) {
    DeviceModel.update({deviceId: req.params.deviceId}, {
      timeLeft: 0
    }, function(err, numAffected) {
      res.send({timeLeft: device.timeLeft});
    });
  });
});

// Adds rewarded time to this device.
app.post('/api/addtime/:deviceId/:seconds', function(req, res) {
  DeviceModel.findOne({deviceId: req.params.deviceId}, function(err, device) {
    if(err || !device) {
      res.send({error: 'Device not registered.'});
    } else {
      device.timeLeft = device.timeLeft + parseInt(req.params.seconds);

      DeviceModel.update({deviceId: device.deviceId}, {timeLeft:device.timeLeft}, function(err, numAffected) {
        if(err) {
          console.log(err);
        }
      });

      res.send({timeLeft: device.timeLeft});  
    }
  });
});

app.listen(PORT);
console.log('Application listing on port '+PORT);

app.use(express.static(__dirname + '/public'));