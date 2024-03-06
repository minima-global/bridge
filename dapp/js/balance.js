
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
				balance.wminima	= wminbal;
				
				//get the USDT balance..
				getUSDTBalance(function(usdtbal){
					balance.usdt	= usdtbal;
				
					//And return the results..
					callback(balance);	
				});
			});	
		});
	});
}

