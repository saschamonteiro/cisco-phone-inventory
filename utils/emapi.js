'use strict'

var https = require("https");
var parseString = require('xml2js').parseString;
var ucm = ucm || {};
ucm.inventory = ucm.inventory || {};
ucm.inventory.cisco = ucm.inventory.cisco || {};
ucm.inventory.cisco.ucm = ucm.inventory.cisco.ucm || {};
ucm.inventory.cisco.ucm.EMAPI = {
  doRequest(emapiRequest){
    emapiRequest = 'xml='+encodeURIComponent(emapiRequest);

    return new Promise((resolve, reject) => {
      var emapi = {
        options: {
          host: process.env.UCM_HOST,
          port: 8443,
          path: '/emservice/EMServiceServlet',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          rejectUnauthorized: false
        }
      };
      // console.log('sending '+emapiRequest);
      var xml = '';
      var req = https.request(emapi.options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (d) {
          xml += d;
        });
        res.on('end', function () {
          parseString(xml, function (err, result) {
            if (err) {
              reject('Error ' + err);
            } else {
              console.log('found:', JSON.stringify(result));
              resolve(result);
            }
          });
        });
      });
      req.write(emapiRequest);
      req.end();
      req.on('socket', function (socket) {
        socket.setTimeout(5000);
        socket.on('timeout', function () {
          reject('timeout connecting to ucm risport')
        });
      });

      req.on('error', function (e) {
        console.error(e);
        reject(e);
      });
    });
  }
}
module.exports = ucm.inventory.cisco.ucm.EMAPI;
