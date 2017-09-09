'use strict'

var fs = require('fs');

var AXL = require('./utils/axl');
var RisPort = require('./utils/risport');
var getPhoneSerial = require('./utils/phone');

var authentication = process.env.UCM_USER+':'+process.env.UCM_PASS;
var ucmVersion = process.env.UCM_VERSION;
var ucmHost = process.env.UCM_HOST
var getPhoneSerials = process.env.GET_SERIALS || 'false';
var phonesWithSerial = [];

async function getDeviceAndIp() {
  const axl = new AXL(ucmVersion, ucmHost, authentication);
  console.log(new Date()+' Getting Phones from AXL');
  const devices = await axl.getPhones();
  const risPort = new RisPort(ucmVersion, ucmHost, authentication);
  console.log(new Date()+' Getting ip/registration from RisPort');
  const devicesWithStatus = await risPort.getPhones(devices);
  if(getPhoneSerials === 'true'){
    console.log(new Date()+' Getting phone serial numbers');
    await getAllPhonesSerial(devicesWithStatus);
    fs.unlink('phones.csv', function(e){});
    fs.appendFile('phones.csv', 'name,description,loginuser,dirNumber,status,ipaddress,serial,model\r\n', function(err){});
    phonesWithSerial.forEach(p => {
      fs.appendFile('phones.csv', p.name+','+p.description+','+p.loginUser+','+p.dirNumber+','+p.status+','+p.ipAddress+','+p.serial+','+p.model+'\r\n', function(err){});
    });
  }else{
    fs.unlink('phones.csv', function(e){});
    fs.appendFile('phones.csv', 'name,description,loginuser,dirNumber,status,ipaddress\r\n', function(err){});
    devicesWithStatus.forEach(p => {
      fs.appendFile('phones.csv', p.name+','+p.description+','+p.loginUser+','+p.dirNumber+','+p.status+','+p.ipAddress+'\r\n', function(err){});
    });
  }
  console.log(new Date()+' Finished wrintg csv for '+phonesWithSerial.length+' phones');
}

async function getAllPhonesSerial(phones){
  let reqs = phones.map(async function(r) {
    if(r.http === 'Yes'){
      let phone = await getPhoneSerial(r);
      phonesWithSerial.push(phone);
    } else {
      phonesWithSerial.push(r);
    }
  });
  await Promise.all(reqs);
}
getDeviceAndIp();
