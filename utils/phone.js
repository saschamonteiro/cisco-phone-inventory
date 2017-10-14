'use strict'

var http = require("http");
http.globalAgent.maxSockets = 128;
var parseString = require('xml2js').parseString;
var fs = require('fs');
var authentication = process.env.UCM_USER+':'+process.env.UCM_PASS;

function getPhoneSerial(phone) {
  return new Promise((resolve, reject) => {
    // console.log('getting phone details '+phone.ipAddress);
    var xml = '';
    http.get({
      host: phone.ipAddress,
      port: 80,
      path: '/DeviceInformationX',
    }, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(d) {
        xml += d;
      });
      res.on('end', function(){
        // console.log('phone details', xml);
        parseString(xml, function (err, result) {
          var r = result["DeviceInformation"];
          // console.log(r);
          phone.serial = r["serialNumber"][0];
          phone.model = r["modelNumber"][0];
          resolve(phone);
        });

      });
      res.on('error', function(err){
        resolve(phone);
      });
    }).on('error', function(err){
      // console.error(err);
      resolve(phone);
    }).on('socket', function(socket){
      socket.setTimeout(5000);
    });

  });
}

function getPhoneImage(phone){
  var dir = './images';

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  return new Promise((resolve, reject) => {
    // console.log('getting phone image for ' + phone.ipAddress);
    var file = fs.createWriteStream("./images/"+phone.name+".png");
    http.get("http://"+ authentication +"@"+ phone.ipAddress +"/CGI/Screenshot", function(response) {
      response.pipe(file);
      // console.log(new Date()+' saved '+phone.name+'.png');
      resolve();
    }).on('error', function(err){
      console.error(err);
      resolve();
    });
  });
}
module.exports = {
  getPhoneSerial,
  getPhoneImage
};
