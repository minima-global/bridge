
function getNativeBalance(userdetails,callback){
	MDS.cmd("balance address:"+userdetails.minimaaddress.mxaddress,function(balresp){
		
		var confirmed 	= balresp.response[0].confirmed;
		var unconfirmed = balresp.response[0].unconfirmed;
		
		//Add the confirmed and unconfirmed
		var add = "runscript script:\"LET total="+confirmed+"+"+unconfirmed
				 +" LET roundedtotal=FLOOR(total)\"";
			
		MDS.cmd(add,function(resp){
			//Round..
			var minimabalance = {};
			minimabalance.confirmed		= confirmed;
			minimabalance.unconfirmed	= unconfirmed;
			minimabalance.total 		= resp.response.variables.total;
			minimabalance.rounded 		= resp.response.variables.roundedtotal;
			
			//Send this..
			callback(minimabalance);		
		});
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

function sendFromNativeWallet(userdets, amount, address, state, callback){
	
	//The state ius a JSON of the state
	var statestr = JSON.stringify(state);
	
	//Send that amount to his address
	MDS.cmd("send amount:"+amount
			+" address:"+address
			+" fromaddress:"+userdets.minimaaddress.mxaddress
			+" signkey:"+userdets.minimapublickey
			+" state:"+statestr
			+" tokenid:0x00", function(resp){
		callback(resp);				
	});
}