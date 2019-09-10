var dbobj = require('ifxnjs');
var ConStr = "SERVER=atea_dev_uccx11_uccx;DATABASE=cb_cra;HOST=9.1.1.62;SERVICE=1504;UID=uccxwallboard;PWD=ateasystems0916;PROTOCOL=onsoctcp;DB_LOCALE=en_US.57372";

dbobj.open(ConStr, function (err, connection) {
  if (err)
  {
    console.log(err);
    return;
  }
  connection.query("select 1 from mytab1", function (err1, rows)
  {
    if (err1) console.log(err1);
    else console.log(rows);
    connection.close(function(err2)
    {
      if(err2) console.log(err2);
    });
  });
});