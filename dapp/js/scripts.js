
//Main Native Minima address is of this type
var MAIN_ADDRESS 	= "LET type=[bridge address] RETURN SIGNEDBY(*)";

//Minima HTLC contract - with notification coin
var HTLC_CONTRACT 	= "LET owner=PREVSTATE(0) LET requestamount=PREVSTATE(1) LET requesttoken=PREVSTATE(2) LET timelock=PREVSTATE(3) LET counterparty=PREVSTATE(4) LET secret=PREVSTATE(5) IF SIGNEDBY(owner) AND (@BLOCK GT timelock) THEN RETURN TRUE ENDIF LET preimage=STATE(100) ASSERT SIGNEDBY(counterparty) AND (SHA2(preimage) EQ secret) ASSERT STATE(101) EQ secret ASSERT STATE(102) EQ owner ASSERT STATE(103) EQ counterparty LET recaddress=0xFFEEDD9999 LET recamount=0.0000000000001 RETURN VERIFYOUT(@INPUT recaddress recamount 0x00 TRUE)";
var HTLC_ADDRESS 	= "MxG087900GGHJ64U76MYJEV56T0FAGCCTN1VM82R4PS96HNDYB54GGY2UH0WV3Z"


function setUpHTLCScript(callback){
	MDS.cmd("newscript script:\""+HTLC_CONTRACT+"\" trackall:false",function(resp){
		if(callback){
			callback(resp);
		}
	});
}