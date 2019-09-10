'use strict'
var appInfo = `<appInfo>
            <appID>${process.env.UCM_USER}</appID>
            <appCertificate>${process.env.UCM_PASS}</appCertificate>
        </appInfo>`;
module.exports = {
  getUserQuery(deviceName) {
    return `<query>
        ${appInfo}
        <deviceUserQuery>
            <deviceName>${deviceName}</deviceName>
        </deviceUserQuery>
     </query>`;
  },
  getDeviceQuery(userId) {
    return `<query>
        ${appInfo}
        <userDevicesQuery>
            <userID>${userId}</userID>
        </userDevicesQuery>
     </query>`;
  },
  getDeviceProfileQuery(userId) {
    return `<query>
        ${appInfo}
        <deviceProfileQuery>
            <userID>${userId}</userID>
        </deviceProfileQuery>
     </query>`;
  },
  getLogin(deviceName, userId, profileName) {
    return `<request>
      ${appInfo}
      <login>
        <deviceName>${deviceName}</deviceName>
        <userID>${userId}</userID>
        ${profileName ? '<deviceProfile>'+profileName+'</deviceProfile>' : ''}
        <exclusiveDuration>
          <indefinite/>
        </exclusiveDuration>
      </login>
      </request>`;
  },
  getLogout(deviceName) {
    return `<request>
      ${appInfo}
      <logout>
        <deviceName>${deviceName}</deviceName>
      </logout>
      </request>`;
  }
}