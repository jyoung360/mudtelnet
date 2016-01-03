var logger = undefined;
var client = undefined;
var state = undefined;
var navigations = require('./data/navigations.js');
var explorations = require('./data/explorations.js');
var redis = require("redis");
var parseStringToNumber = function (numbersInString) {
    var ref = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety:90 }, mult = { hundred: 100, thousand: 1000, million: 1000000 }
	, strNums = numbersInString.split(' ').reverse()
	, number = 0
	, multiplier = 1;

    for(var i in strNums){
        if( mult[strNums[i]] != undefined ) {
            if(mult[strNums[i]]==100) {
                multiplier*=mult[strNums[i]]
            }else{
                multiplier=mult[strNums[i]]
            }
        } else {
            if (!isNaN(parseFloat(strNums[i]))) {
                number += parseFloat(strNums[i]) * multiplier;
            } else {
                var nums = strNums[i].split('-');
                number += ((ref[nums[0]]||0) + (ref[nums[1]]||0)) * multiplier;
            }
        }
    }
    return number;
}

var muds = {
	"localhost" : {
		host: "127.0.0.1",
		port: 3000,
		matches: [
			{
				regex: /Welcome, what is your name?/i,
				redisCallback : function(results) {
					logger.info("got name");
					logger.error("testing error");
					client.publish("actions","Josh");
				}
			},
			{
				regex: /Password:/i,
				redisCallback : function(results) {
					logger.info("got password");
					client.publish("actions","password");
				}
			},
			{
				regex: /(\d+)\/(\d+)(HP)/,
				redisCallback : function(results) {
					state.character.health = {
						current : results[1],
						total : results[2],
						percent : ((results[1]/results[2])*100).toFixed(0)
					}
					logger.info("got health %j",state.character.health);
				}
			},
			{
				regex: /\[Exits:(.*)\]/i,
				redisCallback : function(results) {
					//var rooms = results[1].split(',');
					var validDirections = ['north','south','east','west'];
					var exits = [];
					for(var i in validDirections) {
						var dir = validDirections[i];
						var re = new RegExp("("+dir+")");
						var match = results[1].match(re);
						if(match) {
							exits.push(match[1]);
						}
					}
					var item = exits[Math.floor(Math.random()*exits.length)];
					logger.info("got exits %s and we will go %s",exits,item);
					client.publish("actions",item);
					state.exits = exits;
				}
			}
		]
	},
	"lostsouls" : {
		host: "lostsouls.org",
		port: 23,
		systemMatches: [
			{
				regex: /explore (.*)/i,
				redisCallback : function(results) {
					for(var i in explorations[results[1]]) {
						client.publish("actions",explorations[results[1]][i]);
					}
					client.hset("explored",results[1],true,redis.print);
				},
			},
			{
				regex: /display nav (.*)/i,
				redisCallback : function(results) {
					client.hget("areas",results[1],redis.print);
				},
			},
			{
				regex: /find exits/i,
				redisCallback : function(results) {
					parseStringToNumber
				},
			},
			{
				regex: /navigate (.*)/i,
				redisCallback : function(results) {
					for(var i in navigations[results[1]]) {
						client.publish("actions","go "+navigations[results[1]][i]);
					}
				}
			},
			{
				regex: /return from (.*)/i,
				redisCallback : function(results) {
					if(!navigations[results[1]]) 
						return;

					var swapDirection = function(directions) {
						var newDirections = directions.split(", ").reverse().map(function(dir) {
							var replaces = {
								n:'s',
								s:'n',
								e:'w',
								w:'e',
								u:'d',
								d:'u',
								i:'o',
								o:'i'
							}

							return dir.split('').map(function(char){
								if(replaces[char]) {
									return replaces[char];
								}
								return char;
							}).join('').replace(/eo/g,'e');
						});
						return newDirections;
					};

					var revNav = navigations[results[1]].reverse();
					for(var i in revNav) {
						var dirs = swapDirection(revNav[i]);
						client.publish("actions","go "+dirs.join(", "));
					}
				}
			},
			{
				regex: /navex (.*)/i,
				redisCallback : function(results) {
					if(!results[1]) return;

					for(var i in navigations[results[1]]) {
						client.publish("actions","go "+navigations[results[1]][i]);
					}
					client.publish("system-input","explore "+results[1]);
					client.publish("system-input","return from "+results[1]);
				}
			},
			{
				regex: /find unexplored area/i,
				redisCallback : function(results) {
					client.hkeys("explored", function (err, areasExplored) {
						if(err) {
							return console.log(err);
						}
						for(var i in navigations) {
							if(areasExplored.indexOf(i) == -1) {
								return client.publish("system-input","navex "+i);
							}
						}
					});
				}
			},
			{
				regex: /check explored (.*)/i,
				redisCallback : function(results) {
					client.hkeys("explored", function (err, areasExplored) {
						if(err) {
							return false
						}
						if(areasExplored.indexOf(results[1]) != -1) {
							client.publish("actions","say I have already explored "+results[1]);
							return true;
						}
						client.publish("actions","say I have not explored "+results[1]);
						return false;
					});
				}
			},
			{
				regex: /set explored (.*)/i,
				redisCallback : function(results) {
					client.hset("explored",results[1],true,redis.print);
				}
			}
		],
		matches: [
			{
				regex: /Name:/i,
				redisCallback : function(results) {
					logger.info("got name");
					logger.error("testing error");
				}
			},
			{
				regex: /You perceive (.*) exits: (.*)/i,
				redisCallback : function(results) {
					var exitMap = Array.apply(null, Array(50)).map(function() {
						return Array.apply(null, Array(50)).map(function() {
							return [false,false,false,false,false];
						});
					});
					console.log(exitMap[5][5][2]);
					//.fill(new Array(),0,160);
					var totalExits = parseStringToNumber(results[1]);
					var directionString = results[2].toLowerCase();
					//var baseDirections = ['north','south','east','west','northeast','northwest','southeast','southwest'];
					var baseDirections = [
						{ 
							label: 'north',
							offset: { x: 1, y: 0, z: 0 }
						},
						{ 
							label: 'south',
							offset: { x: -1, y: 0, z: 0 }
						},
						{ 
							label: 'east',
							offset: { x: 0, y: 1, z: 0 }
						},
						{ 
							label: 'west',
							offset: { x: 0, y: -1, z: 0 }
						},
						{ 
							label: 'northeast',
							offset: { x: 1, y: 1, z: 0 }
						},
						{ 
							label: 'northwest',
							offset: { x: 1, y: -1, z: 0 }
						},
						{ 
							label: 'southeast',
							offset: { x: -1, y: 1, z: 0 }
						},
						{ 
							label: 'southwest',
							offset: { x: -1, y: -1, z: 0 }
						}
					];
					//var variations = ['up','down','in','out'];
					var variations = [
						{ 
							label: 'up',
							offset: { x: 0, y: 0, z: 1 }
						},
						{ 
							label: 'down',
							offset: { x: 0, y: 0, z: -1 }
						}
					];
					var validDirections = ['up','down','in','out'];
					for(var i in baseDirections) {
						var obj = {
							'label': baseDirections[i].label,
							'offset': baseDirections[i].offset
						};
						validDirections.push(obj);
						for(var j in variations) {
							var base = { x: 0, y: 0, z: 0}
							base.x += baseDirections[i].offset.x + variations[j].offset.x;
							base.y += baseDirections[i].offset.y + variations[j].offset.y;
							base.z += baseDirections[i].offset.z + variations[j].offset.z;
							var tmp = { 
								label: baseDirections[i].label+variations[j].label,
								offset: base
							};
							validDirections.push(tmp);
						}
					}
					var exits = [];
					for(var i in validDirections) {
						var dir = validDirections[i].label;
						//console.log(dir,validDirections[i])
						var re = new RegExp("(([\\W]+)?"+dir+"[\\W]+)");
						var match = directionString.match(re);
						if(match) {
							var direction = match[1];
							direction = direction.replace(/,/g,'');
							direction = direction.replace(/\s/g,'');
							exits.push(direction);
						}
					}
					logger.info(exits.length,totalExits);
					if(exits.length != totalExits) {
						logger.error("NOT ENOUGH EXITS");
					}
					logger.info("got exits %s",exits);
					//client.publish("actions",item);
					//state.exits = exits;

				}
			},
			{
				regex: /Password:/i,
				redisCallback : function(results) {
					logger.info("got password");
				}
			},
			{
				regex: /Incarnate as Orca/i,
				redisCallback: function(results,output) {
					logger.info("got incarnate message");
					client.publish("actions","2");
				}
			},
			{
				regex: /Body mass: (\d+) Fear: (\d+)\/(\d+) Spirit: (\d+)\/(\d+)  Anger: (\d+)\/(\d+) Endurance: (\d+)\/(\d+)  Speed: (\d+) ]/,
				redisCallback : function(results) {
					logger.info(results);
					state.character.health = {
						current : results[1],
						total : results[2],
						percent : ((results[1]/results[2])*100).toFixed(0)
					}
					logger.info("got health %j",state.character.health);
				}
			},
			{
				regex: /Body mass: (\d+\.?\d*)\/?(\d+\.?\d*)?/,
				redisCallback : function(results) {
					var current = parseInt(results[1],10);
					var total = results[2]?parseInt(results[2],10):parseInt(results[1],10);
					state.character.health = {
						current : current,
						total : total,
						percent : ((current/total)*100).toFixed(0)
					}
					logger.info("got health %j",state.character.health);
				}
			},
			{
				regex: /Fear: (\d+\.?\d*)\/?(\d+\.?\d*)?/,
				redisCallback : function(results) {
					var current = results[1];
					var total = results[2] || results[1];
					state.character.fear = {
						current : current,
						total : total,
						percent : ((current/total)*100).toFixed(0)
					}
					logger.info("got fear %j",state.character.health);
				}
			},
			{
				regex: /Endurance: (\d+\.?\d*)\/?(\d+\.?\d*)?/,
				redisCallback : function(results) {
					var current = results[1];
					var total = results[2] || results[1];
					state.character.endurance = {
						current : current,
						total : total,
						percent : ((current/total)*100).toFixed(0)
					}
					logger.info("got endurance %j",state.character.endurance);
				}
			},
			{
				regex: /Spirit: (\d+\.?\d*)\/?(\d+\.?\d*)?/,
				redisCallback : function(results) {
					var current = results[1];
					var total = results[2] || results[1];
					state.character.spirit = {
						current : current,
						total : total,
						percent : ((current/total)*100).toFixed(0)
					}
					logger.info("got spirit %j",state.character.spirit);
				}
			},
			{
				regex: /Speed: (\d+\.?\d*)/,
				redisCallback : function(results) {
					state.character.speed = results[1];
					logger.info("got speed %j",state.character.speed);
				}
			},
			{
				regex: /You have gained (.+) experience./,
				redisCallback : function(results) {
					function parse(numbersInString){
					    var ref = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety:90 },
					        mult = { hundred: 100, thousand: 1000, million: 1000000 },
					        strNums = numbersInString.split(' ').reverse(),
					        number = 0,
					        multiplier = 1;

					    for(var i in strNums){
					        if( mult[strNums[i]] != undefined ) {
					            if(mult[strNums[i]]==100) {
					                multiplier*=mult[strNums[i]]
					            }else{
					                multiplier=mult[strNums[i]]
					            }
					        } else {
					            if (!isNaN(parseFloat(strNums[i]))) {
					                number += parseFloat(strNums[i]) * multiplier;
					            } else {
					                var nums = strNums[i].split('-');
					                number += ((ref[nums[0]]||0) + (ref[nums[1]]||0)) * multiplier;
					            }
					        }
					    }
					    return number;
					}
					logger.info("got experience %j",parse(results[1]));
					client.publish("expstats",JSON.stringify({"area":state.location.area_name,"experience":parse(results[1])}));
				}
			},
			{
				regex: /You are not under attack/,
				redisCallback : function(results) {
					state.character.inCombat = false;
					state.stopCombatActions();
					logger.info("not currently in combat");
				}
			},
			{
				regex: /You attack (.*)/,
				redisCallback : function(results) {
					state.character.inCombat = true;
					state.character.attackers = results[1];
					state.doCombatActions();
					logger.info("engaging in combat with %s",results[1]);
				}
			},
			{
				regex: /You determine that you are .* the coordinates (.+), (.+) in (.+?)\./,
				redisCallback : function(results) {
					state.location = {
						"local" : {
							"x":results[1],
							"y":results[2]
						},
						"area_name":results[3],
						"location_index":state.location.location_index
					}
					logger.info("found location %j",state.location);
				}
			},
			{
				regex: /You determine that you are .* the coordinates (.+), (.+), (.+) in (.+?)\./,
				redisCallback : function(results) {
					state.location = {
						"local" : {
							"x":results[1],
							"y":results[2],
							"z":results[3]
						},
						"area_name":results[4],
						"location_index":state.location.location_index
					}
					logger.info("found location %j",state.location);
				}
			},
			{
				regex: /You determine that you are in (.*?)\./,
				redisCallback : function(results) {
					state.location = {
						"local":{},
						"global":{},
						"area_name":results[1],
						"location_index":state.location.location_index
					}
					logger.info("found location %j",state.location);
				}
			},
			{
				regex: /As the Ice Blade of Tarn strikes a (.*?) it becomes encased in a solid block of ice\./,
				redisCallback : function(results) {
					logger.info("Ice blade froze %s",results[1]);
				}
			},
			{
				regex: /You determine that you are .* the coordinates (.+), (.+), (.+) in (.+), and so .* global coordinates (.+), (.+), (.+?)\s/,
				redisCallback : function(results) {
					state.location = {
						"local" : {
							"x":results[1],
							"y":results[2],
							"z":results[3]
						},
						"global" : {
							"x":results[5],
							"y":results[6],
							"z":results[7]
						},
						"area_name":results[4],
						"location_index":state.location.location_index
					}
					logger.info("found location %j",state.location);
				}
			},
			{
				regex: /You are being attacked by (.*)/,
				redisCallback : function(results) {
					state.character.inCombat = true;
					state.character.attackers = results[1];
					state.doCombatActions();
					logger.info("currently in combat with %s",results[1]);
				}
			},
			{
				regex: /You are not under attack/,
				redisCallback : function(results) {
					state.navigateCombatArea();
				}
			},
			{
				regex: /exits: (.*) each leading to somewhere within a strange maze/,
				redisCallback : function(results) {
					function shuffle(array) {
						var currentIndex = array.length, temporaryValue, randomIndex ;
						while (0 !== currentIndex) {
							randomIndex = Math.floor(Math.random() * currentIndex);
							currentIndex -= 1;
							temporaryValue = array[currentIndex];
							array[currentIndex] = array[randomIndex];
							array[randomIndex] = temporaryValue;
						}
						return array;
					}
					var directions = ['north','south','east','west'];
					shuffle(directions);	
					if(results[1].toLowerCase().match(/up/)) {
						console.log("GOING UP");
						client.publish('actions',"say GOING UP!!!!");
						client.publish('actions','go up');
						client.publish('actions','show exits');
					}
					else {

						for(var i in directions) {
							var direction = directions[i];
							var re = new RegExp(direction);
							if(results[1].toLowerCase().match(re)) {
								console.log("GOING "+direction);
								client.publish('actions','go '+direction);
								client.publish('actions','show exits');
								return;
							}
						};
						console.log(results[1].toLowerCase());
					}
				}
			},
			{
				regex: /You have (.+) experience, requiring a further (.+) experience to attain the next level/,
				redisCallback : function(results) {
					state.character.experience.total = parseInt(results[1].replace(/,/g,''),10);
					state.character.experience.needed = parseInt(results[2].replace(/,/g,''),10);
					logger.info("got xp %s need %s",state.character.experience.total,state.character.experience.needed);
				}
			},
			{
				regex: /Energies of Orca/,
				redisCallback : function(results) {
					var matches = results.input.match(/\|(.*?)\|/g);
					for(var i in matches) {
						var match = matches[i];
						var bits = match.split(/\s+/);
						var type = bits[1];
						if(type == 'Type')
							continue;
						var current = parseFloat(bits[2]);
						var maximum = parseFloat(bits[3]);
						var percent = bits[4]?parseFloat(bits[4].replace('%','')):0.0;
						state.character.energies[type] = {
							"current" : current,
							"maximum" : maximum,
							"percent" : percent
						}
					}
					logger.info("got energies")
				}
			},
			{
				regex: /Obvious exits (.*)/i,
				redisCallback : function(results) {
					//var rooms = results[1].split(',');
					var baseDirections = ['north','south','east','west','northeast','northwest','southeast','southwest'];
					var variations = ['up','down'];
					var validDirections = ['up','down','in'];
					for(var i in baseDirections) {
						for(var j in variations) {
							validDirections.push(baseDirections[i]+variations[j]);
						}
					}
					var exits = [];
					for(var i in validDirections) {
						var dir = validDirections[i];
						var re = new RegExp("([^\\w\\s,]+"+dir+"[^\\w\\s,]+)");
						var match = results[1].match(re);
						if(match) {
							exits.push(match[1]);
						}
					}
					if(results[1].indexOf('all compass directions')) {
						exits = exits.concat(validDirections);
					}
					//var item = exits[Math.floor(Math.random()*exits.length)];
					logger.info("got exits %s",exits);
					//client.publish("actions",item);
					state.exits = exits;
				}
			}
		]
	}
}

function getMud(mudname) {
	return muds[mudname];
}

module.exports = function(log,redisClient,stateObj) {
	logger = log;
	client = redisClient;
	state = stateObj;
	return {
		getMud : getMud
	}
}
