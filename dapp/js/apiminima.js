
/**
 * Get the balance of your Minima Coins
 */
function getMinimaBalance(userdetails,callback){
	MDS.cmd("balance tokenid:0x00 address:"+userdetails.minimaaddress.mxaddress,function(balresp){
		
		var confirmed 	= balresp.response[0].confirmed;
		var unconfirmed = balresp.response[0].unconfirmed;
		
		//Add the confirmed and unconfirmed
		var add = "runscript script:\"LET total="+confirmed+"+"+unconfirmed
				 +" LET roundedtotal=FLOOR(total)\"";
			
		MDS.cmd(add,function(resp){
			
			//Create balance object
			var minimabalance = {};
			minimabalance.confirmed		= confirmed;
			minimabalance.unconfirmed	= unconfirmed;
			minimabalance.total 		= resp.response.variables.total;
			minimabalance.rounded 		= resp.response.variables.roundedtotal;
			minimabalance.coins			= balresp.response[0].coins;
			
			//Send this..
			callback(minimabalance);		
		});
	});
}

/**
 * Sendf funds from the Brideg Wallet 
 */
function sendMinima(userdets, amount, address, state, callback){
	
	//The state ius a JSON of the state
	var statestr = JSON.stringify(state);
	
	//Send that amount to his address
	MDS.cmd("send amount:"+amount
	  		+" mine:true"
			+" address:"+address
			+" fromaddress:"+userdets.minimaaddress.mxaddress
			+" signkey:"+userdets.minimapublickey
			+" state:"+statestr
			+" tokenid:0x00", function(resp){
		callback(resp);				
	});
}

/**
 * Deposit Minima from main Wallet to your Brideg Wallet
 */
function depositNativeMinima(userdets, amount, callback){
	//Send that amount to his address
	MDS.cmd("send amount:"+amount
			+" address:"+userdets.minimaaddress.mxaddress
			+" tokenid:0x00 split:10",function(resp){
		callback(resp);			
	});
}

/**
 * Start a Minima -> wMinima SWAP
 */
function startMinimaSwap(userdets, amount, requestamount, swappublickey, callback){
	
	//Get the current block
	getCurrentBlock(function(block){
		
		//How long do we wait..
		var timelock = +block+20;
		
		//Create a secret
		createSecretHash(function(hash){
			
			var state = {};
			state[0]  = userdets.minimapublickey;
			state[1]  = requestamount;
			state[2]  = "0x00000001"; // wMinima on ETH
			state[3]  = timelock;
			
			//FOR NOW..
			//state[4]  = swappublickey;
			state[4]  = userdets.minimapublickey;
			
			state[5]  = hash;
			 
			//And send from the native wallet..
			sendMinima(userdets,amount,HTLC_ADDRESS,state,function(resp){
				
				//If success put in DB
				if(resp.status){
					startedCounterPartySwap(hash,function(){
						callback(resp);	
					});
				}else{
					callback(resp);	
				}	
			});
		});	
	});
}

/**
 * Check if there are any coins in the HTLC that have expired..
 */
function checkExpiredMinimaHTLC(userdets, callback){
	
	//First search coins
	var cmd = "coins tokenid:0x00 simplestate:true relevant:true address:"+HTLC_ADDRESS;		
	MDS.cmd(cmd,function(resp){
		
		//How many coins..
		var len=resp.response.length;
		if(len>0){
			
			//Coins found..
			getCurrentBlock(function(blockstr){
				
				//Convert to a number
				var block = +blockstr;
				
				//All expired.. 
				var expired = [];
				
				//Now cycle through the coins..
				for(var i=0;i<len;i++){
					//Get the coin
					var coin=resp.response[i];
					try{
						//Are we the Owner..
						if(coin.state[0] == userdets.minimapublickey){
							//Check if we can collect it..
							var timelock=+coin.state[3];
							if(block>timelock){
								MDS.log("Timelock Collect Expired Minima Coin! timelock:"+timelock+" block:"+block+" amount:"+coin.amount);
								
								//Add to our list
								expired.push(coin);
								
								//Collect the coin
								_collectExpiredCoin(userdets,coin,function(){});
							}else{
								MDS.log("Timelock CANNOT YET Collect Expired Minima Coin! timelock:"+timelock+" block:"+block+" amount:"+coin.amount);
							}	
						}
					}catch(e){
						MDS.log("ERROR parsing Minima expired coin : "+JSON.stringify(coin)+" "+e);
					}
				}
				
				if(callback){
					callback(expired);
				}
			});
		}
	});
}

