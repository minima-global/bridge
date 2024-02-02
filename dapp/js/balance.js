
/**
 * Get all Balances..
 */
function getAllBalances(userdetails,callback){
	
	getMinimaBalance(userdetails,function(minimabal){
		var balance 			= {};
		balance.minima 	= minimabal;
		
		getETHBalance(userdetails,function(ethbal){
			
			//Get wrapped and ETH
			balance.eth	= ethbal;
		
			//And return the results..
			callback(balance);	
		});
	});
}

