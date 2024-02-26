
/**
 * Get all Balances..
 */
function getAllBalances(userdetails,callback){
	
	getMinimaBalance(userdetails,function(minimabal){
		var balance 			= {};
		balance.minima 	= minimabal;
		
		getETHEREUMBalance(function(ethbal){
			
			//Get wrapped and ETH
			balance.eth	= ethbal;
			
			//Get the Wrapped Minima balance
			getWMinimaBalance(function(wminbal){
				//Get wrapped and ETH
				balance.wminima	= wminbal;
				
				//And return the results..
				callback(balance);
			});	
		});
	});
}

