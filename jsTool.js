var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

var scopeChaine = [];
var typeChaine = [];

var filename = process.argv[2];
//console.log("analyse :", filename);
var ast = esprima.parse(fs.readFileSync(filename), {loc: true});


//console.log("================= A S T ======================");
//console.log(JSON.stringify(ast, null , 4));
//console.log("==============================================");


estraverse.traverse(ast, {
	enter: function(node){

		if(createsNewScope(node)){
			scopeChaine.push([]);
			typeChaine.push([]);
		}

		if(node.type === 'VariableDeclarator'){
			var currentScope = scopeChaine[scopeChaine.length - 1];
			var currentScopeType = typeChaine[typeChaine.length -1];
			currentScope.push(node.id.name);
			currentScopeType.push(typeof node.init.value);
		}
	},

	leave: function(node){

		leave(node);
		ifFix(node);

	}
});


function ifFix(node){

	if(node.type === 'IfStatement' && node.test.operator === "=="){
		
		var leftType = node.test.left.value;
		
		if(leftType != undefined){
			leftType = typeof leftType;
		} else {
			leftType = typeLookUp(node.test.left.name);
		}

		var rightType = node.test.right.value;
	
		if(rightType != undefined){
			rightType = typeof rightType;
		} else {
			rightType = typeLookUp(node.test.right.name);
		}

		if(leftType == rightType){
			console.log(node.test.loc.end.line, node.test.left.loc.end.column, node.test.right.loc.start.column);
			//node.test.operator = "===";
			//var regenerated_code = escodegen.generate(ast);
			//console.log(regenerated_code);
		}

		
	}
}

function typeLookUp(name){
	for (i = scopeChaine.length - 1;  i >= 0 ; i-- ){
		
		var indexVar = scopeChaine[i].indexOf(name);
		
		if(indexVar != -1){
			return typeChaine[i][indexVar];
		}
	}
}

function createsNewScope(node){
	return node.type === 'FunctionDeclaration' || 
		   node.type === 'FunctionExpression' ||
		   node.type === 'Program'; 
}

function leave(node){
	if(createsNewScope(node)){
		var currentScope = scopeChaine.pop();
		var currentScopeType = typeChaine.pop();
		//printScope(currentScope, node);
	}
}
