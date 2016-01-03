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
		console.log(matchPhrase);
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
	
}