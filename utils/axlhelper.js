'use strict'

module.exports = {
  getAxlSoapContent(skip, first, ucmVersion) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:axl="http://www.cisco.com/AXL/API/${ucmVersion}">
      <soapenv:Header/>
      <soapenv:Body>
      <axl:executeSQLQuery>
      <sql>
      select SKIP ${skip} FIRST ${first} d.name from device d join typemodel tm on (tm.enum = d.tkmodel) where tm.tkclass = 1 and tm.tkrisclass = 1 and d.tkclass = 1
      </sql>
      </axl:executeSQLQuery>
      </soapenv:Body>
      </soapenv:Envelope>`;
  },
  getPhonesFromResponse(response) {
    let devices = [];
    var r = response["soapenv:Envelope"]["soapenv:Body"][0]["ns:executeSQLQueryResponse"][0]["return"][0]["row"];
    if(r !== undefined){
      r.forEach(val => {
        devices.push(val["name"][0]);
      });
    }
    return devices;
  }

}