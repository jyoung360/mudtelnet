var muds = {
	"localhost" : {
		host: "127.0.0.1",
		port: 3000,
		matches: [
			{
				regex: /Welcome, what is your name?/i,
				callback: function(results,output) {
					output.push("Josh\r\n");
				}
			},
			{
				regex: /Password:/i,
				callback: function(results,output) {
					output.push("password\r\n")
				}
			},
			{
				regex: /(\d+)\/(\d+)(HP)/,
				callback: function(results,output) {
					output.character.health = {
						current : results[1],
						total : results[2],
						percent : ((results[1]/results[2])*100).toFixed(0)
					}
				}
			},
			{
				regex: /Exits:(.*)\]/i,
				callback: function(results,output) {
					var rooms = results[1].split(',');
					//output.exits = rooms;
				}
			},
			{
				regex: /Obvious exits are (.*)/i,
				callback: function(results,output) {
					var validDirections = ['north','south','east','west'];
					var exits = [];
					for(var i in validDirections) {
						var dir = validDirections[i];
						var re = new RegExp("("+dir+")");
						if(match = results[1].match(re)) {
							exits.push(match[1]);
						}
					}
					var item = exits[Math.floor(Math.random()*exits.length)];
					console.log("Exits are currently %s and we will go %s",exits,item);
					output.push("go "+item+"\n");
					output.exits = exits;
				}
			}
		]
	},
	"lostsouls" : {
		host: "lostsouls.org",
		port: 23,
		matches: [
			{
				regex: /Name:/i,
				callback: function(results,output) {
				}
			},
			{
				regex: /Password:/i,
				callback: function(results,output) {
				}
			},
			{
				regex: /Incarnate as Orca/i,
				callback: function(results,output) {
					output.push("2\n")
				}
			},
			{
				regex: /Body: (\d+)\/(\d+)/,
				callback: function(results,output) {
					output.character.health = {
						current : results[1],
						total : results[2],
						percent : ((results[1]/results[2])*100).toFixed(0)
					}
				}
			},
			{
				regex: /Obvious exits are (.*)/i,
				callback: function(results,output) {
					var validDirections = ['north','south','east','west'];
					var exits = [];
					for(var i in validDirections) {
						var dir = validDirections[i];
						var re = new RegExp("("+dir+")");
						if(match = results[1].match(re)) {
							exits.push(match[1]);
						}
					}

					if(match = results[1].match(/(up)/)) {
						output.push("go up\n");
					}
					else {
						var item = exits[Math.floor(Math.random()*exits.length)];
						console.log("Exits are currently %s and we will go %s",exits,item);
						output.push("go "+item+"\n");
						output.exits = exits;
					}
				}
			}
		]
	}
}

function getMud(mudname) {
	return muds[mudname];
}

exports.getMud = getMud;
