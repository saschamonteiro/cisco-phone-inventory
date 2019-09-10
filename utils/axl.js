'use strict'

var https = require("https");
var parseString = require('xml2js').parseString;
var AxlHelper = require('./axlhelper');
var ucm = ucm || {};
ucm.inventory = ucm.inventory || {};
ucm.inventory.cisco = ucm.inventory.cisco || {};
ucm.inventory.cisco.ucm = ucm.inventory.cisco.ucm || {};
ucm.inventory.cisco.ucm.AXL = {
  devices: [],
  settings: {
    ucmVersion: '',
    stepSize: 5000,
    options: {
      host: '',
      port: 443,
      path: '/axl/',
      method: 'POST',
      rejectUnauthorized: false
    }
  },
  init(ucmVersion, ucmHost, authentication) {
    this.settings.ucmVersion = ucmVersion;
    this.settings.options.host = ucmHost;
    this.settings.options.headers = {
      'SoapAction': 'CUCM:DB ver=' + ucmVersion,
      'Authorization': 'Basic ' + new Buffer(authentication).toString('base64'),
      'Content-Type': 'text/xml; charset=utf-8'
    };
    this.settings.options.agent = new https.Agent(this.settings.options);
    // console.log('init', this.settings);
  },


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
              // console.log(JSON.stringify(result));
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


  },
  runAxlQuery(sql, ucmVersion, options) {
    // console.log('sql', sql);
    return new Promise((resolve, reject) => {
      let xml = '';
      var soapBody = AxlHelper.getAxlQueryContent(sql, ucmVersion);
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
              // console.log(JSON.stringify(result));
              let devices = AxlHelper.getRowsFromResponse(result);
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


  },

  async getAllDevices() {
    // console.log('ucmVersion', this.settings.ucmVersion);
    // console.log('ucmVersion', JSON.stringify(this.settings.options));
    for (let count of Array(10).keys()) {
      let d = await this.getDevices(count * this.settings.stepSize, this.settings.stepSize, this.settings.ucmVersion, this.settings.options);
      if (d !== undefined) {
        this.devices = this.devices.concat(d);
      }
      if (d.length < this.settings.stepSize) {
        break;
      }
    }
    return this.devices;
  },

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
  },
  runAxlSqlQuery(sql){
    // console.log('runAxlSqlQuery', sql)
    return new Promise((resolve, reject) => {
      const d = this.runAxlQuery(sql, this.settings.ucmVersion, this.settings.options);
      d.then(function (data) {
        resolve(data);
      });
      d.catch(function(err){
        reject(err);
      });
    })
  }


}

module.exports = ucm.inventory.cisco.ucm.AXL;
