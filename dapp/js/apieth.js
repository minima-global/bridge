
/**
 * Some vars about the HTLC
 */

//Minimum block to check for events
var MIN_HTLC_BLOCK 			= 16;

//The timelock to add to the current time
var MIN_HTLC_TIMELOCK_SECS 	= 120;

/**
 * Start a wMinima -> Minima SWAP
 */
function startETHSwap(userdets, swappublickey, amount, requestamount, callback){
	
	//Create Time Lock
	var timelock = getCurrentUnixTime() + MIN_HTLC_TIMELOCK_SECS;
	
	//Create a secret
	createSecretHash(function(hashlock){
		
		//Start the swap..
		setupETHHTLCSwap(userdets.minimapublickey, swappublickey, hashlock, timelock, 
						wMinimaContractAddress, amount, requestamount, function(ethresp){
			if(ethresp.status){
				
				//Log it..
				startedCounterPartySwap(hashlock, "wminima", amount, ethresp.result, function(){
					
					//Insert these details so you know in future if right amount sent
					insertNewHTLCContract(hashlock,requestamount,"minima",function(sqlresp){
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
function checkExpiredETHHTLC(ethblock, callback){
	
	//CHeck all blocks in a range to the past
	var startblock = ethblock - 500;
	if(startblock < MIN_HTLC_BLOCK){
		startblock = MIN_HTLC_BLOCK;
	}
	var endblock = ethblock;
	
	//Convert to HEX..
	var hexstart = "0x"+startblock.toString(16).toUpperCase();
	var hexend   = "0x"+endblock.toString(16).toUpperCase(); 
	
	//Find all the logs..
	getHTLCContractAsOwner(hexstart,hexend,function(ethresp){
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
			MDS.log("Trying to collect already collected HTLC : "+JSON.stringify(htlclog));
			collectExpiredHTLC(htlclog.hashlock, "wminima", htlclog.amount, "0xFF", function(){
				callback();		
			});	
		}
	});
}

/**
 * Check for NEW secrets.. 
 */
var LAST_CHECKED_SECRET_BLOCK = -1;
function checkETHNewSecrets(currentethblock, callback){
	
	//Are we on the saem block
	if(LAST_CHECKED_SECRET_BLOCK == currentethblock){
		if(callback){
			callback();
		}
		return;
	}
	
	//Only check from the last checked block onwards..
	var startblock=10;
	var endblock=0;
	
	if(LAST_CHECKED_SECRET_BLOCK == -1){
		
		//No checks done yet.. so start from way back..
		startblock = currentethblock-10;
		endblock   = currentethblock;
	}else{
		startblock = LAST_CHECKED_SECRET_BLOCK+1;
		endblock	
	}
	
	//Endblock should be a few blocks back.. incase of reorgs..
	endblock					= currentethblock;
	LAST_CHECKED_SECRET_BLOCK 	= endblock;
	
	//Check within bounds
	if(startblock>endblock){
		startblock = endblock;
	}
	
	//Convert to HEX..
	var hexstart = "0x"+startblock.toString(16).toUpperCase();
	var hexend   = "0x"+endblock.toString(16).toUpperCase(); 
	
	//Get all the withdraw logs - that reveal a secret
	getHTLCContractWithdrawLogs(hexstart,hexend,function(ethresp){
		MDS.log("WITHDRAWS from "+hexstart+" to "+hexend+" "+JSON.stringify(ethresp,null,2));
		
		//Cycle through the secrets
		var len 		= ethresp.length;
		for(var i=0;i<len;i++){
			
			//Get the current log
			var withdrawlog = ethresp[i];
			
			//Add this to our db of secrets..
			insertSecret(withdrawlog.secret, withdrawlog.hashlock);
		}
		
		if(callback){
			callback();	
		}
	});
}

/**
 * Check if there are any SWAP coins
 */
function checkETHSwapHTLC(userdets, ethblock, callback){
	
	//CHeck all blocks in a range to the past
	var startblock = ethblock - 500;
	if(startblock < MIN_HTLC_BLOCK){
		startblock = MIN_HTLC_BLOCK;
	}
	var endblock = ethblock;
	
	//Convert to HEX..
	var hexstart = "0x"+startblock.toString(16).toUpperCase();
	var hexend   = "0x"+endblock.toString(16).toUpperCase(); 
	
	//Find all the logs..
	getHTLCContractAsReceiver(hexstart,hexend,function(ethresp){
		MDS.log("SEARCHING LOGS RECEIVER : "+JSON.stringify(ethresp,null,2));
		
		var timenow 	= getCurrentUnixTime(); 
		var len 		= ethresp.length;
		var collectlist	= [];
			
		for(var i=0;i<len;i++){
			
			//Get the HTLC log
			var htlclog=ethresp[i];
			
			try{
				//Have we already collected..
				haveCollectHTLC(htlclog.hashlock,function(collected){
					if(!collected){
						
						//Add to our list
						collectlist.push(htlclog);
						
						//Try and collect
						_checkCanCollectETHCoin(userdets,htlclog,function(){});
					}
				});
				
			}catch(e){
				MDS.log("ERROR (checkETHSwapHTLC) parsing HTLC coin : "+JSON.stringify(htlclog)+" "+e);
			}	
		}
		
		if(callback){
			callback(collectlist);
		}
	});
}

function _checkCanCollectETHCoin(userdets, htlclog, callback){
	
	//Check the token contract IS wMinima!
	if(htlclog.tokencontract != wMinimaContractAddress){
		MDS.log("NOT a wMinima ERC20 HTLC.. "+htlclog.tokencontract);
		if(callback){
			callback();
		}	
		return;
	}
	
	//What is the hash of the secret
	var hash = htlclog.hashlock;
	
	//Do we know the secret..
	getSecretFromHash(hash, function(secret){
		if(secret != null){
			
			//Check the value..
			getReqamountFromHash(hash,function(reqamount){
				
				//Check there is a value.. if NOT we did not start this HTLC
				// SO - we must have checked the amount when we did the counterparty txn..
				//AND then received the secret when they collected..
				if(reqamount){
					
					//Check is for the correct amount.. Will accept MORE
					if(+reqamount.REQAMOUNT > +htlclog.amount){
						
						//Incorrect amount - do NOT reveal the secret
						MDS.log("ERROR : Incorrect amount HTLC required:"+reqamount.REQAMOUNT+" htlc:"+JSON.stringify(htlclog));
						collectHTLC(htlclog.hashlock, "wminima", htlclog.amount, "0xCC", function(sqlresp){
							callback();		
						});	
						
						return;
					}
				}
				
				//We can collect
				MDS.log("Can Collect ETH HTLC coin as we know secret!!");
				_collectETHHTLCCoin(htlclog, hash, secret, function(resp){
					if(callback){
						callback(resp);
					}
				});	
			});
			
		}else{
					
			//Have we sent the OTHER side txn to get them to reveal the secret..
			haveSentCounterPartyTxn(hash,function(sent){
				if(!sent){
					
					//Check the details are valid!.. FEES etc.. 
					var sendamount 		= +htlclog.amount; 
					var requestamount 	= +htlclog.requestamount;
					
					getMyOrderBook(function(myorderbook){
						
						//Are we enablked for these swaps..
						if(myorderbook.nativeenable){
							
							//Calculate how much we should send back..
							var calcamount = calculateRequiredAmount("minima",sendamount,myorderbook);
							if(calcamount >= requestamount){
							
								//Send the ETH counter TXN - to make him reveal the secret
								_sendCounterPartyETHTxn(userdets,htlclog,function(resp){
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

function _sendCounterPartyETHTxn(userdets, htlclog, callback){
	
	//Coins found..
	getCurrentMinimaBlock(function(blockstr){
		
		//Convert to a number
		var block = +blockstr;
	
		//Send the Minima counter TXN - to make him reveal the secret
		var countertimelock = block+10;
		
		//Create the state
		var state = createHTLCState(userdets.minimapublickey,   
									userdets.ethaddress, 
									htlclog.owner,				 
									htlclog.requestamount, 
									countertimelock, 
									htlclog.hashlock)
		
		MDS.log("Send Minima counterparty txn! state:"+JSON.stringify(state));
		 
		//And send from the native wallet..
		sendMinima(userdets, htlclog.requestamount, HTLC_ADDRESS, state, function(resp){
			
			//If success put in DB
			if(resp.status){
				sentCounterPartyTxn(htlclog.hashlock,"minima",htlclog.requestamount,resp.response.txpowid,function(){
					callback(resp);	
				});
			}else{
				MDS.log("FAIL! "+JSON.stringify(resp));
				callback(resp);	
			}	
		});
		
	});
}
