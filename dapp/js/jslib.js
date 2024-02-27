
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
	
	if(val == ""){
		return false;
	}
	
	return (val == +val);
}

function checkIsPositiveNumber(val){
	if(!checkIsNumber(val)){
		return false
	}
	
	return (+val>0);
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toFixedNumber(number){
	return +Number.parseFloat(number).toFixed(2);
}

function getDateString(dateobj){
	var year 	= dateobj.getFullYear();
	var month 	= dateobj.getMonth()+1;
	var day 	= dateobj.getDate();
	var hour	= dateobj.getHours();
	var mins	= dateobj.getMinutes();
	
	return day+"/"+month+"/"+year+" "+hour+":"+mins;
}