function _collectExpiredCoin(userdets,coin,callback){
	
	//Random txn ID
	var txnid = "htlc_collect_txn_"+randomInteger(1,1000000000);
	
	//Create a txn to collect this coin..
	var cmd = "txncreate id:"+txnid+";"
			+"txninput id:"+txnid+" coinid:"+coin.coinid+";"
			+"txnoutput id:"+txnid+" tokenid:"+coin.tokenid+" amount:"+coin.amount+" address:"+userdets.minimaaddress.mxaddress+";"
			+"txnsign id:"+txnid+" publickey:"+userdets.minimapublickey+";"
			+"txnpost id:"+txnid+" auto:true txndelete:true;";
	
	//Run it.. 
	MDS.cmd(cmd,function(resp){
		//always delete whatever happens
		MDS.cmd("txndelete id:"+txnid,function(delresp){
			if(callback){
				callback(resp);
			}
		});
	});
}

/**
 * Check if there are any SWAP coins available on MINIMA
 */
function checkMinimaSwapHTLC(userdets, callback){
	
	//First search coins
	var cmd = "coins tokenid:0x00 simplestate:true relevant:true address:"+HTLC_ADDRESS;		
	MDS.cmd(cmd,function(resp){
		
		//How many coins..
		var len=resp.response.length;
		if(len>0){
			
			//Now cycle through the coins..
			for(var i=0;i<len;i++){
				//Get the coin
				var coin=resp.response[i];
				try{
					//Are we the Counterparty..
					if(coin.state[4] == USER_DETAILS.minimapublickey){
						_checkCanSwapCoin(userdets, coin, function(res){});		
					}
				}catch(e){
					MDS.log("ERROR parsing HTLC coin : "+JSON.stringify(coin)+" "+e);
				}
			}
		}
	});
}

function _checkCanSwapCoin(userdets, coin, callback){
	
	MDS.log("CHECK Minima SWAP.. "+JSON.stringify(coin));
	
	//What is the hash of the secret
	var hash = coin.state[5];
	
	//HACK
	//Have we sent the OTHER side txn to get them to reveal the secret..
	haveSentCounterPartyTxn(hash,function(sent){
		if(!sent){
			
			//Check the details are valid!.. FEES etc.. 
			//..
			
			//Send the ETH counter TXN - to make him reveal the secret
			var countertimelock = +coin.state[3] - 5;
			var reqamount 		= coin.state[1];
			
			var state = {};
			state[0]  = userdets.minimapublickey;
			state[1]  = coin.amount;
			state[2]  = "0x00"; // wMinima on ETH
			state[3]  = countertimelock;
			state[4]  = coin.state[0];
			state[5]  = hash;
			
			MDS.log("Send counterparty txn! state:"+JSON.stringify(state));
			 
			//And send from the native wallet..
			sendETH(userdets, reqamount, HTLC_ADDRESS, state, function(resp){
				
				//If success put in DB
				if(resp.status){
					MDS.log("SENT!")
					sentCounterPartyTxn(hash,function(){
						callback(resp);	
					});
				}else{
					MDS.log("FAIL! "+JSON.stringify(resp));
					
					callback(resp);	
				}	
			});
		}else{
			
			//Counter txn sent.. see if we should collect
			
		}
	});
	
	return;
	
	//Do we know the secret..
	/*getSecretFromHash(hash, function(secret){
		if(secret != null){
			//We know the secret! - Collect this coin..
			MDS.log("Can Collect HTLC coin as we know secret!!");
			
		}else{
			
			//Did we start this 
			haveStartedCounterPartySwap(hash,function(started){
				
				//If we didn't start it.. check if we will respond..
				if(!started){
					
					//Have we sent the OTHER side txn to get them to reveal the secret..
					haveSentCounterPartyTxn(hash,function(sent){
						if(!sent){
							
							//Check the details are valid!.. FEES etc.. 
							//..
							
							//Send the ETH counter TXN - to make him reveal the secret
							//..
							
							var state = {};
							state[0]  = userdets.minimapublickey;
							state[1]  = requestamount;
							state[2]  = "0x00000001"; // wMinima on ETH
							state[3]  = timelock;
							state[4]  = swappublickey;
							state[5]  = hash;
							 
							//And send from the native wallet..
							sendMinima(userdets,amount,HTLC_ADDRESS,state,function(resp){
								
								//If success put in DB
								if(resp.status){
									startedCounterPartySwap(hash,function(){
										callback(resp);	
									});
								}else{
									callback(resp);	
								}	
							});
							
							
							//It's sent..
							sentCounterPartyTxn(hash,function(){
								if(callback){
									callback();
								}
							});	
						}
					});			
				}
			});
		}
	});
	*/
}

function _collectMinimaHTLCCoin(userdets, hash, secret, coin, callback){
	
	//Random txn ID
	var txnid = "htlc_collect_txn_"+randomInteger(1,1000000000);
	
	//Create a txn to collect this coin..
	var finalamount = +coin.amount - 0.0001;
			
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
			if(callback){
				callback(resp);
			}
		});
	});
}

