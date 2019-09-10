'use strict'


module.exports = {
  getLineGroupMembershipQ(agent) {
    return `select lg.name,lgnpm.lineselectionorder from linegroup lg 
					join linegroupnumplanmap lgnpm on (lgnpm.fklinegroup = lg.pkid) 
					join numplan np on (np.pkid = lgnpm.fknumplan) 
					where np.dnorpattern = '${agent}'`;
  },
  getAllHuntGroupDetailsQ(){
    return `select n.dnorpattern,dev.name as HuntList, lg.name as LineGroup,rl.selectionorder from numplan n 
					join devicenumplanmap d on (d.fknumplan = n.pkid) 
					join device dev on (dev.pkid = d.fkdevice) 
					join routelist rl on (rl.fkdevice = dev.pkid) 
					join linegroup lg on (lg.pkid = rl.fklinegroup) 
					where  n.tkpatternusage = 7
					order by n.dnorpattern, rl.selectionorder`;
  },
  getLineGroupMemberQ(lineGroup){
    return `select np.dnorpattern, lgnpm.lineselectionorder from numplan np
					join linegroupnumplanmap lgnpm on (lgnpm.fknumplan = np.pkid) 
					join linegroup lg on (lg.pkid = lgnpm.fklinegroup) 
					where lg.name = '${lineGroup}'
					order by 2`;
  }
}