var debug = require('debug')('mudtelnet:triggers');
var fs = require('fs');
var app = undefined;
var parseStringToNumber = require('../lib/utilities.js').parseStringToNumber;
var knownMessages = [];
fs.readFile('known_messages.json', function(err, data) {
  if (err) {
    return console.log(err);
  }
  try {
    knownMessages = JSON.parse(data);
    console.log(`I know ${knownMessages.length} messages`);
  } catch (e) {
    console.log(e);
  }
});

// var natural = require('natural'),
//   classifier = null;

// natural.BayesClassifier.load('classifier.json', null, function(err, c) {
// 	if(err) {
// 		classifier = new natural.BayesClassifier();
// 	}
// 	else {
// 		classifier = c;
// 	}
// });

// classifier.events.on('trainedWithDocument', function (obj) {
// //    console.log(obj);
//    /* {
//    *   total: 23 // There are 23 total documents being trained against
//    *   index: 12 // The index/number of the document that's just been trained against
//    *   doc: {...} // The document that has just been indexed
//    *  }
//    */
// });

var phrases = [
  'O Aeda, we sing praises to you, who is the voice of the trees',
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
  'From the first day to the last, while the world remains',
];

var Trigger = function(options) {
  var self = this;
  this.title = options.title || 'Default Trigger';
  this.match =
    options.match ||
    function(string) {
      return true;
    };
  this.success = function(match) {
    debug('Performing success ' + self.title);
    if (options.success && typeof options.success == 'function') {
      options.success(match);
    }
    return self;
  };
  this.failure = function() {
    debug('Performing failure ' + self.title);
    if (options.failure && typeof options.failure == 'function') {
      options.failure();
    }
    return self;
  };
  this.toString = function() {
    return self.title;
  };
};

