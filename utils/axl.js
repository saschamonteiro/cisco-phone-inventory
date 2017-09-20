'use strict'

var https = require("https");
var parseString = require('xml2js').parseString;
var AxlHelper = require('./axlhelper');

class AXL {
  constructor(ucmVersion, ucmHost, authentication) {
    this.ucmVersion = ucmVersion;
    this.ucmHost = ucmHost;
    this.authentication = authentication;
    this.devices = [];
    this.headers = {
      'SoapAction': 'CUCM:DB ver=' + ucmVersion,
      'Authorization': 'Basic ' + new Buffer(authentication).toString('base64'),
      'Content-Type': 'text/xml; charset=utf-8'
    }
    this.offSet = 0;
    this.stepSize = 5000;
    this.options = {
      host: ucmHost,        // The IP Address of the Communications Manager Server
      port: 443,                  // Clearly port 443 for SSL -- I think it's the default so could be removed
      path: '/axl/',              // This is the URL for accessing axl on the server
      method: 'POST',             // AXL Requires POST messages
      headers: this.headers,           // using the headers we specified earlier
      rejectUnauthorized: false   // required to accept self-signed certificate
    };
    this.options.agent = new https.Agent(this.options);
  }


  getDevices(s, f, ucmVersion, options) {
    return new Promise((resolve, reject) => {
      let xml = '';
      var soapBody = AxlHelper.getAxlSoapContent(s, f, ucmVersion);
      var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (d) {
          xml += d;
        });
        res.on('end', function () {
          parseString(xml, function (err, result) {
            if (err) {
              console.log('Error', err);
              reject(err);
            } else {
              let devices = AxlHelper.getPhonesFromResponse(result);
              resolve(devices);
            }
          });
        });
      });
      req.write(soapBody);
      req.end();
      req.on('socket', function (socket) {
        socket.setTimeout(5000);
        socket.on('timeout', function() {
          reject('timeout connecting to ucm axl');
        });
      });

      req.on('error', function (e) {
        console.error('axlerror', e);
        reject(e);
      });
    });


  }

  async getAllDevices() {
    for (let count of Array(10).keys()) {
      let d = await this.getDevices(count * this.stepSize, this.stepSize, this.ucmVersion, this.options);
      if (d !== undefined) {
        this.devices = this.devices.concat(d);
      }
      if (d.length < this.stepSize) {
        break;
      }
    }
    return this.devices;
  }

  getPhones() {
    return new Promise((resolve, reject) => {
      const d = this.getAllDevices();
      d.then(function (data) {
        resolve(data);
      });
      d.catch(function(err){
        reject(err);
      });
    })
  }


}

module.exports = AXL;
