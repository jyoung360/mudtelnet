var runIt = () => {
	for(var i = 0; i < 100; i++) {
		setTimeout((i) => { console.log(i)}, i * 1000, i);
	}
}

var runIt2 = () => {
	var i = 0;
	setInterval(() => { console.log(i++); }, 1000);
}
runIt2();
