
//Main Native Minima address is of this type
var MAIN_ADDRESS 	= "LET type=[bridge address] RETURN SIGNEDBY(*)";

//Minima HTLC contract - with notification coin
var HTLC_CONTRACT 	= "LET version=1.2 LET owner=PREVSTATE(0) LET requestamount=PREVSTATE(1) LET requesttoken=PREVSTATE(2) LET timelock=PREVSTATE(3) LET counterparty=PREVSTATE(4) LET hash=PREVSTATE(5) LET ownerethkey=PREVSTATE(6) IF SIGNEDBY(owner) AND (@BLOCK GT timelock) THEN RETURN TRUE ENDIF LET secret=STATE(100) ASSERT SIGNEDBY(counterparty) AND (SHA2(secret) EQ hash) ASSERT STATE(101) EQ hash ASSERT STATE(102) EQ STRING(owner) ASSERT STATE(103) EQ STRING(counterparty) RETURN VERIFYOUT(@INPUT 0xFFEEDD9999 0.0001 @TOKENID TRUE)";
var HTLC_ADDRESS 	= "MxG080CRJB1D4NHGRYGNF7Q52FK7023UM3FUUPVD1W1WCQZSA8MDQ25982N842G"

//The Coin Notifications
var COIN_SECRET_NOTIFY		= "0xFFEEDD9999"

function setUpHTLCScript(userdets, callback){
	
	//Main HTLC script
	MDS.cmd("newscript script:\""+HTLC_CONTRACT+"\" trackall:false",function(resp){
		
		//Now setup the User account..
		MDS.cmd("newscript trackall:true script:\""+userdets.minimaaddress.script+"\"",function(resp2){
			if(callback){
				callback();
			}	
		});
	});
}

function setupCoinSecretEvents(callback){
	//We want to be notified of Coin Events that rveal the secret
	MDS.cmd("coinnotify action:add address:"+COIN_SECRET_NOTIFY, function(resp){
		callback(resp);
	});
}

export { MAIN_ADDRESS, HTLC_ADDRESS, setUpHTLCScript, setupCoinSecretEvents };