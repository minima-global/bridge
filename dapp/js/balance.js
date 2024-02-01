
function getNativeBalance(userdetails,callback){
	MDS.cmd("balance address:"+userdetails.minimaaddress.mxaddress,function(resp){
		callback(resp.response[0]);
	});
}

function getWrappedBalance(userdetails,callback){
	callback(0);
}

function getETHBalance(userdetails,callback){
	callback(0);
}

function getAllBalances(userdetails,callback){
	
	getNativeBalance(userdetails,function(nbal){
		var balance 			= {};
		balance.nativeminima 	= nbal;
		
		//Get wrapped and ETH
		balance.wrappedminima 	= 0;
		balance.ETH 			= 0;
		
		//And return the results..
		callback(balance);
	});
}

function depositNativeMinima(userdets, amount, callback){
	//Send that amount to his address
	MDS.cmd("send amount:"+amount
			+" address:"+userdets.minimaaddress.mxaddress
			+" tokenid:0x00 split:10",function(resp){
		callback(resp);			
	});
}

function sendFromNativeWallet(userdets, amount, address, callback){
	//Send that amount to his address
	MDS.cmd("send amount:"+amount
			+" address:"+address
			+" fromaddress:"+userdets.minimaaddress.mxaddress
			+" signkey:"+userdets.minimapublickey
			+" tokenid:0x00", function(resp){
		callback(resp);				
	});
}