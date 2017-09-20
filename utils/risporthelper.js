'use strict'

module.exports = {
  getRisSoapContent: function(phonesList) {
    var risRequest = `<?xml version=\"1.0\" encoding=\"utf-8\"?>
      <soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soap=\"http://schemas.cisco.com/ast/soap\">
        <soapenv:Header/>
        <soapenv:Body>
          <soap:selectCmDevice>
            <soap:StateInfo></soap:StateInfo>
            <soap:CmSelectionCriteria>
            <soap:MaxReturnedDevices>${phonesList.length}</soap:MaxReturnedDevices>
            <soap:DeviceClass>Any</soap:DeviceClass>
            <soap:Model>255</soap:Model>
            <soap:Status>Any</soap:Status>
            <soap:NodeName></soap:NodeName>
            <soap:SelectBy>Name</soap:SelectBy>
            <soap:SelectItems>
            ${phonesList.map(v => `<soap:item>
                  <soap:Item>${v}</soap:Item>
              </soap:item>`).join('')}
            </soap:SelectItems>
            <soap:Protocol>Any</soap:Protocol>
            <soap:DownloadStatus>Any</soap:DownloadStatus>
            </soap:CmSelectionCriteria>
          </soap:selectCmDevice>
        </soapenv:Body>
      </soapenv:Envelope>`;
    return risRequest;
  },
  getPhonesFromResponse: function(response, phonesList) {
    let devices = [];
    let a = response["soapenv:Envelope"]["soapenv:Body"][0];
    let b = a["ns1:selectCmDeviceResponse"][0];
    let c = b["ns1:selectCmDeviceReturn"][0];
    let d = c["ns1:SelectCmDeviceResult"][0];
    let r = d["ns1:CmNodes"];
    r.forEach(cmNodes => {
      let cmNode = cmNodes["ns1:item"];
      cmNode.forEach(item => {
        let cmDevices = item["ns1:CmDevices"];
        cmDevices.forEach(cmDevice => {
          let items = cmDevice["ns1:item"];
          if(items !== undefined){
            items.forEach(item2 => {
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
            phonesList.forEach(v => {
              devices.push({name: v, status: 'Unknown', ipAddress: '', dirNumber: '', loginUser: '', description:'', http: 'No'});
            });
          }


        });
      });
    });
    return devices;
  }
}