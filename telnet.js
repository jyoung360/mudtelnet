var net = require('net');
var buffer = require('buffer');
var TelnetInput = require('telnet-stream').TelnetInput;
var TelnetOutput = require('telnet-stream').TelnetOutput;
var fs = require('fs');
var stream = require('stream');
var util = require('util');
var config = require('./config.js');
var stripAnsi = require('strip-ansi');

var mudDetails = config.getMud('localhost');

var Transform = stream.Transform ||
  require('readable-stream').Transform;

/**
 * Duplex stream created with two transform streams
 * - inRStream - inbound side read stream
 * - outWStream - outbound side write stream
 */
function TransformThrough(options) {
  this.type = options.type || "output";

  if (!(this instanceof TransformThrough)) {
    return new TransformThrough(options);
  }
  this.readArr = []; // array of times to read

  // every second, add new time string to array
  this.timer = setInterval(keepAlive, 1000, this);
  this.outputCommand = '';
  this.character = {};
  this.exits = [];

  this.sendMessage = function(msg) {
    if(this.messagesOn)
      this.push(msg+"\r\n");
  }

  Transform.call(this, options);
}
util.inherits(TransformThrough, Transform);


/* add new time string to array to read */
function keepAlive(self) {
  //self.push("look\r\n");
  //self.push("say Obvious exits are north, east, and west.\r\n");
}

/* left inbound side */
TransformThrough.prototype._transform =
  function (chunk, enc, cb) {
    if(this.type == "input") {
      var string = chunk.toString();
      if(match = string.match(/^system (.*)/)) {
        console.log("got a system message %s",match[1]);
        return cb(null);
      }
      cb(null,chunk);
    }
    else {
    	var string = chunk.toString();
      string = string.replace(/\r/g,"");
      string = stripAnsi(string);
    	var commands = string.split("\n");
    	for(var i in commands) {
        var command = commands[i];
        for(var j in mudDetails.matches) {
          var match = mudDetails.matches[j];
          if(results = command.match(match.regex)) {
            match.callback(results,this,this.character);
          }
        }
      }
    	cb(null);
    }
  };

var socket = net.createConnection(mudDetails.port, mudDetails.host, function() {
    var telnetOutput = new TelnetOutput();
   	var transformIn = new TransformThrough({type:"input"});
    var transformOut = new TransformThrough({type:"output"});

    socket.pipe(process.stdout);
    socket.pipe(transformOut).pipe(socket);
    //process.stdin.pipe(telnetOutput).pipe(socket);
    process.stdin.pipe(transformIn).pipe(telnetOutput).pipe(socket);
});
