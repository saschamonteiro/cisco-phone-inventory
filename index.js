'use strict'

var fs = require('fs');

var CiscoAXL = require('./utils/axl');
var RisPort = require('./utils/risport');
var getPhoneSerial = require('./utils/phone').getPhoneSerial;
var getPhoneImage = require('./utils/phone').getPhoneImage;
var ProgressBar = require('progress');

var authentication = process.env.UCM_USER+':'+process.env.UCM_PASS;
var ucmVersion = process.env.UCM_VERSION;
var ucmHost = process.env.UCM_HOST
var getPhoneSerials = process.env.GET_SERIALS || 'false';
var getPhoneImages = process.env.GET_IMAGES || 'false';
var phonesWithSerial = [];

async function getDeviceAndIp() {
  try{
    const axl = CiscoAXL;
    axl.init(ucmVersion, ucmHost, authentication);
    console.log(new Date()+' Getting Phones from AXL');
    const devices = await axl.getPhones();
    const risPort = RisPort;
    risPort.init(ucmVersion, ucmHost, authentication);
    console.log(new Date()+' Getting ip/registration from RisPort');
    const devicesWithStatus = await risPort.getPhones(devices);
    if(getPhoneSerials === 'true'){
      console.log(new Date()+' Getting phone serial numbers');
      await getAllPhonesSerial(devicesWithStatus);
      fs.unlink('phones.csv', function(e){});
      fs.appendFileSync('phones.csv', 'name,description,loginuser,dirNumber,status,ipaddress,serial,model\r\n');
      phonesWithSerial.forEach(p => {
        fs.appendFile('phones.csv', p.name+','+p.description+','+p.loginUser+','+p.dirNumber+','+p.status+','+p.ipAddress+','+p.serial+','+p.model+'\r\n', function(err){});
      });
    }else{
      fs.unlink('phones.csv', function(e){});
      fs.appendFileSync('phones.csv', 'name,description,loginuser,dirNumber,status,ipaddress\r\n');
      devicesWithStatus.forEach(p => {
        fs.appendFile('phones.csv', p.name+','+p.description+','+p.loginUser+','+p.dirNumber+','+p.status+','+p.ipAddress+'\r\n', function(err){});
      });
    }
    console.log(new Date()+' Finished writing csv for '+phonesWithSerial.length+' phones');
    if(getPhoneImages === 'true') {
      console.log(new Date()+' Getting phone images');
      await getAllPhonesImage(devicesWithStatus);
      console.log(new Date()+' Finished saving phone images into ./images');
    }
    console.log(new Date()+' DONE');
  }catch(err){
    console.error('__Error__: '+err);
    process.exit(1);
  }

}

async function getAllPhonesSerial(phones){
  let bar = new ProgressBar(':bar', { total: phones.length });
  let reqs = phones.map(async function(r) {
    if(r.http === 'Yes'){
      let phone = await getPhoneSerial(r);
      phonesWithSerial.push(phone);
    } else {
      phonesWithSerial.push(r);
    }
    bar.tick();
  });
  await Promise.all(reqs);
}
async function getAllPhonesImage(phones){
  let bar = new ProgressBar(':bar', { total: phones.length });
  let reqs = phones.map(async function(r) {
    if(r.http === 'Yes'){
      await getPhoneImage(r);
    }
    bar.tick();
  });
  await Promise.all(reqs);
}
getDeviceAndIp();
