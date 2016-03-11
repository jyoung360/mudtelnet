var debug = require('debug')('mudtelnet:triggers');
var app = undefined;
var parseStringToNumber = require('../lib/utilities.js').parseStringToNumber;

var phrases = ['O Aeda, we sing praises to you, who is the voice of the trees',
	'As the earth of the world is your flesh, so are we your hands',
	'As the air of the world is your breath, so are we your words',
	'As the waters of the world are your blood, so are we your pain',
	'O Aeda, we sing praises to you, who is the bones of the world',
	'Though your work is dangerous, we shall not fear',
	'Though your tasks are difficult, we shall not shirk',
	'Though your edicts are firm, we shall be gentle',
	'Though your will is eternal, we shall strive to live freely',
	'Through your patience, we are made worthy of your grace',
	'Through your wisdom, you safeguard us from our ignorance',
	'Through your kindness, you forgive us our failings',
	'O Aeda, we sing praises to you, who is the kiss of the wind',
	'From the East, I seek the lessons of childhood',
	'From the South, I seek the ways of questioning',
	'From the West, I affirm my responsibility and duty',
	'From the North, I look for the strength of balance',
	'O Aeda, we sing praises to you, who is the embrace of the ocean',
	'In life, we are given grace',
	'In living, we are given purpose',
	'In dying, we nourish those who follow',
	'As you are, so shall we ever be, together as a spiral',
	'From the first day to the last, while the world remains'
];

var Trigger = function(options) {
	var self = this;
	this.title = options.title || 'Default Trigger';
	this.match = options.match || function(string) {
			return true;
		}
	;
	this.success = function(match) {
		debug('Performing success '+self.title);
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
}

module.exports = function(a) {
	app = a;
	phrases.forEach(function(phrase) {
		//var lastPart = phrase.split(',').pop().trim();
		var lastPart = phrase;
		var lastWord = lastPart.split(' ').pop().trim();
		var matchPhrase = lastPart.split(' ').slice(0,-1).join(' ')+'\.\.\.';
		var regex = new RegExp(matchPhrase,'i');
		app.get('triggerHandler').addTrigger(new Trigger({ 
			title: matchPhrase, 
			match: function(message) {
				
				if(match = message.match(regex)) {
					if(match[0].indexOf('...') == -1) {
						return false;
					}
					// if(match2 = message.match(/You murmuringly say,/i)) {
					
					// }
					debug('found trigger '+this.title);
					match.response = lastWord;
					return match;
				}
				return false;
			},
			success: function(match) {
				app.get('actionClient').publish('actions','subvocalize '+match.response);
			}
		}));
	});
    
    
    
    app.get('triggerHandler').addTrigger(new Trigger({ 
		title: 'Verdant Eruption', 
		match: function(message) {
            var regex = /You feel Aeda's knowledge and strength well up within you, filling you with the power of the ancient forests and reefs/i;
            if(match = message.match(regex)) {
                return match;
            }
		},
		success: function(results) { 
            console.log('got verdant eruption');
            setTimeout(function() {
                app.get('actionClient').publish('actions','say I can cast Verdant Eruption in 4 minutes.');
            }, 60*1000*1);
            setTimeout(function() {
                app.get('actionClient').publish('actions','say I can cast Verdant Eruption in 3 minutes.');
            }, 60*1000*2);
            setTimeout(function() {
                app.get('actionClient').publish('actions','say I can cast Verdant Eruption in 2 minutes.');
            }, 60*1000*3);
            setTimeout(function() {
                app.get('actionClient').publish('actions','say I can cast Verdant Eruption in 1 minute.');
            }, 60*1000*4);
            setTimeout(function() {
                app.get('actionClient').publish('actions','say I am ready to cast Verdant Eruption again.');
            }, 60*1000*5);
		}
	}));
    
    app.get('triggerHandler').addTrigger(new Trigger({ 
		title: 'Banish Undead', 
		match: function(message) {
            var regex = /You shout stridently, calling forth Aeda's cleansing wrath upon the undead/i;
            if(match = message.match(regex)) {
                return match;
            }
		},
		success: function(results) { 
            console.log('got banish undead');
            setTimeout(function() {
                app.get('actionClient').publish('actions','say I am ready to cast Banish Undead again.');
            }, 60*1000*5);
		}
	}));
    
//     >- Trade Skills --------------------------------------------------------------<
// |  Appraisal                                     Unpracticed [  22 ]          |
// |  Finance                                       Unpracticed [  27 ]          |
// |  Firefighting                             Fairly Competent [  34 ]          |
// |  Livestock Breeding                                  Inept [  14 ]          |
// |  Navigation                                          Inept [  17 ]          |
// |  Torture                                       Unpracticed [  22 ]          |
// \-----------------------------------------------------------------------------/

    app.get('triggerHandler').addTrigger(new Trigger({ 
		title: 'Skills', 
		match: function(message) {
            var regex = /\|.*\|.*/i;
            if(match = message.match(regex)) {
                return match;
            }
		},
		success: function(results) { 
            var splitResults = results[0].split("| |");
            for(var i in splitResults) {
                var pointsRegex = /(\d+)/i;
                var skillRegex = /\s*(\w+(\s\w+)?)\s+/i;
                var points = undefined;
                if(match = splitResults[i].match(pointsRegex)) {
                    points = parseInt(match[1],10);
                }
                if(points && points > 0) {
                    if(match = splitResults[i].match(skillRegex)) {
                        var skill = match[1];
                        var currentPoints = app.get('character').skills[skill];
                        if(currentPoints && points > currentPoints) {
                            console.log("Skill %s increased from %s to %s",skill,currentPoints,points);
                        }
                        if(currentPoints && points < currentPoints) {
                            console.log("Skill %s decreased from %s to %s",skill,currentPoints,points);
                        }
                        app.get('character').skills[skill] = points;
                    }
                }
            }
		}
	}));
    
    app.get('triggerHandler').addTrigger(new Trigger({ 
		title: 'Energies', 
		match: function(message) {
            var regex = /Energies of/i;
            if(match = message.match(regex)) {
                return match;
            }
			//app.get('actionClient').publish('actions','show energies');
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