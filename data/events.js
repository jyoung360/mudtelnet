var debug = require('debug')('mudtelnet:events');
var app = undefined;
var parseStringToNumber = require('../lib/utilities.js').parseStringToNumber;

var Event = function(options) {
	var self = this;
	this.title = options.title || 'Default Event';
	this.completed = false;
	this.timeout = isNaN(parseInt(options.timeout,10))?30000:parseInt(options.timeout,10);
	this.action = function() {
		debug('Performing action '+self.title);
		console.log(app.get('enabledEvents').indexOf(self.title.toLowerCase()));
		if(app.get('enabledEvents').indexOf(self.title.toLowerCase()) == -1) {
			console.log('skipping event action',self.title);
			return self;
		}
		if(options.action && typeof options.action == 'function') {
			options.action();
		}
		return self;
	};
	this.regex = options.regex || false;
	this.success = function(match) {
		debug('Performing success '+self.title);
		if(app.get('enabledEvents').indexOf(self.title.toLowerCase()) == -1) {
			console.log('skipping event',self.title);
			return self;
		}
		if(options.success && typeof options.success == 'function') {
			options.success(match);
		}
		return self;
	};
	this.failure = function() {
		debug('Performing failure '+self.title);
		if(options.failure && typeof options.failure == 'function') {
			options.failure();
		}
		return self;
	}
	this.toString = function() {
		return self.title;
	}
	this.expires = Date.now() + this.timeout;
	this.reset = function() {
		debug('Performing reset '+this.title);
		this.completed = false;
		this.expires = Date.now() + this.timeout;
		if(options.reset && typeof options.reset == 'function') {
			options.reset();
		}
		return self;
	}
}

var RecurringEvent = function(options) {
	Event.call(this, options);
	var self = this;
	this.intervalPeriod = options.intervalPeriod || 60000;
	this.interval = function() {
		debug('Performing interval '+self.title);
		if(self.completed || self.expires < Date.now()) {
			debug('time to add again');
			app.get('eventHandler').addEvent(self);
		}
		if(options.interval && typeof options.interval == 'function') {
			options.interval.call(self);
		}
		return self;
	}
	setInterval(this.interval, this.intervalPeriod);
}
Event.prototype.constructor = Event;
RecurringEvent.prototype.constructor = RecurringEvent;

var Room = function(options) {
	var self = this;
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.z = options.z || 0;
	this.id = options.id || options.x+":"+options.y+":"+options.z;
	this.exits = [];
	this.explored = options.explored || false;
	return self;
};

var AreaRooms = function() {
	var self = this;
	this.rooms = {};
	this.addRoom = function(room) {
		if(!self.rooms[room.id]) {
			return self.rooms[room.id] = room;
		}
		if(room.exits.length >= self.rooms[room.id].exits.length) {
			self.rooms[room.id].exits = room.exits;
		}
		self.rooms[room.id].explored = self.rooms[room.id].explored || room.explored;
	};
	this.getUnexploredRooms = function() {
		var unexploredRooms = [];
		for(var i in self.rooms) {
			if(!self.rooms[i].explored) {
				unexploredRooms.push(self.rooms[i]);
			}
		}
		return unexploredRooms;
	};
	
	this.printRooms = function() {
		for(var i in self.rooms) {
			console.log(self.rooms[i]);
		}	
	};
	
	this.getClosestUnexploredRoom = function(currentRoom, testedRooms) {
		console.log('finding closest unexplored room to ',currentRoom)
		if(!self.rooms[currentRoom]) {
			console.log("current room does not exist",currentRoom)
			return false;
		}
		if(testedRooms.indexOf(currentRoom) > -1) {
			console.log("we already tested room",currentRoom)
			return false;
		}
		testedRooms.push(currentRoom);
		for(var i in self.rooms[currentRoom].exits) {
			var exit = self.rooms[currentRoom].exits[i];
			//console.log('testing exit',exit);
			if(!self.hasRoomBeenExplored(exit.id)) {
				return exit;
			}
			else {
				var subExits = self.getClosestUnexploredRoom(exit.id,testedRooms);
				if(subExits) {
					console.log("here are subexits",subExits);
				}
				return subExits;
			}
			//console.log('exit for currentRoom',currentRoom,self.hasRoomBeenExplored(exit.id));
		}
		return false;
	};
	this.hasRoomBeenExplored = function(roomId) {
		if(!self.rooms[roomId] || self.rooms[roomId].explored) {
			//console.log("room has been explored", roomId)
			return true;
		}
		//console.log("room has NOT been explored", self.rooms[roomId])
		return false;
	};
	return self;
}

