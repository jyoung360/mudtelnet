#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('mudtelnet:server');
var http = require('http');
var stripAnsi = require('strip-ansi');
var Convert = require('ansi-to-html');
var convert = new Convert();
var parseStringToNumber = require('../lib/utilities.js').parseStringToNumber;

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */
var redis = require("redis"),
client = redis.createClient(6379,'127.0.0.1'),
actionClient = redis.createClient(6379,'127.0.0.1');
client.subscribe("mud-raw-input");
client.subscribe("mud-input");
client.subscribe("system-input");
client.on("subscribe", function (channel, count) {
    debug("subscribed to channel %s",channel);
});

app.set('actionClient',actionClient);
app.set('client',client);
var server = http.createServer(app);
var character = require('../lib/character');
var environment = require('../lib/environment');
app.set('sockets',[]);
app.set('character',character);
app.set('environment',environment);
app.set('markovs',{ 1: [], 2: [] });
app.set('current_markov', {});
app.set('accuracy', []);
app.set('didGuess',false);

var io = require('socket.io')(server);
io.on('connection', function (socket) {
  app.get('sockets').push(socket);
  socket.on('command', function (data) {
    debug('got command from browser:',data);
    app.get('actionClient').publish('actions',data);
  });
  socket.on('disconnect', function(){
    app.set('sockets',app.get('sockets').filter(function(item) {
      if(item.id != socket.id) {
        return item;
      }
    }));
  });
});

class EventHandler {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    addEvent(event: string): void {
        return;
        // return "Hello, " + this.event;
    }
    getEvents(): Array<Event> {
        return []
    }
}

var EventHandler2 = function() {
  var self = this;
  this.eventLoop = [];
  this.addEvent = function(event) {
    for(var i in self.eventLoop) {
      if(event.title == self.eventLoop[i]) {
        debug('event '+event.title+' already on event loop');
        return false;
      }
    }
    debug('adding event '+event.toString())
    self.eventLoop.push(event.reset().action());
  };
  this.getEvents = function() {
    return self.eventLoop;
  };
  this.cleanLoop = function() {
    self.eventLoop = self.eventLoop.filter(function(event) {
      if(event.completed) {
        debug('Removing event '+event.title+' because it was completed');
        return false;
      }
      if(event.expires < Date.now()) {
        debug('removing event '+event.title+' because it was expired');
        event.failure('timeout reached');
        return false;
      }
      return true;
    })
  } 
};

var TriggerHandler = function() {
  var self = this;
  this.triggerLoop = [];
  this.addTrigger = function(trigger) {
    for(var i in self.triggerLoop) {
      if(trigger.title == self.triggerLoop[i]) {
        debug('trigger '+trigger.title+' already on trigger loop');
        return false;
      }
    }
    debug('adding event '+trigger.toString())
    self.triggerLoop.push(trigger);
  };
  this.getTriggers = function() {
    return self.triggerLoop;
  };
};

// var events = process.env.TICK?['tick skills']:['tick skills'];
var events = process.env.TICK?[]:[];
//app.set('enabledEvents', ['recharge goetia','hunger','eat','energies', 'prayer','tick']);
app.set('enabledEvents', events);
var eventHandler = new EventHandler();
app.set('eventHandler', eventHandler);
var triggerHandler = new TriggerHandler();
app.set('triggerHandler', triggerHandler);
require('../data/events.js')(app);
require('../data/triggers.js')(app);
setInterval(eventHandler.cleanLoop, 10000);

//setInterval(addToLoop, 10000);

client.on("message", function (channel, message) {
  if(channel == 'mud-raw-input') { 
    var strippedMessage = stripAnsi(message);
    //strippedMessage = strippedMessage.replace(/(?:\r\n|\r|\n)/g, ' ');
    var lines = strippedMessage.split('\n');
    lines.forEach(function(line) {
      for(var i in eventHandler.eventLoop) {
        var event = eventHandler.eventLoop[i];
        if(event.completed) continue;
        var match = line.match(event.regex);
        if(match) {
          event.completed = true;
          event.success(match);
          debug('found event '+event.title);
        }
      }
      for(var i in triggerHandler.triggerLoop) {
        var trigger = triggerHandler.triggerLoop[i];
        if(match = trigger.match(line)) {
          trigger.success(match);
        }
      }
    })
    var sockets = app.get('sockets');
    for(var i in sockets) {
      var socket = sockets[i];
      socket.emit('news', { channel: channel, message: convert.toHtml(message) });
    }
  }
    if(channel == 'system-input') {
        var match = message.match(/^enable (.*)/);
        if(match) {
          app.get('enabledEvents').push(match[1].toLowerCase());  
      }
      else if(match = message.match(/^disable (.*)/)) {
        app.set('enabledEvents',app.get('enabledEvents').filter(function(event){
          if(event != match[1].toLowerCase()) {
            return event;
          }
        }));  
        
      }
      //app.get('enabledEvents').push(message.toLowerCase());
      //return handleSystemMessage(message);
      debug(channel,message);
    }
    //return handleMudMessage(message);
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
