var telnet = require('telnet-client');
var connection = new telnet();

var params = {
  host: '127.0.0.1',
  port: 23,
  shellPrompt: '/ # ',
  timeout: 5000
};

connection.on('ready', function(prompt) {
  console.log(prompt);
  console.log(cmd);
  connection.exec(cmd, function(response) {
    console.log(response);
  });
});

connection.on('connect', function(){
	console.log('connected');
});

connection.on('timeout', function() {
  console.log('socket timeout!')
  connection.end();
});

connection.on('close', function() {
  console.log('connection closed');
});

connection.connect(params);