module.exports = function(a) {
  app = a;
  phrases.forEach(function(phrase) {
    //var lastPart = phrase.split(',').pop().trim();
    var lastPart = phrase;
    var lastWord = lastPart
      .split(' ')
      .pop()
      .trim();
    var matchPhrase =
      lastPart
        .split(' ')
        .slice(0, -1)
        .join(' ') + '...';
    var regex = new RegExp(matchPhrase, 'i');
    app.get('triggerHandler').addTrigger(
      new Trigger({
        title: matchPhrase,
        match: function(message) {
          if ((match = message.match(regex))) {
            if (match[0].indexOf('...') == -1) {
              return false;
            }
            // if(match2 = message.match(/You murmuringly say,/i)) {

            // }
            debug('found trigger ' + this.title);
            match.response = lastWord;
            return match;
          }
          return false;
        },
        success: function(match) {
          app.get('actionClient').publish('actions', 'subvocalize ' + match.response);
        },
      })
    );
  });

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Verdant Eruption',
      match: function(message) {
        var regex = /You feel Aeda's knowledge and strength well up within you, filling you with the power of the ancient forests and reefs/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        console.log('got verdant eruption');
        setTimeout(function() {
          app
            .get('actionClient')
            .publish('actions', 'say I can cast Verdant Eruption in 4 minutes.');
        }, 60 * 1000 * 1);
        setTimeout(function() {
          app
            .get('actionClient')
            .publish('actions', 'say I can cast Verdant Eruption in 3 minutes.');
        }, 60 * 1000 * 2);
        setTimeout(function() {
          app
            .get('actionClient')
            .publish('actions', 'say I can cast Verdant Eruption in 2 minutes.');
        }, 60 * 1000 * 3);
        setTimeout(function() {
          app
            .get('actionClient')
            .publish('actions', 'say I can cast Verdant Eruption in 1 minute.');
        }, 60 * 1000 * 4);
        setTimeout(function() {
          app
            .get('actionClient')
            .publish('actions', 'say I am ready to cast Verdant Eruption again.');
        }, 60 * 1000 * 5);
      },
    })
  );

  app.set('rotationCounter', 0);

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'portal',
      match: function(message) {
        var regex = /Your Illuminatorium Oculus glows brightly and a (.*) portal materializes in the air\./i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        console.log('<------  Found right combo  ------>');
        app.set('PortalFound', true);
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'navigation',
      match: function(message) {
        if (app.get('CaptureInput')) {
          app.set('CaptureInputText', `${app.get('CaptureInputText')}${message}\n`);
        }
        var regex = /Symbolic streams flow into your thoughts and present themselves before your mind's eye(.*)/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        app.set('CaptureInput', 'InProgress');
        app.set('CaptureInputText', '');
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'commandprompt',
      match: function(message) {
        var regex = />/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        app.set('CaptureInput', 'Complete');
        // console.log('command prompt found', app.get('CaptureInputText'));
        app.set('CaptureInputText', '');
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'runes',
      match: function(message) {
        var regex = /The first rune is (\w*) and points (\w*).  The second rune is (\w*) and points (\w*).  The third rune is (\w*) and points (\w*)\./i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        if (app.get('PortalFound')) {
          console.log('found me a portals');
          return false;
        }
        var counter = app.get('rotationCounter');
        if (results[2] == 'downward') {
          console.log('flipping first rune');
          app.get('actionClient').publish('actions', 'flip first rune');
          app.get('actionClient').publish('actions', 'enter portal');
          app.get('actionClient').publish('actions', 'l at runes on oculus');
        } else if (results[4] == 'downward') {
          console.log('flipping second rune');
          app.get('actionClient').publish('actions', 'flip second rune');
          app.get('actionClient').publish('actions', 'enter portal');
          app.get('actionClient').publish('actions', 'l at runes on oculus');
        } else if (results[6] == 'downward') {
          console.log('flipping third rune');
          app.get('actionClient').publish('actions', 'flip third rune');
          app.get('actionClient').publish('actions', 'enter portal');
          app.get('actionClient').publish('actions', 'l at runes on oculus');
        } else {
          console.log('just rotatin');
          app.get('actionClient').publish('actions', 'enter portal');
          app.get('actionClient').publish('actions', 'rotate oculus left');
          app.get('actionClient').publish('actions', 'l at runes on oculus');
          counter++;
          if (counter > 4) {
            app.get('actionClient').publish('actions', 'flip oculus');
            counter = 0;
          }
          app.set('rotationCounter', counter);
        }

        // setTimeout(function() {
        //     app.get('actionClient').publish('actions','say I am ready to cast Banish Undead again.');
        // }, 60*1000*5);
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Banish Undead',
      match: function(message) {
        var regex = /You shout stridently, calling forth Aeda's cleansing wrath upon the undead/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        console.log('got banish undead');
        setTimeout(function() {
          app.get('actionClient').publish('actions', 'say I am ready to cast Banish Undead again.');
        }, 60 * 1000 * 5);
      },
    })
  );

  //     >- Trade Skills --------------------------------------------------------------<
  // |  Appraisal                                     Unpracticed [  22 ]          |
  // |  Finance                                       Unpracticed [  27 ]          |
  // |  Firefighting                             Fairly Competent [  34 ]          |
  // |  Livestock Breeding                                  Inept [  14 ]          |
  // |  Navigation                                          Inept [  17 ]          |
  // |  Torture                                       Unpracticed [  22 ]          |
  // \-----------------------------------------------------------------------------/

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Skills',
      match: function(message) {
        var regex = /\|.*\|.*/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        var splitResults = results[0].split('| |');
        for (var i in splitResults) {
          var pointsRegex = /(\d+)/i;
          var skillRegex = /\s*(\w+(\s\w+)?)\s+/i;
          var points = undefined;
          if ((match = splitResults[i].match(pointsRegex))) {
            points = parseInt(match[1], 10);
          }
          if (points && points > 0) {
            if ((match = splitResults[i].match(skillRegex))) {
              var skill = match[1];
              var currentPoints = app.get('character').skills[skill];
              if (currentPoints && points > currentPoints) {
                console.log('Skill %s increased from %s to %s', skill, currentPoints, points);
              }
              if (currentPoints && points < currentPoints) {
                console.log('Skill %s decreased from %s to %s', skill, currentPoints, points);
              }
              app.get('character').skills[skill] = points;
            }
          }
        }
      },
    })
  );
  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'KilledSomething',
      match: function(message) {
        var regex = /The (\w+) dies./i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        console.log(results[1]);
        app.get('environment').living_beings = app
          .get('environment')
          .living_beings.filter(function(item) {
            if (item !== results[1]) return item;
          });
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Missing',
      match: function(message) {
        var regex = /You do not (?:have|see) an? (\w+)/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        console.log(results[1]);
        app.get('environment').contents = app.get('environment').contents.filter(function(item) {
          if (item !== results[1]) return item;
        });
        app.get('environment').living_beings = app
          .get('environment')
          .living_beings.filter(function(item) {
            if (item !== results[1]) return item;
          });
        app.get('environment').gettables = app
          .get('environment')
          .living_beings.filter(function(item) {
            if (item !== results[1]) return item;
          });
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Contents',
      match: function(message) {
        var regex = /You see an? (.*)\./i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        console.log(results);
        app.get('environment').contents.push(results[1]);
        // app.get('actionClient').publish('actions','touch '+results[1]);
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Analyze Living',
      match: function(message) {
        var regex = /The (.*) would need to trust you before you could do that./i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        app.get('didGuess');
        // app.get('actionClient').publish('actions','say killing all');
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Markhov',
      match: function(message) {
        var regex = /\[(\d)\] (.*)/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        try {
          if (knownMessages.indexOf(results[2]) != -1) {
            console.log(`I think it is ${results[1]}`);
            app.set('didGuess', true);
            setTimeout(function() {
              app.get('actionClient').publish('actions', 'sv ' + results[1]);
            }, 1000);
          } else {
            if (!app.get('didGuess') && results[1] == 2) {
              if (app.get('markhovGuessing') === 'yes') {
                console.log(
                  `I didn't guess on 1 and don't know know ${results[2]} so I'm just guessing.`
                );
                app.set('didGuess', true);
                setTimeout(function() {
                  app.get('actionClient').publish('actions', 'sv 1');
                }, 1000);
              } else {
                app.set('didGuess', false);
                app
                  .get('actionClient')
                  .publish('actions', 'concentrate on my own stream of thoughts');
              }

              // app.get('actionClient').publish('actions','concentrate on my own stream of thoughts');
            }
          }
          app.get('current_markov')[results[1]] = {
            statement: results[2],
          };
        } catch (e) {
          console.log(e);
          app.get('current_markov')[results[1]] = {
            statement: results[2],
          };
        }
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Markhov Success',
      match: function(message) {
        var regex = /You sense that you have correctly identified the pure symbolic stream/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        var currentMarkhovs = app.get('current_markov');
        if (!currentMarkhovs[1]) {
          return;
        }
        if (knownMessages.indexOf(currentMarkhovs[1].statement) == -1) {
          knownMessages.push(currentMarkhovs[1].statement);
          console.log(`Adding ${currentMarkhovs[1].statement} to json`);
          fs.writeFileSync('known_messages.json', JSON.stringify(knownMessages));
        }
        app.get('markovs')[1].push({
          quote: app.get('current_markov')[1],
          success: true,
        });
        app.get('markovs')[2].push({
          quote: app.get('current_markov')[2],
          success: false,
        });

        app.set('current_markov', {});

        // classifier.addDocument(app.get('current_markov')[1].statement, 'good');
        // classifier.addDocument(app.get('current_markov')[2].statement, 'bad');
        // classifier.train();
        // classifier.save('classifier.json', function(err, classifier) {
        // });

        app.set('didGuess', false);

        console.log(`I know ${knownMessages.length} messages`);
        // app.get('actionClient').publish('actions','say killing all');
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Markhov Fail',
      match: function(message) {
        var regex = /You sense that you have chosen, incorrectly, a mixed symbolic stream/i;
        if ((match = message.match(regex))) {
          return match;
        }
      },
      success: function(results) {
        var currentMarkhovs = app.get('current_markov');
        if (!currentMarkhovs[2]) {
          return;
        }
        if (knownMessages.indexOf(currentMarkhovs[2].statement) == -1) {
          knownMessages.push(currentMarkhovs[2].statement);
          console.log(`Adding ${currentMarkhovs[2].statement} to json`);
          fs.writeFileSync('known_messages.json', JSON.stringify(knownMessages));
        }
        app.get('markovs')[1].push({
          quote: app.get('current_markov')[1],
          success: false,
        });
        app.get('markovs')[2].push({
          quote: app.get('current_markov')[2],
          success: true,
        });

        app.set('current_markov', {});

        // classifier.addDocument(app.get('current_markov')[1].statement, 'bad');
        // classifier.addDocument(app.get('current_markov')[2].statement, 'good');
        // classifier.train();
        // classifier.save('classifier.json', function(err, classifier) {
        // });
        app.set('didGuess', false);
        console.log(`I know ${knownMessages.length} messages`);
        // app.get('actionClient').publish('actions','say killing all');
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Markhov complete',
      match: function(message) {
        var regex = /You have completed your attempt at separating pure from mixed symbolic-cognitive streams./i;
        if ((match = message.match(regex))) {
          // console.log(match);
          return match;
        }
      },
      success: function(results) {
        app.set('didGuess', false);
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Mortal Wound',
      match: function(message) {
        var regex = /(\S*) has been mortally wounded and will die soon if not aided/i;
        if ((match = message.match(regex))) {
          // console.log(match);
          return match;
        }
      },
      success: function(results) {
        app.get('actionClient').publish('actions', 'po ' + results[1]);
      },
    })
  );

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Process Energy',
      match: function(message) {
        var regex = /\|\s+(\D*)(\d+\.?\d?)\s*(\d+\.?\d+)\s*(\d+\.?\d+%).*\|/i;
        if ((match = message.match(regex))) {
          // console.log(match);
          return match;
        }
      },
      success: function(results) {
        var type = results[1].trim();
        var current = parseFloat(results[2]);
        var maximum = parseFloat(results[3]);
        var percent = parseFloat(results[4].replace('%', ''));
        app.get('character').energies[type] = {
          current: current,
          maximum: maximum,
          percent: percent,
        };
        // app.get('environment').living_beings.push(results[1]);
        // app.get('actionClient').publish('actions','say killing all');
      },
    })
  );

  // app.get('triggerHandler').addTrigger(new Trigger({
  // 	title: 'lump',
  // 	match: function(message) {
  // 		var regex = /lump/i;
  //         if(match = message.match(regex)) {
  // 			// console.log(match);
  //             return match;
  //         }
  // 	},
  // 	success: function(results) {
  // 		app.get('actionClient').publish('actions','stop');
  // 	}
  // }));

  app.get('triggerHandler').addTrigger(
    new Trigger({
      title: 'Energies',
      match: function(message) {
        var regex = /Energies of/i;
        if ((match = message.match(regex))) {
          return match;
        }
        //app.get('actionClient').publish('actions','show energies');
      },
      success: function(results) {
        var matches = results.input.match(/\|(.*?)\|/g);
        for (var i in matches) {
          var match = matches[i];
          var bits = match.split(/\s+/);
          var type = bits[1];
          if (type == 'Type') continue;
          var current = parseFloat(bits[2]);
          var maximum = parseFloat(bits[3]);
          var percent = bits[4] ? parseFloat(bits[4].replace('%', '')) : 0.0;
          app.get('character').energies[type] = {
            current: current,
            maximum: maximum,
            percent: percent,
          };
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
        for (var i in sockets) {
          var socket = sockets[i];
          socket.emit('status', { status: app.get('character') });
        }

        var currentEntropic = app.get('character').energies.Entropic
          ? app.get('character').energies.Entropic.current
          : 0;
        console.log('CURRENT ENTROPIC ', currentEntropic);
        if (currentEntropic > 100) {
          app.get('actionClient').publish('actions', 'buy arrow');
          app.get('actionClient').publish('actions', 'arrs');
        }
      },
    })
  );
};
