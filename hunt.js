'use strict'

var CiscoAXL = require('./utils/axl');
var HuntHelper = require('./utils/hunthelper');
var authentication = process.env.UCM_USER+':'+process.env.UCM_PASS;
var ucmVersion = process.env.UCM_VERSION;
var ucmHost = process.env.UCM_HOST;


async function doCli(){
  try{
    const axl = CiscoAXL;
    axl.init(ucmVersion, ucmHost, authentication);
    if(process.argv[2] === 'help'){
      console.log('-- options:');
      console.log('node hunt.js LineGroupMembership 1234      (find out what linegroup[s] this extension is member of)');
      console.log('node hunt.js ListAllHuntGroups             (find out which huntgroups exist with)');
      console.log('node hunt.js ListLineGroupMembers lg_blah  (find out what extensions are in this linegroup)');

    }else if(process.argv[2] === 'LineGroupMembership'){
      await axl.runAxlSqlQuery(HuntHelper.getLineGroupMembershipQ(process.argv[3]));
    }else if(process.argv[2] === 'ListAllHuntGroups'){
      await axl.runAxlSqlQuery(HuntHelper.getAllHuntGroupDetailsQ());
    }else if(process.argv[2] === 'ListLineGroupMembers'){
      await axl.runAxlSqlQuery(HuntHelper.getLineGroupMemberQ(process.argv[3]));
    }

  }catch(err){
    console.error('__Error__: '+err);
    process.exit(1);
  }

}

doCli();