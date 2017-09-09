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
      'SoapAction':'http://schemas.cisco.com/ast/soap/action/#RisPort#SelectCmDevice',
      'Authorization': 'Basic ' + new Buffer(authentication).toString('base64'),
      'Content-Type': 'text/xml; charset=utf-8'
    }
    this.offSet = 0;
    this.stepSize = 3;
    this.options = {
      host: ucmHost,        // The IP Address of the Communications Manager Server
      port: 443,                  // Clearly port 443 for SSL -- I think it's the default so could be removed
      path: '/realtimeservice/services/RisPort',              // This is the URL for accessing axl on the server
      method: 'POST',             // AXL Requires POST messages
      headers: this.headers,           // using the headers we specified earlier
      rejectUnauthorized: false   // required to accept self-signed certificate
    };
    this.options.agent = new https.Agent(this.options);
  }

  getRisPortStatus(phonesList, options){
    return new Promise((resolve, reject) => {
      var sAXLRequest = "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
				"xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " +
				"xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" " +
				"xmlns:soapenc=\"http://schemas.xmlsoap.org/soap/encoding/\" " +
				"xmlns:tns=\"http://schemas.cisco.com/ast/soap/\" " +
				"xmlns:types=\"http://schemas.cisco.com/ast/soap/encodedTypes\">";
		sAXLRequest += "<SOAP-ENV:Header>";
		sAXLRequest += "<tns:AstHeader id=\"id1\">";
		sAXLRequest += "<SessionId xsi:type=\"xsd:string\">00000000-0000-0000-0000-000000000000</SessionId>";
		sAXLRequest += "</tns:AstHeader>";
		sAXLRequest += "</SOAP-ENV:Header>";
		sAXLRequest += "<SOAP-ENV:Body SOAP-ENV:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"><tns:SelectCmDevice>";
		sAXLRequest += "<StateInfo xsi:type=\"xsd:string\" />";
		sAXLRequest += "<CmSelectionCriteria xsi:type=\"tns:CmSelectionCriteria\">";
		sAXLRequest += "<MaxReturnedDevices xsi:type=\"xsd:unsignedInt\">200</MaxReturnedDevices>";
		sAXLRequest += "<Class xsi:type=\"xsd:string\">Phone</Class>";
		sAXLRequest += "<Model xsi:type=\"xsd:unsignedInt\">255</Model>";
		sAXLRequest += "<Status xsi:type=\"xsd:string\">Any</Status>";
		sAXLRequest += "<NodeName xsi:type=\"xsd:string\" />";
		sAXLRequest += "<SelectBy xsi:type=\"xsd:string\">Name</SelectBy>";
		sAXLRequest += "<SelectItems soapenc:arrayType=\"tns:SelectItem["+phonesList.length+"]\" xsi:type=\"soapenc:Array\" xmlns:soapenc=\"http://schemas.xmlsoap.org/soap/encoding/\">";
		for (var i = 0; i < phonesList.length; i++) {
			sAXLRequest += "<item xsi:type=\"tns:SelectItem\">";
			sAXLRequest += "<Item xsi:type=\"xsd:string\">"+phonesList[i]+"</Item>";
			sAXLRequest += "</item>";
		}
		sAXLRequest += "</SelectItems>";
		sAXLRequest += "</CmSelectionCriteria>";
		sAXLRequest += "</tns:SelectCmDevice></SOAP-ENV:Body>";
		sAXLRequest += "</SOAP-ENV:Envelope>";
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
          var r = result["soapenv:Envelope"]["soapenv:Body"][0]["ns1:SelectCmDeviceResponse"][0]["SelectCmDeviceResult"][0]["CmNodes"];
          r.forEach(function(cmNodes){
            let cmNode = cmNodes["item"];
            cmNode.forEach(function(item){
              let cmDevices = item["CmDevices"];
              cmDevices.forEach(function(cmDevice){
                let items = cmDevice["item"];
                if(items !== undefined){
                  // console.log('items', JSON.stringify(items));
                  items.forEach(function(item2){
                    // console.log('item2', item2);
                    let phone = {
                      name: item2["Name"][0]["_"],
                      ipAddress: item2["IpAddress"][0]["_"],
                      dirNumber: item2["DirNumber"][0]["_"],
                      loginUser: item2["LoginUserId"][0]["_"],
                      status: item2["Status"][0]["_"],
                      description: item2["Description"][0]["_"],
                      http: item2["Httpd"][0]["_"]
                    }
                    devices.push(phone);
                    var index = phonesList.indexOf(item2["Name"][0]["_"]);
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
    let options = this.options;
      let getRisPortStatus= this.getRisPortStatus;
      var arrays = [], size = 3;

      while (devices.length > 0)
          arrays.push(devices.splice(0, size));

      // console.log(arrays);
      for(let count2 = 0; count2 < arrays.length; count2++){
        let d = await getRisPortStatus(arrays[count2], options);
        if(d !== undefined){
          this.devices = this.devices.concat(d);
        }
      }

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
