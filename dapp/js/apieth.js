
/**
 * Start a wMinima -> Minima SWAP
 */
function startETHSwap(swappublickey, amount, requestamount, callback){
	
	//Create Time Lock
	var timelock = getCurrentUnixTime() + (60*2);
	
	//Create a secret
	createSecretHash(function(hashlock){
		
		//Start the swap..
		startETHHTLCSwap(swappublickey, hashlock, timelock, wMinimaContractAddress, amount, function(ethresp){
			if(ethresp.status){
				
				//Log it..
				startedCounterPartySwap(hashlock, "wminima", amount, ethresp.result, function(){
					
					//Insert these details so you know in future if right amount sent
					insertNewHTLCContract(hashlock,requestamount,"minima",function(){
						callback(ethresp);	
					});		
				});	
			}else{
				callback(ethresp);
			}
		});
	});
}

/**
 * Check if there are any coins in the HTLC that have expired..
 */
function checkExpiredETHHTLC(callback){
	
	//Find all the logs..
	getHTLCContractAsOwner("0x10","latest",function(ethresp){
		MDS.log("SEARCHING LOGS OWNER : "+JSON.stringify(ethresp,null,2));
		
		var timenow = getCurrentUnixTime(); 
		var len 	= ethresp.length;
		var expired = [];
			
		for(var i=0;i<len;i++){
			
			//Get the HTLC log
			var htlclog=ethresp[i];
			
			try{
				//Check if we can collect it..
				var timelock=htlclog.timelock;
				if(timenow>timelock){
					
					//Have we already collected..
					haveCollectExpiredHTLC(htlclog.hashlock,function(collected){
						if(!collected){
							
							MDS.log("Timelock Collect Expired ETH HTLC! timelock:"+timelock+" timenow:"+timenow+" amount:"+htlclog.amount);
					
							//Add to our list
							expired.push(htlclog);
							
							//Collect the coin
							_collectExpiredETHCoin(htlclog, function(){});		
						}
					});
				}else{
					//MDS.log("Timelock CANNOT YET Collect Expired ETH Coin! timelock:"+timelock+" timenow:"+timenow+" amount:"+htlclog.amount);
				}
			}catch(e){
				MDS.log("ERROR (checkExpiredETHHTLC) parsing expired coin : "+JSON.stringify(htlclog)+" "+e);
			}
		}
		
		if(callback){
			callback(expired);
		}
	});
}

function _collectExpiredETHCoin(htlclog,callback){
	
	//What is the contract ID
	var contid = htlclog.contractid;
	
	//Make sure we can collect it..
	canCollect(contid, function(canc){
		
		if(canc){
			
			//Try and refund
			refundHTLCSwap(contid,function(resp){
				
				//Did it work ?
				if(resp.status){
					//We have now collected this - don't try again
					collectExpiredHTLC(htlclog.hashlock, "wminima", htlclog.amount, resp.result, function(){
						callback(resp);		
					});	
				}else{
					
					//Didn''t work..
					MDS.log("HTLC refund failed : "+resp.error.message);
					
					//What is the error
					if( resp.error.message.includes("refundable: already ") || 
						resp.error.message.includes("refundable: not sender")){
								
						//Already collected - don't try again..
						collectExpiredHTLC(htlclog.hashlock, "wminima", htlclog.amount, "0xFF", function(){
							callback(resp);		
						});			
					}else{
						callback(resp);	
					}	
				}
			});		
		}else{
			
			//Already collected - don't try again..
			//MDS.log("Trying to collect already collected HTLC : "+JSON.stringify(htlclog));
			collectExpiredHTLC(htlclog.hashlock, "wminima", htlclog.amount, "0xFF", function(){
				callback();		
			});	
		}
	});
}



/**
 * Check if there are any SWAP coins
 */
function checkETHSwapHTLC(callback){
	
	//Find all the logs..
	getHTLCContractAsReceiver("0x10","latest",function(ethresp){
		MDS.log("SEARCHING LOGS RECEIVER : "+JSON.stringify(ethresp,null,2));
		
		var timenow = getCurrentUnixTime(); 
		var len 	= ethresp.length;
		var expired = [];
			
		for(var i=0;i<len;i++){
			
			//Get the HTLC log
			var htlclog=ethresp[i];
			
			try{
				//Have we already collected..
				haveCollectHTLC(htlclog.hashlock,function(collected){
					if(!collected){
						//Try and collect
						_checkCanCollectETHCoin(htlclog,function(){});
					}
				});
				
			}catch(e){
				MDS.log("ERROR (checkETHSwapHTLC) parsing HTLC coin : "+JSON.stringify(htlclog)+" "+e);
			}	
		}
		
		if(callback){
			callback(expired);
		}
	});
}

