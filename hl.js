'use strict'

var fs = require('fs');

var CiscoAXL = require('./utils/axl');
var RisPort = require('./utils/risport');
var getPhoneSerial = require('./utils/phone').getPhoneSerial;
var getPhoneImage = require('./utils/phone').getPhoneImage;
var ProgressBar = require('progress');

var authentication = process.env.UCM_USER+':'+process.env.UCM_PASS;
var ucmVersion = process.env.UCM_VERSION;
var ucmHost = process.env.UCM_HOST;
var getPhoneSerials = process.env.GET_SERIALS || 'false';
var getPhoneImages = process.env.GET_IMAGES || 'false';
var phonesWithSerial = [];

async function getDeviceAndIp() {
  try{
    const risPort = RisPort;
    risPort.init(ucmVersion, ucmHost, authentication);
    console.log('risPort', risPort);
    console.log(new Date()+' Getting ip/registration from RisPort');
    const devicesWithStatus = await risPort.getRisPortStatusHL(risPort.settings.options);
    console.log('devicesWithStatus', JSON.stringify(devicesWithStatus));
    console.log(new Date()+' DONE');
  }catch(err){
    console.error('__Error__: '+err);
    process.exit(1);
  }

}


getDeviceAndIp();
