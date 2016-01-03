var net = require('net');
var buffer = require('buffer');
var TelnetInput = require('telnet-stream').TelnetInput;
var TelnetOutput = require('telnet-stream').TelnetOutput;
var fs = require('fs');
var stream = require('stream');
var util = require('util');
var config = require('./config.js')();
var stripAnsi = require('strip-ansi');
var kafka = require('kafka-node'),
Producer = kafka.Producer,
KeyedMessage = kafka.KeyedMessage,
client = new kafka.Client('52.24.95.119:32774/','test'),
producer = new Producer(client);
producer.on('ready', function () {
    console.log('producer ready');
});
 
producer.on('error', function (err) {
    console.log('producer error',err)
})

var redis = require("redis"),
outputclient = redis.createClient(6379,'127.0.0.1'),
actionclient = redis.createClient(6379,'127.0.0.1');
var mudDetails = config.getMud('lostsouls');

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

  if(this.type == "output") {
    var that = this;
    actionclient.on("message", function (channel, message) {
        console.log("channel: %s , message: %s",channel,message);
        that.push(message+"\r\n");
    });
    actionclient.subscribe("actions");
  }

  this.sendMessage = function(msg) {
    if(this.messagesOn)
      this.push(msg+"\r\n");
  }

  Transform.call(this, options);
}
util.inherits(TransformThrough, Transform);

/* left inbound side */
TransformThrough.prototype._transform =
  function (chunk, enc, cb) {
    if(this.type == "input") {
      var string = chunk.toString();
      if(match = string.match(/^system (.*)/)) {
        outputclient.publish("system-input",match[1]);
        return cb(null);
      }
      cb(null,chunk);
    }
    else {
        var string = chunk.toString();
        string = string.replace(/\r/g,"");
        outputclient.publish("mud-raw-input",string);
        string = stripAnsi(string);
        outputclient.publish("mud-input",string);
        producer.send([{ topic: 'topic1', messages: string}], function (err, data) {
            if(err) {
                console.log(err);
            }
        });
      
    	// var commands = string.split("\n");
    	// for(var i in commands) {
     //    var command = commands[i];
     //    for(var j in mudDetails.matches) {
     //      var match = mudDetails.matches[j];
     //      if(results = command.match(match.regex)) {
     //        //match.callback(results,this,this.character);
     //      }
     //    }
     //  }
    	cb(null);
    }
  };

var telnetOutput = new TelnetOutput();
var transformIn = new TransformThrough({type:"input"});
var transformOut = new TransformThrough({type:"output"});

actionclient.on("subscribe", function (channel, count) {
  var socket = net.createConnection(mudDetails.port, mudDetails.host, function() {
    socket.pipe(process.stdout);
    socket.pipe(transformOut).pipe(socket);
    //process.stdin.pipe(telnetOutput).pipe(socket);
    process.stdin.pipe(transformIn).pipe(telnetOutput).pipe(socket);
  });
});

