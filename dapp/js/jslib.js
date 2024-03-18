
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
	
	//Is it a number..
	var isnumber = (val == +val); 
	
	return isnumber;
}

function checkIsPositiveNumber(val){
	if(!checkIsNumber(val)){
		return false
	}
	
	var ispositive = (+val>0); 
	
	return ispositive;
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toFixedNumber(number){
	return +Number.parseFloat(number).toFixed(4);
}

function getCurrentUnixTime(){
	return Math.floor(new Date().getTime() / 1000);
}

function getDateString(dateobj){
	var year 	= dateobj.getFullYear();
	var month 	= dateobj.getMonth()+1;
	var day 	= dateobj.getDate();
	var hour	= dateobj.getHours();
	var mins	= dateobj.getMinutes();
	
	return day+"/"+month+"/"+year+" "+hour+":"+mins;
}

//Send a message to the back end
function sendBackendMSG(jsonmsg,callback){
	MDS.comms.solo(JSON.stringify(jsonmsg),function(resp){
		if(callback){
			callback(resp);	
		}
	});
}

function sendSimpleBackendMSG(title,callback){
	var message 			= {};
	message.action			= title;
	MDS.comms.solo(JSON.stringify(message),function(resp){
		if(callback){
			callback(resp);	
		}
	});
}

//Send a message to the front end
function sendFrontendMSG(title, msg, callback){
	
	var comms 		= {};
	comms.action 	= "FRONTENDMSG";
	comms.title 	= title;
	comms.message	= msg;
	
	//Log it..
	MDS.log("Send FRONTEND Message : "+JSON.stringify(comms));
	
	MDS.comms.solo(JSON.stringify(comms),function(resp){
		if(callback){
			callback(resp);	
		}
	});
}