module.exports = function(a) {
	app = a;
	var areaRooms = AreaRooms();
	
	// var reEvent = new RecurringEvent({ 
	// 	title: 'Exits', 
	// 	intervalPeriod: 10000,
	// 	timeout: 30000,
	// 	regex: /You perceive (.*) exits?: (.*)/i,
	// 	action: function() {
	// 		app.get('actionClient').publish('actions','show exits');
	// 	},
	// 	success: function(match) {
	// 		var totalExits = parseStringToNumber(match[1]);
	// 		var directionString = match[2].toLowerCase();
	// 		var baseDirections = [
	// 			{ 
	// 				label: 'north',
	// 				offset: { x: 1, y: 0, z: 0 }
	// 			},
	// 			{ 
	// 				label: 'south',
	// 				offset: { x: -1, y: 0, z: 0 }
	// 			},
	// 			{ 
	// 				label: 'east',
	// 				offset: { x: 0, y: 1, z: 0 }
	// 			},
	// 			{ 
	// 				label: 'west',
	// 				offset: { x: 0, y: -1, z: 0 }
	// 			},
	// 			{ 
	// 				label: 'northeast',
	// 				offset: { x: 1, y: 1, z: 0 }
	// 			},
	// 			{ 
	// 				label: 'northwest',
	// 				offset: { x: 1, y: -1, z: 0 }
	// 			},
	// 			{ 
	// 				label: 'southeast',
	// 				offset: { x: -1, y: 1, z: 0 }
	// 			},
	// 			{ 
	// 				label: 'southwest',
	// 				offset: { x: -1, y: -1, z: 0 }
	// 			}
	// 		];
	// 		//var variations = ['up','down','in','out'];
	// 		var variations = [
	// 			{ 
	// 				label: 'up',
	// 				offset: { x: 0, y: 0, z: 1 }
	// 			},
	// 			{ 
	// 				label: 'down',
	// 				offset: { x: 0, y: 0, z: -1 }
	// 			}
	// 		];
	// 		var validDirections = [ 
	// 			{ 
	// 				label: 'up',
	// 				offset: { x: 0, y: 0, z: 1 }
	// 			},
	// 			{ 
	// 				label: 'down',
	// 				offset: { x: 0, y: 0, z: -1 }
	// 			},
	// 			// { 
	// 			// 	label: 'in',
	// 			// 	offset: { x: 0, y: 0, z: 0 }
	// 			// },
	// 			// { 
	// 			// 	label: 'out',
	// 			// 	offset: { x: 0, y: 0, z: 0 }
	// 			// }
	// 		];
	// 		for(var i in baseDirections) {
	// 			var obj = {
	// 				'label': baseDirections[i].label,
	// 				'offset': baseDirections[i].offset
	// 			};
	// 			validDirections.push(obj);
	// 			for(var j in variations) {
	// 				var base = { x: 0, y: 0, z: 0}
	// 				base.x += baseDirections[i].offset.x + variations[j].offset.x;
	// 				base.y += baseDirections[i].offset.y + variations[j].offset.y;
	// 				base.z += baseDirections[i].offset.z + variations[j].offset.z;
	// 				var tmp = { 
	// 					label: baseDirections[i].label+variations[j].label,
	// 					offset: base
	// 				};
	// 				validDirections.push(tmp);
	// 			}
	// 		}
	// 		var currentRoom = app.get("character").currentRoom;
	// 		var exits = [];
	// 		directionString = directionString.replace(/,/g,'');
	// 		for(var i in validDirections) {
	// 			var dir = validDirections[i];
	// 			var allWords = directionString.split(' ');
	// 			if(allWords.indexOf(dir.label) > -1) {
	// 				var id = (currentRoom.x+dir.offset.x)+":"+(currentRoom.y+dir.offset.y)+":"+(currentRoom.z+dir.offset.z);
	// 				exits.push({
	// 					direction: dir.label,
	// 					id: id,
	// 					x: currentRoom.x+dir.offset.x,
	// 					y: currentRoom.y+dir.offset.y,
	// 					z: currentRoom.z+dir.offset.z
	// 				});
	// 				areaRooms.addRoom({
	// 					id: id,
	// 					explored: false,
	// 					exits: [],
	// 					x: currentRoom.x+dir.offset.x,
	// 					y: currentRoom.y+dir.offset.y,
	// 					z: currentRoom.z+dir.offset.z
	// 				});
	// 			}
	// 			// var re = new RegExp("[\\W,]+("+dir.label+")[\\W,]+.*leading",'i');
	// 			// //console.log(re);
	// 			// var submatch = directionString.match(re);
	// 			// if(submatch) {
	// 			// 	//console.log(submatch);
	// 			// 	var direction = submatch[1];
	// 			// 	direction = direction.replace(/,/g,'');
	// 			// 	direction = direction.replace(/\s/g,'');
	// 			// 	var id = (currentRoom.x+dir.offset.x)+":"+(currentRoom.y+dir.offset.y)+":"+(currentRoom.z+dir.offset.z);
	// 			// 	exits.push({
	// 			// 		direction: direction,
	// 			// 		id: id
	// 			// 	});
	// 			// 	rooms.push({
	// 			// 		id: id,
	// 			// 		explored: false,
	// 			// 		exits: []
	// 			// 	})
	// 			// }
	// 		}
	// 		debug("found exits: "+exits.length+ " -> "+totalExits);
	// 		if(exits.length < totalExits) {
	// 			debug("NOT ENOUGH EXITS.  Only found "+exits.length+" but needed "+totalExits+" "+match[1]);
	// 			exits.forEach(function(e) {
	// 				console.log(e);
	// 			});
	// 		}
	// 		if(exits.length > totalExits) {
	// 			debug("TOO MANY EXITS.  Found "+exits.length+" but only needed "+totalExits+" "+match[1]);
	// 			exits.forEach(function(e) {
	// 				console.log(e);
	// 			});
	// 		}
			
	// 		var currentRoomId = currentRoom.x+":"+currentRoom.y+":"+currentRoom.z;
	// 		areaRooms.addRoom({
	// 			id: currentRoomId,
	// 			explored: true,
	// 			exits: exits,
	// 			x: currentRoom.x,
	// 			y: currentRoom.y,
	// 			z: currentRoom.z,
	// 		});
			
	// 		var exit = areaRooms.getClosestUnexploredRoom(currentRoomId,[]);
	// 		console.log("nearest unexplored exit",exit);
	// 		if(!exit) {
	// 			areaRooms.printRooms();
	// 			return;
	// 		}
	// 		app.get("character").currentRoom = exit;
	// 		// var filteredRooms = rooms.filter(function(room){
	// 		// 	if(room.id == currentRoom.x+":"+currentRoom.y+":"+currentRoom.z) {
	// 		// 		return room;
	// 		// 	}
	// 		// });
	// 		// console.log(filteredRooms);
	// 		// if(filteredRooms.length == 0) {
	// 		// 	rooms.push({
	// 		// 		id: currentRoom.x+":"+currentRoom.y+":"+currentRoom.z,
	// 		// 		explored: true,
	// 		// 		exits: exits,
	// 		// 	});	
	// 		// }
			
	// 		app.get('actionClient').publish('actions','go '+exit.direction);
	// 		reEvent.reset().action();
	// 	}
	// });
	//app.get('eventHandler').addEvent(reEvent);
	// app.get('eventHandler').addEvent(new RecurringEvent({ 
	// 	title: 'Buy Phlog', 
	// 	intervalPeriod: 60000,
	// 	timeout: 30000,
	// 	regex: false,
	// 	completed: true,
	// 	action: function() {
	// 		app.get('actionClient').publish('actions','5buy vial');
	// 	}
	// }));
    var reEvent = new RecurringEvent({ 
		title: 'Recharge Goetia', 
		intervalPeriod: 30000,
		timeout: 10000,
		regex: false,
		completed: true,
		action: function() {
			var energies = app.get('character').energies;
            console.log("FUCK YOU2")
            if(energies.Goetic) {
                console.log('current geoetic energy', energies.Goetic.current);    
            }
			if(energies.Goetic && energies.Goetic.current < 50) {
				debug('we need more goetic energy');
				app.get('actionClient').publish('actions','rest');
				app.get('actionClient').publish('actions','re');
			}
		}
	});
    app.get('eventHandler').addEvent(reEvent);
	app.get('eventHandler').addEvent(new RecurringEvent({ 
        title: 'Floraphrasty', 
		intervalPeriod: 30000,
		timeout: 20000,
		regex: /You are a.*floraphrast \((\d+)\)./i,
		action: function() {
			app.get('actionClient').publish('actions','skill floraphrasty');
		},
		success: function(match) {
			debug('got floraphrasty value of '+match[1]);
			app.get('character').skills.floraphrasty = match[1];
			var sockets = app.get('sockets');
			for(var i in sockets) {
				var socket = sockets[i];
				socket.emit('status', { status: app.get('character') });
			}
		}
	}));
	
	app.get('eventHandler').addEvent(new RecurringEvent({ 
		title: 'Shillelagh', 
		intervalPeriod: 30000,
		timeout: 20000,
		regex: false,
		completed: true,
		action: function() {
			app.get('actionClient').publish('actions','clubbit');
		}
	}));
	app.get('eventHandler').addEvent(new RecurringEvent({ 
		title: 'Death', 
		intervalPeriod: 10000,
		timeout: 30000,
		regex: false,
		completed: true,
		action: function() {
			app.get('actionClient').publish('actions','sum');
			app.get('actionClient').publish('actions','te thanaturgy');
		}
	}));
	app.get('eventHandler').addEvent(new RecurringEvent({ 
		title: 'Eat', 
		intervalPeriod: 60000,
		timeout: 30000,
		regex: false,
		completed: true,
		action: function() {
			if(app.get('character').hunger.type == 'hungry') {
				debug('EATING');
				app.get('actionClient').publish('actions','eats');
			}
			if(app.get('character').thirst.type == 'thirsty') {
				debug('DRINKING');
				app.get('actionClient').publish('actions','eats');
			}
		}
	}));
	app.get('eventHandler').addEvent(new RecurringEvent({ 
		title: 'Hunger', 
		intervalPeriod: 60000,
		timeout: 30000,
		regex: /You are (.*) (hungry|satiated)./i,
		action: function() {
			app.get('actionClient').publish('actions','show hunger');
		},
		success: function(match) {
			debug('got hunger value of '+match[1]+' '+match[2]);
			app.get('character').hunger = { level: match[1], type: match[2]}
			var sockets = app.get('sockets');
			for(var i in sockets) {
				var socket = sockets[i];
				socket.emit('status', { status: app.get('character') });
			}
		}
	}));
	app.get('eventHandler').addEvent(new RecurringEvent({ 
		title: 'Thirst', 
		intervalPeriod: 60000,
		timeout: 30000,
		regex: /You are (.*) (quenched|thirsty)./i,
		action: function() {
			app.get('actionClient').publish('actions','show thirst');
		},
		success: function(match) {
			debug('got thist value of '+match[1]+' '+match[2]);
			app.get('character').thirst = { level: match[1], type: match[2]}
			var sockets = app.get('sockets');
			for(var i in sockets) {
				var socket = sockets[i];
				socket.emit('status', { status: app.get('character') });
			}
		}
	}));
	app.get('eventHandler').addEvent(new RecurringEvent({ 
		title: 'Wealth', 
		intervalPeriod: 100000,
		timeout: 30000,
		regex: /You have (.*) coins./i,
		action: function() {
			app.get('actionClient').publish('actions','show wealth');
		},
		success: function(match) {
			app.get('character').wealth = parseStringToNumber(match[1]);
			var sockets = app.get('sockets');
			for(var i in sockets) {
				var socket = sockets[i];
				socket.emit('status', { status: app.get('character') });
			}
		}
	}));
	app.get('eventHandler').addEvent(new RecurringEvent({ 
		title: 'Race', 
		intervalPeriod: 60000,
		timeout: 30000,
		regex: /You are an? (.*)./i,
		action: function() {
			app.get('actionClient').publish('actions','show race');
		},
		success: function(match) { 
			app.get('character').race = match[1];
			var sockets = app.get('sockets');
			for(var i in sockets) {
				var socket = sockets[i];
				socket.emit('status', { status: app.get('character') });
			}
		}
	}));
	app.get('eventHandler').addEvent(new RecurringEvent({ 
		title: 'Energies', 
		intervalPeriod: 30000,
		timeout: 20000,
		regex: /Energies of/i,
		action: function() {
			app.get('actionClient').publish('actions','show energies');
		},
		success: function(results) { 
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
				app.get('character').energies[type] = {
					"current" : current,
					"maximum" : maximum,
					"percent" : percent
				}
			}
            // var energies = app.get('character').energies;
            // console.log("FUCK YOU")
            // if(energies.Goetic) {
            //     console.log('current geoetic energy', energies.Goetic.current);    
            // }
            // if(energies.Goetic && energies.Goetic.current < 50) {
			// 	debug('we need more goetic energy');
			// 	app.get('actionClient').publish('actions','rest');
			// 	app.get('actionClient').publish('actions','re');
            //     app.get('actionClient').publish('actions','show energies');
			// }
			var sockets = app.get('sockets');
			for(var i in sockets) {
				var socket = sockets[i];
				socket.emit('status', { status: app.get('character') });
			}
		}
	}));
}