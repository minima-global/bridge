
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