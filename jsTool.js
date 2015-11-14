var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var scopeChaine = [];

var filename = process.argv[2];
console.log("analyse :", filename);
var ast = esprima.parse(fs.readFileSync(filename));

/*
console.log("================= A S T ======================");
console.log(JSON.stringify(ast, null , 4));
console.log("==============================================");
*/

estraverse.traverse(ast, {
	enter: function(node){

		if(createsNewScope(node)){
			scopeChaine.push([]);
		}

		if(node.type === 'VariableDeclarator'){
			var currentScope = scopeChaine[scopeChaine.length - 1];
			currentScope.push(node.id.name);
		}
	},

	leave: function(node){

		leave(node);

	}
});

function createsNewScope(node){
	return node.type === 'FunctionDeclaration' || 
		   node.type === 'FunctionExpression' ||
		   node.type === 'Program'; 
}

function leave(node){
	if(createsNewScope(node)){
		var currentScope = scopeChaine.pop();
		console.log(currentScope);
	}
}