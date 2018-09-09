var buffer = require('buffer');
var fs = require('fs');
var stream = require('stream');
var util = require('util');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
  name: 'myapp',
  streams: [
    {
      level: 'info',
      stream: process.stdout            // log INFO and above to stdout
    },
    {
      level: 'error',
      path: '/tmp/myapp-error.log'  // log ERROR and above to a file
    }
  ]
});
var redis = require("redis"),
client = redis.createClient(6379,'127.0.0.1'),
actionClient = redis.createClient(6379,'127.0.0.1');

var state = {
  "character" : {
    "energies" : {},
    "endurance" : {},
    "health" : {},
    "spirit" : {},
    "speed" : 0,
    "fear" : {},
    "experience" : {
      "total" : 0,
      "needed" : 0
    },
    "inCombat":false
  },
  "location" : { 
    "local" : {},
    "global" : {},
    "area_name" : undefined,
    "location_index" : 0
  },
  "combatInterval": false,
  "exits" : [],
  "doCombatActions" : function() {
    if(!state.combatInterval)
      state.combatInterval = setInterval(doCombatStuff,3000);
  },
  "stopCombatActions" : function() {
    clearInterval(state.combatInterval);
    state.combatInterval = false;
  },
  "expoloreAreas" : function() {

  },
  "navigateCombatArea" : function() {
    if(locationMaps[state.location.area_name]) {
      if(state.location.location_index <= locationMaps[state.location.area_name].length) {
        var areaActions = locationMaps[state.location.area_name][state.location.location_index++];
        for(var i in areaActions) {
          if(typeof areaActions[i] == "string") {
            actionClient.publish('actions',areaActions[i]);
          }
          else if(typeof areaActions[i] == "function") {
            areaActions[i]();
          }
        }
      }
      else {
        console.log("no more actions in "+state.location.area_name);
      }
    }
    else if(state.location.area_name == 'Gezuun') {
        actionClient.publish('actions','show exits');
        console.log('I am in gezuun');
    }
  }
};

var navigateTo = function(newLocationCoors,currentLocation) {
  var actions = calculatePath(currentLocation,newLocationCoors);
  for(var i in actions) {
    actionClient.publish('actions',actions[i]);
  }
}

var knownLocations = require('./data/locations');
var locationMaps = require('./data/actions')(state,navigateTo,knownLocations);

var findCurrentLocation = function(currentLocation) {
  if(!currentLocation || !currentLocation.x || !currentLocation.y) {
    return false;
  } 
  for(var i in knownLocations) {
    var x = knownLocations[i].x;
    var y = knownLocations[i].y;
    if(currentLocation.x == x && currentLocation.y == y) {
      return i
    }
  }  
  return false;
}

var findNewLocation = function(currentLocation) {
  var current = findCurrentLocation(currentLocation);
  var items = Object.keys(knownLocations);
  var item = items[Math.floor(Math.random()*items.length)];
  return {"nextLocation":item,  "current":current};
}

var calculatePath = function(sourceCoors,destCoors) {
  var s = sourceCoors;
  var d = destCoors;
  if(!s || !d) 
    return [];
  var x = (d.x-s.x)<0?-1*(d.x-s.x)+"w":(d.x-s.x)+"e";
  var y = (d.y-s.y)<0?-1*(d.y-s.y)+"s":(d.y-s.y)+"n";
  return ['go 5u','go '+x, 'go '+y, 'go 5d', 'dl'];
}

var config = require('./config.js')(log,actionClient,state);
var mudDetails = config.getMud('lostsouls');

client.on("subscribe", function (channel, count) {
    log.info("subscribed to channel %s",channel);
});

client.on("message", function (channel, message) {
    if(channel == 'system-input') {
      return handleSystemMessage(message);
    }
    return handleMudMessage(message);
});

var handleSystemMessage = function(message) {
  var command = message.replace(/(?:\r\n|\r|\n)/g, ' ');
  for(var j in mudDetails.systemMatches) {
    var match = mudDetails.systemMatches[j];
    if(results = command.match(match.regex)) {
      match.redisCallback(results);
    }
  }
}

var handleMudMessage = function(message) {
  //var command = message.replace(/(?:\r\n|\r|\n)/g, ' ');
  var command = message;
  for(var j in mudDetails.matches) {
    var match = mudDetails.matches[j];
    if(results = command.match(match.regex)) {
      match.redisCallback(results);
    }
  }
}

var doStuff = function() {
  if(actions = determineAction())
    for(var i in actions) {
      actionClient.publish('actions',actions[i]);
    }
}

var doCombatStuff = function() {
  //actionClient.publish('actions','bb');
  //actionClient.publish('actions','burn opponent');
  actionClient.publish('actions','show attackers');
  console.log("AREA NAME",state.location)
}

var determineAction = function() {
  var msg = {
    "Health_current" : state.character.health.current || 0,
    "Health_total" : state.character.health.total || 0,
    "Health_percent" : state.character.health.percent || 0,
    "speed" : state.character.speed,
    "experience_needed" : state.character.experience.needed || 0,
    "experience_total" : state.character.experience.total || 0
  };
  for(var i in state.character.energies) {
    var energy = state.character.energies[i];
    msg[i+"_current"] = energy.current;
    msg[i+"_maximum"] = energy.maximum;
    msg[i+"_percent"] = energy.percent;
  }

  actionClient.publish('mudstats', JSON.stringify(msg));

  var sourceDest = findNewLocation(state.location.global);
  
  var directions = [];//calculatePath(state.location.global,knownLocations[sourceDest.nextLocation]);
  var actions = [];//['xp','show energies','show attackers','dl'];
  for(var i in directions) {
    actions.push(directions[i]);
  }
  return actions;
}
setInterval(doStuff,30000);

client.subscribe("mud-input");
client.subscribe("system-input");

// curl -XDELETE 192.168.99.100:9200/mud
// curl -XPOST 192.168.99.100:9200/mud -d '{
// "mappings" : {
//     "_default_":{
//       "_timestamp" : {
//           "enabled" : true,
//           "store" : "yes"
//       },
//       "properties": {
//         "endurance_current": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "endurance_total": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "endurance_percent": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "health_current": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "health_total": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "health_percent": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "spirit_current": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "spirit_total": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "spirit_percent": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "fear_current": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "fear_total": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         },
//         "fear_percent": {
//           "type": "float",
//           "store": "yes",
//           "analyzer": "keyword"
//         }
//       }
//     }
//   }
// }'
// curl -XGET '192.168.99.100:9200/mud/_mappings?pretty=true'

// {
//   "aggs": {
//     "character": {
//       "nested": {
//         "path": "character"
//       },
//       "aggs": {
//         "endurance": {
//           "nested": {
//             "path": "character.endurance"
//           },
//           "aggs": {
//             "stats" : {
//               "terms": {
//                 "field": "character.endurance.total",
//                 "size": 10
//               },
//               "aggs": {
//                 "top_reverse_nested": {
//                   "reverse_nested": {}
//                 }
//               }              
//             }
//           }
//         }
//       }
//     }
//   }
// }

// curl -XGET '192.168.99.100:9200/mud/_settings'

// curl -XGET '192.168.99.100:9200/mud/_search?pretty=true' -d '
// {
//     "query" : {
//         "match_all" : {}
//     },
//     "fields" : [ "character.endurance.total" ]
// }'

