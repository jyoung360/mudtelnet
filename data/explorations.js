var explorations = {
	"Losthaven": ["go ei, e, s, n, e, n, 2s, n, e, n, e, w, n, w, 3e, n, e, 2s, w, n, 2w, 4n, 6s, e, n, 5s, n, 3w, e, 2n, 2s, 5e, s, e, s, e, 3w, e, 2n, 6e, s, w, e, 2n, s, 2w, n, 2s, n, 2w, n, e, w, n, e, w, 2n, w, e, 2n, s, e, w, 2s, w, n, 2s, n, w, n, e, w, n, e, 2w, e, s, w, n, s, 2w, e, 2s, e, 2s, e, 2w, n, s, e, n, 2w, s, n, e, n, w, n, s, 5e, n, 2s, n, e, n, 2s, n, e, n, 2s, n, e, s, n, 2e"]
	, "Catelius Minor": ["go e, 2e, n, 2w, 2s, 2e, n, 3w"]
	, "The Hall of Legends": ["go s, s, n, u, 2d, u, w, 2e, w, n"]
	, "Losthaven Arena": ["go w, 2w, e, s, nw, se, sw, w, e, ne, 2n, nw, w, e, se, s, 2e",
						"go e, se, 2s, sw, 2w, nw, 2n, ne, e, d"]
	, "Losthaven Palace": ["go n, n, 2w, 4e, n, 4w, n, 4e, 2w, n, w, 2e, w, n, 3e, 2n, w, 2s, 3w, n, 2w, e, 2s, 2n, e, 3s, sw, 2w, 2e, ne, 2n, e, 2n, 8s"]
	, "Losthaven Sewers": ["go d, w, e, 7n, 4s, 3e, s, 3n, 2s, 6e, 10w, n, s, 8w, 4e, 5n, w, 2e, w, 4n, s, w, 2e, w, 8s, 5e, 3s, u"]
	, "Shrieking Siren": ["go eu, n, ne, se, u, d, 2s, sw, nw, u, d, ei, d, s, n, e, 2w, e, n, w, 2e, w, n, e, 2w, e, n, w, 2e, w, n, s, d, 4s, 5n, s, 2u, w, s, wd"]
	, "Temple Bloodmoon": ["go wi, w, s, in, s, n, out, 2n, in, 4e, 5d, w, n, s, w, s, n, w, n, s, 2w, n, s, w, s, n, w, n, s, 2w, 5u, 4e, out, s, w, in, 2w, n, s, 3w, 2n, w, 2e, w, n, w, 2e, w, n, w, 2e, w, n, w, 2e, w, 7s, w, 2e, w, s, w, 2e, w, s, w, 2e, w, s, w, 2e, w, 5n, 3u, 2n, w, 2e, w, n, w, 2e, w, n, w, 2e, w, n, w, 2e, w, 7s, w, 2e, w, s, w, 2e, w, s, w, 2e, w, s, w, 2e, w, 5n, 3d, 5e, out, 2e, eo"]
	, "Jhan": ["go 2in!"
				,"go e, w, 5n, 2s, w, n, 2s, n, w, n, s, nw, se, 2s, 2n, w, n, 2s, n, w, 5e"
				,"go e!"
				,"go u, 2w, n, 2s, n, w, nw, se, 3e, 2u, n, w, e, n, 3w, 2n, s, e, 2w, e, 2s, w, e, n, 3e, 2s, 3d, 6w"
				,"enter hole"
				,"go 2d, w, 4e, w, 2d, 2s, in, 2d, w, n, w, e, 2s, e, 2w, e, n, 3w, 4e, 2u, out, 2n, 2u, 2w, 2u, out, 4e, 3s, 2out"]
	, "Ivory Tower": ["go ni, w, n, 2e, 2s, 2w, n, e, nwu, w, 2e, w, n, 2s, n, nwu, w, n, 2s, n, e, n, 2s, n, e, n, 2s, n, w, neu, n, 2s, n, w, 2e, w, swd, 2sed, so"]
	, "Camille": ["go ei, e, n, 2s, n, e, s, 2n, u, d, s, e, n, u, d, 3s, e, w, s, e, w, s, w, s, e, n, 3s, n, 3w, e, s, n, 6e, s, w, e, n, e, 2s, w, s, n, 2w, s, n, 5e, s, n, 2w, 2n, 6e, 3w, 4n, w"
				, "go 2s, n, w, e, n"
				, "go e, 7n, s, e, w, 3s, 2e, 2n, 2s, 2e, s, n, 2e, s, n, e, 8w, 2s, u, 2n, d, n, 5w, 5n, 2s, 2w, 2n, s, e, n, 2s, n, w, s, 2e, 3s, w, n, s, 5w"
				]
	, "Rukhan" : ["go ni, d, n, w, s, w, e, s, e, s, n, e, 2n, ne, sw, wd, n, s, w, s, w, e, s, sw, w, s, e, nw, e, n, ne, 2e, se, nw, 2n, wd, n, s, eu, 2s, 2w, 2n, e, eu, 2s, 2w, 2n, e, eu, so"]
	, "Fort Shaataari" : ["go 2in, n, 2s, n, 2w, u, d, n, e, n, w, n, 2s, n, u, n, 2s, n, d, e, 2n, w, u, d, s, e, 3s, 3e, u, d, n, w, n, e, w, 2n, e, u, d, s, 2w, s, 2n, w, 2n, 2s, e, n, e, s, n"
						, "go w, n, e, u, 2w, e, s, e, 2w, e, s, e, 2w, e, 2n, e, d, w, 4n, 2w, e, n, w, 2e, n, se, 2e, 2w, s, e, 2w, 7s, w, 3s, e, 2out"]
	, "Jacks Farm": ["go nwi, w, 2e, w, n, w, 2e, w, n, eu, e, n, 2s, n, e, n, 2s, n, e, n, 2s, n, 3w, d, 2n, e, s, 2e, n, 3s, n, 2w, s, e, w, s, w, e, 2n, 3e, 5n, 2d, 2u, n, w, s, w, n, w, s, w, n, 4s, 4e, w, n, e, n, s, w, s, w, n, w, e, s, 3w, 2n, 3s, w, 2n, w, 3s, nw, 3n, sw, 2s, sw, 3n, nw, 3s, sw, 3n, 7e, s, e, 4s, se"
					,"go s, 4e, w, n, e, n, s, w, s, w, n, w, e, s, 3w, 2n, 3s, w, 2n, w, 3s, nw, 3n, sw, 2s, sw, 3n, nw, 3s, sw, 3n, 7e, s, e, 4s, se"]	
	, "Shatterspire" : ["go ni, 2n, 4u, 2e, s, n, e, n, s, 2e, 5w, u, e, ne, se, 2e, 2w, nw, sw, w, 2u, 3n, w, e, n, w, e, n, ne, e, w, sw, nw, 2n, 2s, w, e, se, 5s, u, 3n, 3s, u, 3s, 3n, 9d, 2s, so"]
	, "Stillwater" : ["go in, 3e, n, s, e, s, n, 2e, s, n, e, n, s, e, n, 2s, n, e, n, 2s, n, e, n, 2s, n, e, 11w, out"]
	, "Halfmoon Bay" : ["go in, s, w, 2e, w, 2s, w, n, s, w, n, 2s, n, w, n, 2s, n, w, e, nw, n, s, se, 3e, 2s, e, s, n, e, n, s, 2e, s, n, e, n, s, e, s, w, e, s, e, w, 2s, w, e, s, e, w, s, 3w, n, e, w, n, w, e, 2n, e, w, n, w, e, n, 3w, s, w, e, s, e, w, 2s, w, e, s, e, w, s, 3w, n, e, w, n, w, e, 2n, e, w, n, w, e, n, 3w, s, w, e, s, e, w, s, w, e, s, w, e, s, e, w, s, e, s, n, e, n, s, 2e, s, n, e, n, s, 2e, s, n, e, n, s, 2e, s, n, e, n, s, e, 3n, w, n, s, w, s, n, 2w, n, s, w, s, n, 2w, n, s, w, s, n, 2w, n, s, w, s, n, w, 3n, e, s, n, e, n, s, 2e, s, n, e, n, s, 7e, 3s, 3e, 2n, w, e, 7s, n, w, e, 4n, 3w, 3n, 6w, 5n, out"]
	, "Camelot" : ["go in, d, u, n, e, n, 2s, n, e, s, 2n, w, e, s, e, n, 2s, n, e, s, 3n, e, w, 2s, e, n, 2s, n, e, 6w, s, 2w, e, sw, ne, s, w, 2s, e, n, s, e, 2n, w, 2n, w, e, 2n, e, w, n, nw, se, e, ne, u, sw, s, w, s, n, e, s, d, s, e, w, n, e, w, n, e, w, n, e, w, n, e, w, 3s, d, 2w, s, n, sw, ne, n, nw, se, s, e, n, 2e, n, e, 2w, e, n, e, 2w, e, n, e, 2w, e, 4s, w, d, w, 4s, e, out"]
	, "Muspelheim" : ["go id, 3s, 4w, s, 2w, 3s, 2w, 2s, 2e, d, n, w, 4e, n, e, 8w, 2s, e, s, 3e, 4n, 4e, w, n, 2w, e, 2n, 2e, 2n, 2e, w, n, 2w, s, w, n, 2w, e, 2s, w, s, 2w, 2s, n, e, 2w, e, d, w, 2s, 7e, 2s, e, s, n, w, 2n, 2w, 2s, w, s, w, e, n, e, 2n, 5w, 2n, e, 2n, w, n, 2u, 6e, w, n, 2w, 2s, w, s, 2w, s, e, s, w, s, n, w, n, 2e, n, e, 2n, 2w, 2d, n, 3e, 4s, e, 2n, s, e, s, e, 2n, e, 2s, e, w, 3n, d"
					, "go 6s, e, n, 3w, 2e, 3n, 2w, n, 2s, w, 3n, 2w, 3s, w, 2n, 2e, 8s, e, 3n, s, e, s, e, 7w, n, 5e, n, 4w, e, 3s, u, 2n, e, 2w, s, e, s, d, 3n, 2e, n, d, n, e, 3w, 2e, 2s, e, 2w, s, w, 2e, 2s, 2w, 2e, n, 2e, w, n, 4e, 2n, w, 2n, e, 8w, n, 8e, w, n, 4w, 4e, 2n, 7w, 4s, 3e, 2s, u, 3n, 4e, 2n, u, 2s, 4w, 3n, 3w, 2s, e, 2s, u, n, 2e, n, e, n, 3e, 2s, e, s, e, 4s, w, s, u, w, n, w, 2n, w, 3n, 4e, 3n, ou"]
	, "Devonshire" : ["go in, n, e, 2w, e, n, 5w, 8e, 5n, 2w, 2s, n, se, d, 5e, 5w, u, nw, n, 6w, ne, sw, 2w, e, 4s, n, e, ne, 2sw, ne, nw, 2se, nw, 4e, 3w, s, 5n, 6w, 9e, n, s, 9e, 12w, 2n, sw, se, 2n, 2s, nw, ne, 4e, se, n, d, 2n, ne, se, sw, w, n, 2s, n, w, n, 2s, n, w, n, 2s, n, w, 4e, ne, nw, sw, 2s, u, s, nw, 4w, n, w, 2e, w, n, out"]
	, "Evandim" : ["go in, 3e, 2n, e, se, s, n, nw, e, n, s, e, ne, sw, 2s, ne, e, w, sw, s, se, nw, 2w, s, n, w, 2n, 3w, out"]
	, "Nisbet" : ["go in, 4e, s, n, 3e, n, 6w, s, w, 2n, 7w, n, 7w, n, 7w, n, 7w, n, 7w, 6s, 5w, out"]
	, "Shakari" : ["go in, 2d, 2e, n, 2s, n, 3w, e, s, d, s, 3e, w, n, 2s, n, 3w, e, d, s, w, 4e, 2s, n, w, 2e, w, n, 2w, 2s, w, n, s, w, s, n, 2e, 2n, w, n, u, n, u, n, 2u, out, u"]
	, "Silver Keep" : ["go ei, n, 2u, e, d, u, e, n, 2s, n, 2e, n, 2s, n, e, n, s, e, 2w, u, w, e, n, w, e, 2s, n, e, n, 2s, n, 2e, 3w, d, 4w, 2d, s, w"]
}

module.exports = explorations;