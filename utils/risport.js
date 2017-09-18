'use strict'

var https = require("https");
var parseString = require('xml2js').parseString;

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

  getRisPortStatus(phonesList, options, stepSize){
    return new Promise((resolve, reject) => {
      var sAXLRequest = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
    sAXLRequest += "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soap=\"http://schemas.cisco.com/ast/soap\">";
		sAXLRequest += "<soapenv:Header/>";
		sAXLRequest += "<soapenv:Body>";
    sAXLRequest += "<soap:selectCmDevice>";
		sAXLRequest += "<soap:StateInfo></soap:StateInfo>";
		sAXLRequest += "<soap:CmSelectionCriteria>";
		sAXLRequest += "<soap:MaxReturnedDevices>"+ stepSize +"</soap:MaxReturnedDevices>";
    sAXLRequest += "<soap:DeviceClass>Any</soap:DeviceClass>";
    sAXLRequest += "<soap:Model>255</soap:Model>";
    sAXLRequest += "<soap:Status>Any</soap:Status>";
    sAXLRequest += "<soap:NodeName></soap:NodeName>";
		sAXLRequest += "<soap:SelectBy>Name</soap:SelectBy>";
		sAXLRequest += "<soap:SelectItems>";
		for (var i = 0; i < phonesList.length; i++) {
			sAXLRequest += "<soap:item>";
			sAXLRequest += "<soap:Item>"+phonesList[i]+"</soap:Item>";
			sAXLRequest += "</soap:item>";
		}
		sAXLRequest += "</soap:SelectItems>";
    sAXLRequest += "<soap:Protocol>Any</soap:Protocol>";
    sAXLRequest += "<soap:DownloadStatus>Any</soap:DownloadStatus>";
		sAXLRequest += "</soap:CmSelectionCriteria>";
		sAXLRequest += "</soap:selectCmDevice>";
    sAXLRequest += "</soapenv:Body>";
		sAXLRequest += "</soapenv:Envelope>";
    // console.log('risport request', sAXLRequest);
    let devices = [];
    let xml = '';
    var req = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(d) {
        // console.log("Got Data: " + d);
        xml += d;
      });
      res.on('end', function(){
        // console.log("Got Completed Data: " +xml);
        parseString(xml, function (err, result) {
          // console.log('++DEVICES++', JSON.stringify(result));
          let a = result["soapenv:Envelope"]["soapenv:Body"][0];
          let b = a["ns1:selectCmDeviceResponse"][0];
          let c = b["ns1:selectCmDeviceReturn"][0];
          let d = c["ns1:SelectCmDeviceResult"][0];
          let r = d["ns1:CmNodes"];
          r.forEach(function(cmNodes){
            let cmNode = cmNodes["ns1:item"];
            cmNode.forEach(function(item){
              let cmDevices = item["ns1:CmDevices"];
              cmDevices.forEach(function(cmDevice){
                let items = cmDevice["ns1:item"];
                if(items !== undefined){
                  items.forEach(function(item2){
                    let phone = {
                      name: item2["ns1:Name"][0],
                      ipAddress: item2["ns1:IPAddress"][0]["ns1:item"][0]["ns1:IP"][0],
                      dirNumber: item2["ns1:DirNumber"][0],
                      loginUser: (typeof item2["ns1:LoginUserId"][0] === 'string') ? item2["ns1:LoginUserId"][0] : '',
                      status: item2["ns1:Status"][0],
                      description: item2["ns1:Description"][0],
                      http: item2["ns1:Httpd"][0]
                    }
                    devices.push(phone);
                    var index = phonesList.indexOf(item2["ns1:Name"][0]);
                    if (index > -1) {
                        phonesList.splice(index, 1);
                    }
                  });
                  phonesList.forEach(function(v){
                    devices.push({name: v, status: 'Unknown', ipAddress: '', dirNumber: '', loginUser: '', description:'', http: 'No'});
                  });
                }


              });
            });
          });
          resolve(devices);
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
        let d = await this.getRisPortStatus(v, this.options, this.stepSize);
        if(d !== undefined){
          this.devices = this.devices.concat(d);
        }
      };

      return this.devices;

  }
  getPhones(devices){
    return new Promise((resolve, reject) => {
      const d = this.getAllDevices(devices);
      // console.log('received allDevices', d);
      d.then(function(data){
        // console.log('Device count:', data.length);
        resolve(data);
      });

    })

 }

}

module.exports = RisPort;
