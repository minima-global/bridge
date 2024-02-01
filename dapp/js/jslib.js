
/**
 * Some UTIL functions
 */
function encodeStringForDB(str){
	return encodeURIComponent(str).split("'").join("%27");
}

function decodeStringFromDB(str){
	return decodeURIComponent(str).split("%27").join("'");
}

function stripBrackets(coinstr){
	
	if(!coinstr){
		return "";
	}
	
	var str = coinstr.trim();
	if(str.startsWith("[")){
		str = str.substring(1);
	}
	
	if(str.endsWith("]")){
		str = str.substring(0,str.length-1);
	}
	
	return str;
}

function hashString(str){
	return 	"0x"+sha1(str).toUpperCase();
}

function checkIsNumber(val){
	if(val == null){
		return false;
	}
	
	return (val == +val);
}

function checkIsPositiveNumber(val){
	if(!checkIsNumber(val)){
		return false
	}
	
	return (val>0);
}

//Get the current block
function getCurrentBlock(callback){
	MDS.cmd("block",function(resp){
		callback(resp.response.block);
	});
}