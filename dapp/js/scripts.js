
//Main Native Minima address is of this type
var MAIN_ADDRESS 	= "LET type=[bridge address] RETURN SIGNEDBY(*)";

//Minima HTLC contract - with notification coin
var HTLC_CONTRACT 	= "LET owner=PREVSTATE(0) LET requestamount=PREVSTATE(1) LET requesttoken=PREVSTATE(2) LET timelock=PREVSTATE(3) LET counterparty=PREVSTATE(4) LET hash=PREVSTATE(5) IF SIGNEDBY(owner) AND (@BLOCK GT timelock) THEN RETURN TRUE ENDIF LET secret=STATE(100) ASSERT SIGNEDBY(counterparty) AND (SHA2(secret) EQ hash) ASSERT STATE(101) EQ hash ASSERT STATE(102) EQ STRING(owner) ASSERT STATE(103) EQ STRING(counterparty) RETURN VERIFYOUT(@INPUT 0xFFEEDD9999 0.0001 @TOKENID TRUE)";
var HTLC_ADDRESS 	= "MxG083ZTKH1P85DJNRWA1T59FWG8DQG4743GUN3UK3V2JUDMWG1T5S8T9N4MHRD"

function setUpHTLCScript(callback){
	MDS.cmd("newscript script:\""+HTLC_CONTRACT+"\" trackall:false",function(resp){
		if(callback){
			callback(resp);
		}
	});
}