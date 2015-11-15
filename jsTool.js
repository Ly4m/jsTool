var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var scopeChaine = [];
var typeChaine = [];

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
			
			console.log("il faut changer", leftType, "==", rightType);
		} else {
			console.log("il ne faut pas changer", leftType, "==", rightType);
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

function printScope(scope, node){
	var varsDisplay = scope.join(', ');
	if(node.type === 'Program'){
		console.log('Variable définies dans le scope global :', varsDisplay);
	} else {
		if(node.id && node.id.name){
			console.log('Variables declared in the function ' + node.id.name + '();', varsDisplay);
		} else {
			console.log('Variables declared in anonymous function:', varsDisplay);
		}
	}
}

function isVarDefined(varname, scopeChaine){
	for(var i = 0; i < scopeChaine.length; i++){
		var scope = scopeChaine[i];
		if(scope.indexOf(varname) !== -1){
			return true;
		}
	}
	return false;
}