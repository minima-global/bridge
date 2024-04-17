
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
					
					//Set this is a JSON keypair
					MDS.keypair.set("_allbalance",JSON.stringify(balance),function(init){
						if(callback){
							callback(balance);	
						}
					});	
				});
			});	
		});
	});
}

/**
 * Get all Balances..
 */
function getAllBalances(userdetails,callback){
	
	/*MDS.keypair.get("_allbalance",function(getresult){
		if(getresult.status){
			callback(JSON.parse(getresult.value));
		}else{
			var balance 		= {};
			
			balance.minima 				= {};
			balance.minima.confirmed 	= 0;
			balance.minima.unconfirmed 	= 0;
			balance.minima.total 		= 0;
			balance.minima.coins 		= 0;
			
			balance.eth			= 0;
			balance.ethfull		= 0;
			balance.wminima		= 0;
			balance.wminimafull	= 0;
			balance.usdt		= 0;
			balance.usdtfull	= 0;
				
			callback(balance);	
		}
	});*/
	
	getMinimaBalance(userdetails,function(minimabal){
		var balance 	= {};
		balance.minima 	= minimabal;
		
		//Is Infura setup..
		validInfuraKeys(function(valid){
			
			if(valid){
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
			}else{
				balance.eth			= 0;
				balance.ethfull		= 0;
				balance.wminima		= 0;
				balance.wminimafull	= 0;
				balance.usdt		= 0;
				balance.usdtfull	= 0;
				
				callback(balance);
			}	
		});
	});
}