function _checkCanCollectETHCoin(htlclog, callback){
	
	//What is the hash of the secret
	var hash = htlclog.hashlock;
	
	//Do we know the secret..
	getSecretFromHash(hash, function(secret){
		if(secret != null){
			//We know the secret! - Collect this coin..
			MDS.log("Can Collect ETH HTLC coin as we know secret!!");
			
			_collectETHHTLCCoin(htlclog, hash, secret, function(resp){
				if(callback){
					callback(resp);
				}
			});
			
		}else{
			
			callback();
			
			return;
					
			//Have we sent the OTHER side txn to get them to reveal the secret..
			haveSentCounterPartyTxn(hash,function(sent){
				if(!sent){
					
					//Check the details are valid!.. FEES etc.. 
					var sendamount 		= +coin.tokenamount; 
					var requestamount 	= +coin.state[1];
					
					getMyOrderBook(function(myorderbook){
						
						//Are we enablked for these swaps..
						if(myorderbook.nativeenable){
							
							//Calculate how much we should send back..
							var calcamount = calculateRequiredAmount("minima",sendamount,myorderbook);
							if(calcamount >= requestamount){
							
								//Send the ETH counter TXN - to make him reveal the secret
								_sendCounterPartyETHTxn(userdets,coin,function(resp){
									if(callback){
										callback(resp);
									}
								});		
							}else{
								MDS.log("Invalid request amount for wMinima SWAP sent wminima:"+sendamount+" requestedminima:"+requestamount+" actual:"+calcamount)
							}	
						}else{
							MDS.log("Invalid request for Minima swap - not enabled");
						}
					});
				}
			});
		}
	});
}

function _collectETHHTLCCoin(htlclog, hash, secret, callback){
	
	//What is the contract ID
	var contid = htlclog.contractid;
	
	//Make sure we can collect it..
	canCollect(contid, function(canc){
		
		if(canc){
			
			//Try and collect with the secret!
			withdrawHTLCSwap(contid, secret, function(resp){
				
				//Did it work ?
				if(resp.status){
					//We have now collected this - don't try again
					collectHTLC(htlclog.hashlock, "wminima", htlclog.amount, resp.result, function(){
						callback(resp);		
					});	
				}else{
					
					//Didn't work..
					MDS.log("HTLC withdraw failed : "+resp.error.message);
					
					//What is the error
					if( resp.error.message.includes("withdrawable: already ") || 
						resp.error.message.includes("withdrawable: not ")){
								
						//Already collected - don't try again..
						collectHTLC(htlclog.hashlock, "wminima", htlclog.amount, "0xEE", function(){
							callback(resp);		
						});			
					}else{
						callback(resp);	
					}	
				}
			});		
		}else{
			
			//Already collected - don't try again..
			MDS.log("Trying to withdraw already collected HTLC : "+JSON.stringify(htlclog));
			collectHTLC(htlclog.hashlock, "wminima", htlclog.amount, "0xEE", function(sqlresp){
				callback();		
			});	
		}
	});
}

function _sendCounterPartyETHTxn(userdets, coin, callback){
	
	//Send the ETH counter TXN - to make him reveal the secret
	var countertimelock = +coin.state[3] - 10;
	var reqamount 		= coin.state[1];
	var hash 			= coin.state[5];
	
	var state = {};
	state[0]  = userdets.minimapublickey;
	state[1]  = coin.tokenamount;
	state[2]  = "[ETH:0x669C01CAF0EDCAD7C2B8DC771474AD937A7CA4AF]";
	state[3]  = countertimelock;
	state[4]  = coin.state[0];
	state[5]  = hash;
	
	MDS.log("Send Minima counterparty txn! state:"+JSON.stringify(state));
	 
	//And send from the native wallet..
	sendMinima(userdets, reqamount, HTLC_ADDRESS, state, function(resp){
		
		//If success put in DB
		if(resp.status){
			sentCounterPartyTxn(hash,"minima",reqamount,function(){
				callback(resp);	
			});
		}else{
			MDS.log("FAIL! "+JSON.stringify(resp));
			callback(resp);	
		}	
	});
}
