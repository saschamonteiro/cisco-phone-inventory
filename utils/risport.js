'use strict'

var https = require("https");
var parseString = require('xml2js').parseString;
var RisPortHelper = require('./risporthelper');
var ucm = {};
ucm.inventory = {};
ucm.inventory.cisco = {};
ucm.inventory.cisco.ucm = {};
ucm.inventory.cisco.ucm.RisPort = {
  devices: [],
  settings: {
    stepSize: 1000,
    options: {
      host: '',
      port: 443,
      path: '/realtimeservice2/services/RISService70',
      method: 'POST',
      rejectUnauthorized: false
    }
  },
  init (ucmVersion, ucmHost, authentication){
    this.ucmVersion = ucmVersion;
    this.settings.options.host = ucmHost;
    this.settings.options.headers = {
      'SoapAction':'http://schemas.cisco.com/ast/soap/action/#RisPort70#SelectCmDevice',
      'Authorization': 'Basic ' + new Buffer(authentication).toString('base64'),
      'Content-Type': 'text/xml; charset=utf-8'
    }
    this.settings.options.agent = new https.Agent(this.settings.options);
  },

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
      req.on('socket', function (socket) {
        socket.setTimeout(5000);
        socket.on('timeout', function() {
          reject('timeout connecting to ucm risport')
        });
      });

      req.on('error', function(e) {
        console.error(e);
        reject(e);
      });
   });
  },


  async getAllDevices(devices){
      var arrays = [], size = this.settings.stepSize;
      while (devices.length > 0){
        arrays.push(devices.splice(0, size));
      }
      for(let v of arrays) {
        let d = await this.getRisPortStatus(v, this.settings.options);
        if(d !== undefined){
          this.devices = this.devices.concat(d);
        }
      };
      return this.devices;
  },

  getPhones(devices){
    return new Promise((resolve, reject) => {
      const d = this.getAllDevices(devices);
      d.then(function(data){
        resolve(data);
      });
      d.catch(function(err){
        reject(err);
      });
    })
 }

}

module.exports = ucm.inventory.cisco.ucm.RisPort;
