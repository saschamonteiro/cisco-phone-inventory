'use strict'

var http = require("http");
var parseString = require('xml2js').parseString;

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
        reject(err);
      });
    }).on('error', function(err){
      // console.log(err);
      resolve(phone);
    });

  });
}

module.exports = getPhoneSerial;
