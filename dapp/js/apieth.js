
/**
 * Start a wMinima -> Minima SWAP
 */
function startETHSwap(userdets, amount, requestamount, swappublickey, callback){
	
	//Add 5 mins..
	var timelock = getCurrentUnixTime() + (60*5);
	
	//Create a secret
	createSecretHash(function(hashlock){
		
		//Start the swap..
		startETHHTLCSwap(swappublickey, hashlock, timelock, wMinimaContractAddress, amount, function(ethresp){
			if(ethresp.status){
				startedCounterPartySwap(hashlock, "wminima", amount,function(){
					callback(ethresp);		
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
	
	//Try and refund
	refundHTLCSwap(htlclog.contractid,function(resp){
		
		//Did it work ?
		if(resp.status){
			
			//We have now collected this - don't try again
			collectExpiredHTLC(htlclog.hashlock, "wminima", htlclog.amount, function(){
				if(callback){
					callback(resp);	
				}	
			});	
			
		}else{
			if(callback){
				callback(resp);	
			}
		}
	});
}

/**
 * Check if there are any SWAP coins
 */
function checkETHSwapHTLC(userdets, callback){
	
	//First search coins
	var cmd = "coins coinage:2 tokenid:"+TOKEN_ID_TEST+" simplestate:true relevant:true address:"+HTLC_ADDRESS;		
	MDS.cmd(cmd,function(resp){
		
		//How many coins..
		var len=resp.response.length;
		for(var i=0;i<len;i++){
			
			//Get the coin
			var coin=resp.response[i];
			try{
				//Are we the Counterparty..
				if(coin.state[4] == userdets.minimapublickey){
					_checkCanCollectETHCoin(userdets, coin, function(swapcoins){});		
				}
			}catch(e){
				MDS.log("ERROR (checkETHSwapHTLC) parsing HTLC coin : "+JSON.stringify(coin)+" "+e);
			}
		}
	
	});
}

function _checkCanCollectETHCoin(userdets, coin, callback){
	
	//MDS.log("CHECK ETH SWAP.. "+JSON.stringify(coin));
	
	//What is the hash of the secret
	var hash = coin.state[5];
	
	//Do we know the secret..
	getSecretFromHash(hash, function(secret){
		if(secret != null){
			//We know the secret! - Collect this coin..
			MDS.log("Can Collect ETH HTLC coin as we know secret!!");
			
			_collectETHHTLCCoin(userdets, hash, secret, coin, function(resp){
				if(callback){
					callback(resp);
				}
			});
			
		}else{
					
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

function _collectETHHTLCCoin(userdets, hash, secret, coin, callback){
	
	//Random txn ID
	var txnid = "htlc_collect_txn_"+randomInteger(1,1000000000);
	
	//Create a txn to collect this coin..
	var finalamount = +coin.tokenamount - 0.0001;
			
	var cmd = "txncreate id:"+txnid+";"
	
			//Add the HTLC coin..
			+"txninput id:"+txnid+" coinid:"+coin.coinid+";"
			
			//Add an output to the notify coin address.. MUST be FIRST! @INPUT
			+"txnoutput id:"+txnid+" tokenid:"+coin.tokenid+" amount:0.0001 address:0xFFEEDD9999;"
			
			//Send the coin back to me..
			+"txnoutput id:"+txnid+" tokenid:"+coin.tokenid+" amount:"+finalamount+" address:"+userdets.minimaaddress.mxaddress+";"
			
			//Set the correct state vars.. the secret etc..
			+"txnstate id:"+txnid+" port:100 value:\""+secret+"\";"
			+"txnstate id:"+txnid+" port:101 value:\""+hash+"\";"
			+"txnstate id:"+txnid+" port:102 value:\"["+coin.state[0]+"]\";"
			+"txnstate id:"+txnid+" port:103 value:\"["+coin.state[4]+"]\";"
			
			//Sign it..
			+"txnsign id:"+txnid+" publickey:"+userdets.minimapublickey+";"
			
			//AND POST!
			+"txnpost id:"+txnid+" auto:true txndelete:true;";
	
	//Run it.. 
	MDS.cmd(cmd,function(resp){
		
		//always delete whatever happens
		MDS.cmd("txndelete id:"+txnid,function(delresp){
			
			//Log it..	
			collectHTLC(coin.state[5],"wminima",finalamount+"");
			
			if(callback){
				callback(resp);
			}
		});
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
