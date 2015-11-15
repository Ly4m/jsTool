var x = 2;

var y = 3;

function maFonction(){
	var z = 1;

	(function g(){
		var d = "yo";

		if(d == z){
			console.log("test KO");
		}

	}());

	if(z == y){
		console.log("test OK");
	}
}