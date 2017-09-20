'use strict'

var https = require("https");
var parseString = require('xml2js').parseString;
var RisPortHelper = require('./risporthelper');
class RisPort {
  constructor (ucmVersion, ucmHost, authentication){
    this.ucmVersion = ucmVersion;
    this.ucmHost = ucmHost;
    this.authentication = authentication;
    this.devices = [];
    this.headers = {
      'SoapAction':'http://schemas.cisco.com/ast/soap/action/#RisPort70#SelectCmDevice',
      'Authorization': 'Basic ' + new Buffer(authentication).toString('base64'),
      'Content-Type': 'text/xml; charset=utf-8'
    }
    this.offSet = 0;
    this.stepSize = 1000; //for ucm prior to 9.0 the stepSize is 200
    this.options = {
      host: ucmHost,        // The IP Address of the Communications Manager Server
      port: 443,                  // Clearly port 443 for SSL -- I think it's the default so could be removed
      path: '/realtimeservice2/services/RISService70',              // This is the URL for accessing RisPort on the server
      method: 'POST',             // AXL Requires POST messages
      headers: this.headers,           // using the headers we specified earlier
      rejectUnauthorized: false   // required to accept self-signed certificate
    };
    this.options.agent = new https.Agent(this.options);
  }

  getRisPortStatus(phonesList, options){
    return new Promise((resolve, reject) => {
      var sAXLRequest = RisPortHelper.getRisSoapContent(phonesList);
      let xml = '';
      var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          xml += d;
        });
        res.on('end', function(){
          parseString(xml, function (err, result) {
            if(err){
              reject('Error '+ err);
            } else {
              let devices = RisPortHelper.getPhonesFromResponse(result, phonesList);
              resolve(devices);
            }
          });
        });
      });
      req.write(sAXLRequest);
      req.end();
      req.on('error', function(e) {
        console.error(e);
      });
   });
  }


  async getAllDevices(devices){
      var arrays = [], size = this.stepSize;
      while (devices.length > 0){
        arrays.push(devices.splice(0, size));
      }
      for(let v of arrays) {
        let d = await this.getRisPortStatus(v, this.options);
        if(d !== undefined){
          this.devices = this.devices.concat(d);
        }
      };
      return this.devices;
  }

  getPhones(devices){
    return new Promise((resolve, reject) => {
      const d = this.getAllDevices(devices);
      d.then(function(data){
        resolve(data);
      });
    })
 }

}

module.exports = RisPort;
