'use strict'

module.exports = {
  getAxlSoapContent: function(skip, first, ucmVersion) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:axl="http://www.cisco.com/AXL/API/${ucmVersion}">
      <soapenv:Header/>
      <soapenv:Body>
      <axl:executeSQLQuery>
      <sql>
      select SKIP ${skip} FIRST ${first} name from device where name like 'SEP%'
      </sql>
      </axl:executeSQLQuery>
      </soapenv:Body>
      </soapenv:Envelope>`;
  },
  getPhonesFromResponse: function(response) {
    let devices = [];
    var r = response["soapenv:Envelope"]["soapenv:Body"][0]["ns:executeSQLQueryResponse"][0]["return"][0]["row"];
    if(r !== undefined){
      r.forEach(function(val){
        devices.push(val["name"][0]);
      });
    }
    return devices;
  }

}