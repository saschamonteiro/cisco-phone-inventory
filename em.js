'use strict'

var EmApi = require('./utils/emapi');
var EmApiHelper = require('./utils/emapihelper');


async function doCli(){
  // console.log('process', process);
  if(process.argv[2] === 'help'){
    console.log('-- options:');
    console.log('node em.js UserQuery SEPAABBCCDDEE            (find out what user is logged in on this device)');
    console.log('node em.js DeviceQuery jdoe                   (find out on what device this user is logged in)');
    console.log('node em.js DeviceProfileQuery jdoe            (find out what profiles this user has)');
    console.log('node em.js Login SEPAABBCCDDEE jdoe           (login this user on this device with default profile)');
    console.log('node em.js Login SEPAABBCCDDEE jdoe udp_jdoe  (login this user on this device with named profile)');
    console.log('node em.js Logout SEPAABBCCDDEE               (logout user from this device)');
  }else if(process.argv[2] === 'UserQuery'){
    const res = await EmApi.doRequest(EmApiHelper.getUserQuery(process.argv[3]));
  }else if(process.argv[2] === 'DeviceQuery'){
    const res = await EmApi.doRequest(EmApiHelper.getDeviceQuery(process.argv[3]));
  }else if(process.argv[2] === 'DeviceProfileQuery'){
    const res = await EmApi.doRequest(EmApiHelper.getDeviceProfileQuery(process.argv[3]));
  }else if(process.argv[2] === 'Login'){
    const res = await EmApi.doRequest(EmApiHelper.getLogin(process.argv[3], process.argv[4], process.argv[5]));
  }else if(process.argv[2] === 'Logout'){
    const res = await EmApi.doRequest(EmApiHelper.getLogout(process.argv[3]));
  }


}


doCli();