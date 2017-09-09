'use strict'

var https = require("https");
var parseString = require('xml2js').parseString;

class AXL {
  constructor (ucmVersion, ucmHost, authentication){
    this.ucmVersion = ucmVersion;
    this.ucmHost = ucmHost;
    this.authentication = authentication;
    this.devices = [];
    this.headers = {
      'SoapAction':'CUCM:DB ver='+ucmVersion,
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




    getDevices(s , f , ucmVersion, options){
      return new Promise((resolve, reject) => {
        let devices = [];
        // let stepSize = this.stepSize;
        // let getDevices = this.getDevices;
        let xml = '';
        // console.log('getting devices SKIP '+s+' FIRST '+f);
        var soapBody = new Buffer('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:axl="http://www.cisco.com/AXL/API/'+ucmVersion+'">' +
           '<soapenv:Header/>' +
           '<soapenv:Body>' +
              '<axl:executeSQLQuery>' +
                '<sql>' +
                'select SKIP '+s+' FIRST '+f+' name from device where name like \'SEP%\''+
                '</sql>' +
            '</axl:executeSQLQuery>' +
           '</soapenv:Body>' +
        '</soapenv:Envelope>');
        // console.log('soapBody', soapBody.toString());
        var req = https.request(options, function(res) {
          // console.log("status code = ", res.statusCode);
          // console.log("headers = " , res.headers);
          res.setEncoding('utf8');
          res.on('data', function(d) {
            // console.log("Got Data: " + d);
            xml += d;
          });
          res.on('end', function(){
            // console.log("Got Completed Data: " +xml);
            parseString(xml, function (err, result) {
              // console.log('++DEVICES++', devices);
              var r = result["soapenv:Envelope"]["soapenv:Body"][0]["ns:executeSQLQueryResponse"][0]["return"][0]["row"];
              if(r !== undefined){
                // console.log('RESPONSE',s,f,JSON.stringify(r));
                r.forEach(function(val, index){
                  // console.log(JSON.stringify(val["name"][0]));
                  devices.push(val["name"][0]);
                });

                  // console.log('resolve1', devices);
                  resolve(devices);

              }else{
                // console.log('resolve2', devices);
                resolve([]);
              }

            });

          });
        });

        req.write(soapBody);
        req.end();
        req.on('error', function(e) {
          console.error(e);
        });
      });


    }

    async getAllDevices(){
      let getDevices = this.getDevices;
      for(let count = 0; count < 10; count++){
        let d = await getDevices(count * this.stepSize, this.stepSize, this.ucmVersion, this.options);
        // console.log('--d--', d);

        if(d !== undefined){
          this.devices = this.devices.concat(d);
        }
        // console.log('--devices--', this.devices);
        if(d.length < this.stepSize){
          break;
        }
      }
      return this.devices;
    }
    getPhones(){
      return new Promise((resolve, reject) => {
        const d = this.getAllDevices();
        d.then(function(data){
          // console.log('Device count:', data.length);
          resolve(data);
        });

      })

   }


}

module.exports = AXL;
