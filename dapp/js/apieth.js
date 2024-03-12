
/**
 * Start a wMinima -> Minima SWAP
 */
function startETHSwap(userdets, swappublickey, erc20contract, amount, requestamount, callback){
	
	//Create Time Lock
	var timelock = getCurrentUnixTime() + HTLC_TIMELOCK_SECS;
	
	//Create a secret
	createSecretHash(function(hashlock){
		
		//Need to set the nonce as this function called from the frontend
		setNonceAuto(function(nonce){
			
			//Start the swap..
			setupETHHTLCSwap(userdets.minimapublickey, swappublickey, hashlock, timelock, 
							erc20contract, amount, requestamount, function(ethresp){
				if(ethresp.status){
					
					//Log it..
					startedCounterPartySwap(hashlock, "ETH:"+erc20contract, 
								amount, ethresp.result, function(){
						
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
		//MDS.log("SEARCHING LOGS OWNER : "+JSON.stringify(ethresp,null,2));
		
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
							
							//Add to our list
							expired.push(htlclog);
							
							//Collect the coin
							_collectExpiredETHCoin(htlclog, function(){});		
						}
					});
				}else{
					/*MDS.log("Timelock CANNOT YET Collect Expired ETH Coin! timelock:"
								+timelock+" timenow:"
								+timenow+" amount:"
								+htlclog.amount
								+" hash:"+htlclog.hashlock);*/
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
			
			MDS.log("Timelock Collect Expired ETH HTLC! "+JSON.stringify(htlclog));
			
			//Try and refund
			refundHTLCSwap(contid,function(resp){
				
				//Did it work ?
				if(resp.status){
					//We have now collected this - don't try again
					collectExpiredHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, htlclog.amount, resp.result, function(){
						callback(resp);		
					});	
				}else{
					
					//Didn''t work..
					MDS.log("HTLC refund failed : "+resp.error.message);
					
					//What is the error
					if( resp.error.message.includes("refundable: already ") || 
						resp.error.message.includes("refundable: not sender")){
								
						//Already collected - don't try again..
						collectExpiredHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, htlclog.amount, "Already collected", function(){
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
			collectExpiredHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, htlclog.amount, "Already collected", function(){
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
	var startblock	= 0;
	var endblock	= 0;
	
	if(LAST_CHECKED_SECRET_BLOCK == -1){
		
		//No checks done yet.. so start from way back..
		startblock = currentethblock-HTLC_SECRETS_BACKLOG_CHECK;
		if(startblock<0){
			startblock = 0;
		}
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
		//MDS.log("WITHDRAWS from "+hexstart+" to "+hexend+" "+JSON.stringify(ethresp,null,2));
		
		//Cycle through the secrets
		var len = ethresp.length;
		for(var i=0;i<len;i++){
			
			//Get the current log
			var withdrawlog = ethresp[i];
			
			//Add this to our db of secrets..
			insertSecret(withdrawlog.secret, withdrawlog.hashlock,function(added){
				if(added){
					MDS.log("NEW SECRET from ETH for hash "+withdrawlog.hashlock);
					
					//Put a log in db so no need to call ETH..
					collectExpiredHTLC(withdrawlog.hashlock, "wMinima / USDT", 0, "SECRET REVEALED", function(){});
				}
			});
		}
		
		if(callback){
			callback();	
		}
	});
}

/**
 * Check if there are any SWAP coins
 */
function checkETHSwapHTLC(userdets, ethblock, minimablock, callback){
	
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
		//MDS.log("SEARCHING LOGS RECEIVER : "+JSON.stringify(ethresp,null,2));
		
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
						_checkCanCollectETHCoin(userdets,htlclog, minimablock, function(){});
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

function _checkCanCollectETHCoin(userdets, htlclog, minimablock, callback){
	
	//What is the hash of the secret
	var hash = htlclog.hashlock;
	
	//Do we know the secret..
	getSecretFromHash(hash, function(secret){
		if(secret != null){
			
			//Check the value..
			getRequestFromHash(hash,function(reqamount){
				
				//Check there is a value.. if NOT we did not start this HTLC
				// SO - we must have checked the amount when we did the counterparty txn..
				//AND then received the secret when they collected..
				if(reqamount){
					
					//Check is for the correct amount.. Will accept MORE
					if(+reqamount.REQAMOUNT > +htlclog.amount){
						
						//Incorrect amount - do NOT reveal the secret
						MDS.log("ERROR : Incorrect amount HTLC required:"+reqamount.REQAMOUNT+" htlc:"+JSON.stringify(htlclog));
						collectHTLC(htlclog.hashlock, reqamount.TOKEN, 0, "Incorrect amount", function(sqlresp){});	
						return;
					}
					
					//Check is the correct token..
					var reqtoken = reqamount.TOKEN;
					if(reqtoken.startsWith("ETH:")){
						reqtoken = reqtoken.substring(4);
					}
					
					//Is it correct
					if(htlclog.tokencontract != reqtoken){
						MDS.log("ERROR : Incorrect token HTLC required:"+reqamount.TOKEN+" htlc:"+JSON.stringify(htlclog));
						collectHTLC(htlclog.hashlock, reqamount.TOKEN, 0, "Incorrect token", function(sqlresp){});	
						return;
					}
				}
				
				//We can collect
				MDS.log("Can Collect ETH HTLC coin as we know secret for hash "+hash);
				_collectETHHTLCCoin(htlclog, hash, secret, function(resp){});	
			});
			
		}else{
					
			//Have we sent the OTHER side txn to get them to reveal the secret..
			haveSentCounterPartyTxn(hash,function(sent){
				if(!sent){
					
					//Check the timelock..
					var timelocktime 	= htlclog.timelock;
					var ctime 			= getCurrentUnixTime();
					var tdiff 			= timelocktime - ctime;
					if(tdiff < HTLC_TIMELOCK_COUNTERPARTY_SECS_CHECK){
						MDS.log("TIMELOCK ("+HTLC_TIMELOCK_COUNTERPARTY_SECS_CHECK+" secs) ETH TOO close to proceed.."
								+" not sending counterpartytxn.. timelock:"+timelocktime+" currenttime:"+ctime+" hash:"+hash);
						collectHTLC(htlclog.hashlock, htlclog.tokencontract, 0, "Timelock too close", function(sqlresp){});
						return;
					}
					
					//Check the details are valid!.. FEES etc.. 
					var sendamount 		= +htlclog.amount; 
					var requestamount 	= +htlclog.requestamount;
					var reqtoken 		= htlclog.tokencontract;
					
					getMyOrderBook(function(myorderbook){
						
						//Which orderbook are we using
						var ob = {};
						var simplename = "";
						if(reqtoken == wMinimaContractAddress){
							ob = myorderbook.wminima;
							simplename = "wminima";
						}else if(reqtoken == USDTContractAddress){
							ob = myorderbook.usdt;
							simplename = "usdt";
						}else{
							//ERROR
							MDS.log("Invalid request for swap - unknown token : "+reqtoken);
							collectHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, 0, "Invalid request - unknown token", function(sqlresp){});
							return;
						}
						
						//Check we are enabled to swap this token
						if(!ob.enable){
							MDS.log("Invalid request for Minima swap - not enabled");
							collectHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, 0, "Invalid request - swap not enabled", function(sqlresp){});
							return;	
						}
						
						//Now check the amounts..
						if(sendamount > ob.maximum){
							MDS.log("Invalid request to BUY "+simplename+" ("+sendamount+") exceeds Maximum "+ob.maximum);
							collectHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, 0, "Exceeds Maximum "+sendamount, function(sqlresp){});
							return;	
						}else if(sendamount < ob.minimum){
							MDS.log("Invalid request to BUY "+simplename+" ("+sendamount+") exceeds Minimum "+ob.minimum);
							collectHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, 0, "Exceeds Minimum "+sendamount, function(sqlresp){});
							return;	
						}
						
						//How much do they want..
						var calcamount = calculateAmount("buy",requestamount,simplename,myorderbook);
						if(sendamount  >= calcamount){
						
							//Send the ETH counter TXN - to make him reveal the secret
							_sendCounterPartyETHTxn(userdets,htlclog,minimablock,function(resp){});
									
						}else{
							MDS.log("Invalid request amount for "+simplename+" SWAP sent:"+sendamount+" required:"+calcamount+" actual:"+calcamount)
							collectHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, 0, "Invalid request amount", function(sqlresp){});
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
					collectHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, htlclog.amount, resp.result, function(){
						callback(resp);		
					});	
				}else{
					
					//Didn't work..
					MDS.log("ERROR : HTLC withdraw failed : "+resp.error.message);
					
					//What is the error
					if( resp.error.message.includes("withdrawable: already ") || 
						resp.error.message.includes("withdrawable: not ")){
								
						//Already collected - don't try again..
						collectHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, 0, "Withdraw failed :"+resp.error.message, function(){
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
			collectHTLC(htlclog.hashlock, "ETH:"+htlclog.tokencontract, 0, "Already collected", function(sqlresp){
				callback();		
			});	
		}
	});
}

function _sendCounterPartyETHTxn(userdets, htlclog, minimablock, callback){
	
	//Check we can collect! - could be a reinstall..
	canCollect(htlclog.contractid, function(canc){
		
		if(canc){
			
			//Send the Minima counter TXN - to make him reveal the secret
			var countertimelock = minimablock + HTLC_TIMELOCK_COUNTERPARTY_BLOCKS;
			
			//Create the state
			var state = createHTLCState(userdets.minimapublickey,   
										userdets.ethaddress, 
										htlclog.minimapublickey,				 
										htlclog.requestamount,
										"minima", // MUST have been a minima request
										countertimelock, 
										htlclog.hashlock, 
										false)
			
			MDS.log("Send counterparty Minima txn! hashlock:"+htlclog.hashlock);
			 
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
			
		}else{
			MDS.log("ETH HTLC already collected..no send counterparty! "+htlclog.hashlock);
			sentCounterPartyTxn(htlclog.hashlock,"minima",htlclog.requestamount,resp.response.txpowid,function(){
				//callback(resp);	
			});
		}
	});
}
