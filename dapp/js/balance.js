
function removeDecimalPart(value){
	
	var strval = ""+value;
	var dot = strval.indexOf(".");
	if(dot == -1){
		return +strval;
	}
	
	//Strip it..
	return +strval.substring(0,dot+3); 
}



/**
 * Calculate all Balances..
 */
function calculateAllBalances(userdetails,callback){
	
	getMinimaBalance(userdetails,function(minimabal){
		var balance 	= {};
		balance.minima 	= minimabal;
		
		getETHEREUMBalance(function(ethbal){
			
			//Get wrapped and ETH
			balance.eth		= removeDecimalPart(ethbal);
			balance.ethfull	= ethbal;
			
			//Get the Wrapped Minima balance
			getWMinimaBalance(function(wminbal){
				balance.wminima		= removeDecimalPart(wminbal);
				balance.wminimafull	= wminbal;
				
				//get the USDT balance..
				getUSDTBalance(function(usdtbal){
					balance.usdt 	 = removeDecimalPart(usdtbal);
					balance.usdtfull = usdtbal;
				
					//And return the results..
					callback(balance);	
				});
			});	
		});
	});
}

/**
 * Get all Balances..
 */
function getAllBalances(userdetails,callback){
	
	getMinimaBalance(userdetails,function(minimabal){
		var balance 	= {};
		balance.minima 	= minimabal;
		
		getETHEREUMBalance(function(ethbal){
			
			//Get wrapped and ETH
			balance.eth		= removeDecimalPart(ethbal);
			balance.ethfull	= ethbal;
			
			//Get the Wrapped Minima balance
			getWMinimaBalance(function(wminbal){
				balance.wminima		= removeDecimalPart(wminbal);
				balance.wminimafull	= wminbal;
				
				//get the USDT balance..
				getUSDTBalance(function(usdtbal){
					balance.usdt 	 = removeDecimalPart(usdtbal);
					balance.usdtfull = usdtbal;
				
					//And return the results..
					callback(balance);	
				});
			});	
		});
	});
}

