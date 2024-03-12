
/**
 * Get the current Minima block
 */
function getCurrentMinimaBlock(callback){
	MDS.cmd("block",function(resp){
		callback(+resp.response.block);
	});
}

/**
 * Get the time for a block in the future
 */
function getTimeForBlock(currentblock, futureblock){
	var diff 	= futureblock - currentblock;
	var ctime 	= getCurrentUnixTime();
	return ctime + (diff*MINIMA_BLOCK_TIME); 
}

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
			minimabalance.confirmed 	= confirmed;
			minimabalance.unconfirmed 	= unconfirmed;
			minimabalance.total 		= +resp.response.variables.roundedtotal;
			minimabalance.coins			= +balresp.response[0].coins;
			
			//Send this..
			callback(minimabalance);		
		});
	});
}

/**
 * Send funds from the Brideg Wallet 
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
		if(resp.status){
			logDeposit("minima",amount);	
		}
		callback(resp);			
	});
}

/**
 * Create the HTLC state required by a coin
 */
function createHTLCState(owner, ownerethkey, receiver, 
							requestamount, reqtoken, timelock, hashlock, otc){
	var state = {};
	state[0]  = owner;
	state[1]  = ""+requestamount;
	state[2]  = "["+reqtoken+"]"; 
	state[3]  = timelock;
	state[4]  = receiver;
	state[5]  = hashlock;
	state[6]  = ownerethkey;
	state[7]  = otc;
	
	return state;
}

/**
 * UTIL functions to get data from HTLC coins
 */
function getCoinHTLCData(coin,dataparam){
	
	if(dataparam == "owner"){
		return coin.state[0];
	}else if(dataparam == "ownereth"){
		return coin.state[6];
	}else if(dataparam == "receiver"){
		return coin.state[4];
	}else if(dataparam == "amount"){
		return +coin.amount;
	}else if(dataparam == "requestamount"){
		return +coin.state[1];
	}else if(dataparam == "requesttoken"){
		var token = coin.state[2].substring(1,coin.state[2].length-1);
		if(token.startsWith("ETH:")){
			token = token.substring(4);
		}
		return token;
	}else if(dataparam == "requesttokentype"){
		
		//First get the token
		var token = getCoinHTLCData(coin,"requesttoken");
		
		//Now decipher to plain speak
		if(token == wMinimaContractAddress){
			return "wMinima";
		}else if(token == USDTContractAddress){
			return "USDT";
		}
		
		return "UNKNOWN";
		
	}else if(dataparam == "hashlock"){
		return coin.state[5];
	}else if(dataparam == "timelock"){
		return +coin.state[3];
	}else if(dataparam == "otc"){
		return coin.state[7] == "TRUE";
	}
	
	return undefined;	
}

/**
 * Start a Minima -> wMinima SWAP
 */
function startMinimaSwap(userdets, amount, requestamount, reqtoken, swappublickey, otc, callback){
	
	//Get the current block
	getCurrentMinimaBlock(function(block){
		
		//How long do we wait..
		var timelock = +block+HTLC_TIMELOCK_BLOCKS;
		
		//Create a secret
		createSecretHash(function(hash){
			
			//Create the required state vars
			var state = createHTLCState(userdets.minimapublickey,
										userdets.ethaddress,
										swappublickey,
										requestamount,
										reqtoken,
										timelock,
										hash,
										otc);
			
			//And send from the native wallet..
			sendMinima(userdets,amount,HTLC_ADDRESS,state,function(resp){
				
				//If success put in DB
				if(resp.status){
					
					//Log it..
					startedCounterPartySwap(hash,"minima",amount,resp.response.txpowid,function(){
						
						//Insert these details so you know in future if right amount sent
						insertNewHTLCContract(hash,requestamount,reqtoken,function(){
							callback(resp);	
						});
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
function checkExpiredMinimaHTLC(userdets, block, callback){
	
	//First search coins
	var cmd = "coins coinage:2 tokenid:0x00 simplestate:true relevant:true address:"+HTLC_ADDRESS;		
	MDS.cmd(cmd,function(resp){
		
		//All expired.. 
		var expired = [];
			
		//How many coins..
		var len=resp.response.length;
		
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
								
							MDS.log("Timelock Collect Expired Minima Coin! timelock:"
										+timelock+" block:"+block+" amount:"+coin.amount+" hash:"+getCoinHTLCData(coin,"hashlock"));
						
							//Add to our list
							expired.push(coin);
							
							//Collect the coin
							_collectExpiredCoin(userdets,coin,function(){});	
					
					}else{
						//MDS.log("Timelock CANNOT YET Collect Expired Minima Coin! timelock:"+timelock+" block:"+block+" amount:"+coin.amount);
					}	
				}
			}catch(e){
				MDS.log("ERROR (checkExpiredMinimaHTLC) parsing Minima expired coin : "+JSON.stringify(coin)+" "+e);
			}
		}
		
		//And return data..	
		if(callback){
			callback(expired);
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
			
			//Log it..	
			collectExpiredHTLC(getCoinHTLCData(coin,"hashlock"),"minima",coin.amount,"0x00",function(){
				callback(resp);
			});
		});
	});
}

/**
 * Check if there are any SWAP coins available on MINIMA
 */
function checkMinimaSwapHTLC(userdets, block, callback){
	
	//First search coins
	var cmd = "coins coinage:2 tokenid:0x00 simplestate:true relevant:true address:"+HTLC_ADDRESS;		
	MDS.cmd(cmd,function(resp){
		
		//How many coins..
		var len=resp.response.length;
		for(var i=0;i<len;i++){
			
			//Get the coin
			var coin=resp.response[i];
			try{
				if(getCoinHTLCData(coin,"receiver") == USER_DETAILS.minimapublickey){
					_checkCanSwapCoin(userdets, coin, block, function(res){});		
				}
			}catch(e){
				MDS.log("ERROR (checkMinimaSwapHTLC) parsing HTLC coin : "+JSON.stringify(coin)+" "+e);
			}	
		}
		
		if(callback){
			callback();
		}
	});
}

function _checkCanSwapCoin(userdets, coin, block, callback){
	
	//Make sure is Minima..
	if(coin.tokenid != "0x00"){
		//Not Minima!..
		MDS.log("NOT a Minima HTLC.. token:"+coin.tokenid);
		return;
	}
	
	//Details of thre HTLC
	var hash 	 		= getCoinHTLCData(coin,"hashlock");
	var timelock 		= getCoinHTLCData(coin,"timelock");
	var token 			= getCoinHTLCData(coin,"requesttoken");
	
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
					if(+reqamount.REQAMOUNT > +coin.amount){
						
						//Incorrect amount - do NOT reveal the secret
						MDS.log("ERROR : Incorrect amount HTLC required:"+reqamount.REQAMOUNT+" htlc:"+JSON.stringify(coin));
						collectHTLC(hash, "minima", 0, "Incorrect amount", function(sqlresp){});	
						
						return;
					}
					
					//Check is the correct token..
					var reqtoken = reqamount.TOKEN;
					if(reqtoken.startsWith("ETH:")){
						reqtoken = reqtoken.substring(4);
					}
					
					//Is it correct
					if(token != reqtoken){
						MDS.log("ERROR : Incorrect token HTLC required:"+reqamount.TOKEN+" htlc:"+JSON.stringify(coin));
						collectHTLC(hash, "minima", 0, "Incorrect token", function(sqlresp){});	
						return;
					}
				}
				
				//We can collect
				MDS.log("Can Collect Minima HTLC coin as we know secret for hash "+hash);
				_collectMinimaHTLCCoin(userdets, hash, secret, coin, function(resp){});
			});
			
		}else{
			
			//Is it an OTC deal..
			if(coin.state[7] == "TRUE"){
				//Needs to be OK'ed in the frontend
				//MDS.log("OTC DEAL FOUND.. ! leaving for now.."+JSON.stringify(coin));
				callback();
				return;
			}
					
			//Have we sent the OTHER side txn to get them to reveal the secret..
			haveSentCounterPartyTxn(hash,function(sent){
				
				//Only send it once..
				if(!sent){
					
					//Check the timelock is in good time..
					var tdiff = timelock-block;
					if(tdiff < HTLC_TIMELOCK_COUNTERPARTY_BLOCKS_CHECK){
						MDS.log("TIMELOCK ("+HTLC_TIMELOCK_COUNTERPARTY_BLOCKS_CHECK+" blocks) MINIMA TOO close to proceed.. "
								+"not sending counterpartytxn.. timelock:"
								+timelock+" currentblock:"+block+" hash:"+hash);
						return;
					}
					
					//Check the details are valid!.. FEES etc.. 
					getMyOrderBook(function(myorderbook){
						
						//Which orderbook are we using
						var ob = {};
						var simplename = "";
						if(token == wMinimaContractAddress){
							ob = myorderbook.wminima;
							simplename = "wminima";
						}else if(token == USDTContractAddress){
							ob = myorderbook.usdt;
							simplename = "usdt";
						}else{
							//ERROR
							MDS.log("Invalid request for swap - unknown token : "+token);
							sentCounterPartyTxn(hash,"ETH:"+token,0,"Invalid request unknown token",function(){});
							return;
						}
						
						//Check we are enabled to swap this token
						if(!ob.enable){
							MDS.log("Invalid request for "+simplename+" swap - not enabled");
							sentCounterPartyTxn(hash,"ETH:"+token,0,"Invalid request not enabled",function(){});
							return;	
						}
						
						//Check the details are valid!.. FEES etc.. 
						var sendamount 		= toFixedNumber(coin.amount); 
						var requestamount 	= toFixedNumber(coin.state[1]);
							
						//Make sure is within limits
						if(requestamount > ob.maximum){
							MDS.log("Invalid request to buy "+simplename+" ("+requestamount+") exceeds Maximum "+ob.maximum);
							sentCounterPartyTxn(hash,"ETH:"+token,0,"Exceeds Maximum "+requestamount,function(){});
							return;	
						}else if(requestamount < ob.minimum){
							MDS.log("Invalid request to buy "+simplename+" ("+requestamount+") exceeds Minimum "+ob.minimum);
							sentCounterPartyTxn(hash,"ETH:"+token,0,"Exceeds Minimum "+requestamount,function(){});
							return;	
						}
						
						//Calculate how much we should send back..
						var calcamount = calculateAmount("sell",sendamount,simplename,myorderbook);
						if(requestamount <= calcamount){
							
							//Send the ETH counter TXN - to make him reveal the secret
							sendCounterPartyMinimaTxn(userdets,coin,function(resp){});
							
						}else{
							MDS.log("Invalid request amount for Minima SWAP sent:"+sendamount+" requested:"+requestamount+" of "+simplename+" actual:"+calcamount)
							sentCounterPartyTxn(hash,"ETH:"+token,0,"Invalid swap amount sent:"+sendamount+" request:"+requestamount,function(){});
						}
					});
				}
			});
		}
	});	
}

/**
 * Check for any OTC swap on the Minima Chain
 */
function checkForCurrentSwaps(wantotcdeals, callback){
		
	//All the OTC deals..
	var otcdeals 		= {};
	otcdeals.owner 		= [];
	otcdeals.receiver 	= [];
	
	//First search coins
	var cmd = "coins tokenid:0x00 simplestate:true relevant:true address:"+HTLC_ADDRESS;		
	MDS.cmd(cmd,function(resp){
		
		//How many coins..
		var len=resp.response.length;
		for(var i=0;i<len;i++){
			
			//Get the coin
			var coin=resp.response[i];
			try{
				
				//What is the OTC state
				var otcstate = getCoinHTLCData(coin,"otc");
				
				//Is it OTC
				if((wantotcdeals && otcstate) || (!wantotcdeals && !otcstate)){
					
					//Are you owner or receiver..
					if(getCoinHTLCData(coin,"receiver") == USER_DETAILS.minimapublickey){
						otcdeals.receiver.push(coin);		
					}else if(coin.state[0] == USER_DETAILS.minimapublickey){
						otcdeals.owner.push(coin);
					}
				}
				
			}catch(e){
				MDS.log("ERROR (checkForOTC) parsing HTLC coin : "+JSON.stringify(coin)+" "+e);
			}	
		}
		
		if(callback){
			callback(otcdeals);
		}
	});
}

/**
 * Manually accept an OTC deal - REDO NONCE as is from frontend..
 */
function acceptOTCSwapCoin(userdets, coinid, callback){
	
	//Get this coin..
	MDS.cmd("coins tokenid:0x00 simplestate:true coinid:"+coinid, function(resp){
		
		//Get the coin..
		var coin = resp.response[0];
		if(!coin){
			callback(false,"Coin NOT found "+coinid);
			return;
		}
		
		//Get the current block
		getCurrentMinimaBlock(function(block){
			
			//What is the hash of the secret
			var hash 	 =  getCoinHTLCData(coin,"hashlock");
			var timelock = +coin.state[3];
			
			//Have we sent the OTHER side txn to get them to reveal the secret..
			haveSentCounterPartyTxn(hash,function(sent){
				
				//Only send it once..
				if(!sent){
					
					//Check the timelock is in good time..
					var tdiff = timelock-block;
					if(tdiff < HTLC_TIMELOCK_COUNTERPARTY_BLOCKS_CHECK){
						var error = ("TIMELOCK ("+HTLC_TIMELOCK_COUNTERPARTY_BLOCKS_CHECK+" blocks) MINIMA TOO close to proceed.. "
								+"not sending counterpartytxn.. timelock:"
								+timelock+" currentblock:"+block+" hash:"+hash);
						callback(false,error);
					}else{
						
						//REDO the nonce - as this is sent from the frontend
						setNonceAuto(function(nonce){
							//Send the ETH counter TXN - to make him reveal the secret
							sendCounterPartyMinimaTxn(userdets,coin,function(resp){
								callback(resp.status,JSON.stringify(resp));	
							});	
						});
							
					}
				}else{
					callback(false,"Allready sent counterparty txn..");	
				}
			});		
		});
	});
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
			+"txnoutput id:"+txnid+" tokenid:"+coin.tokenid+" amount:0.0001 address:"+COIN_SECRET_NOTIFY+";"
			
			//Send the coin back to me..
			+"txnoutput id:"+txnid+" tokenid:"+coin.tokenid+" amount:"+finalamount+" address:"+userdets.minimaaddress.mxaddress+";"
			
			//Set the correct state vars.. the secret etc..
			+"txnstate id:"+txnid+" port:100 value:\""+secret+"\";"
			+"txnstate id:"+txnid+" port:101 value:\""+hash+"\";"
			+"txnstate id:"+txnid+" port:102 value:\"["+coin.state[0]+"]\";"
			+"txnstate id:"+txnid+" port:103 value:\"["+getCoinHTLCData(coin,"receiver")+"]\";"
			
			//Sign it..
			+"txnsign id:"+txnid+" publickey:"+userdets.minimapublickey+";"
			
			//AND POST!
			+"txnpost id:"+txnid+" mine:true auto:true txndelete:true;";
	
	//Run it.. 
	MDS.cmd(cmd,function(resp){
		
		//Get the TxPowID
		var status  = false;
		var txpowid = "0x00";
		if(resp.length==10){
			var postcmd = resp[9];
			status 		= postcmd.status;
			if(status){
				txpowid = postcmd.response.txpowid; 
			}	
		}
		
		//always delete whatever happens
		MDS.cmd("txndelete id:"+txnid,function(delresp){
			
			//If success - Log it..
			if(status){
				collectHTLC(getCoinHTLCData(coin,"hashlock"),"minima",finalamount+"",txpowid);	
			}	
			
			if(callback){
				callback(resp);
			}
		});
	});
}

function sendCounterPartyMinimaTxn(userdets, coin, callback){
	
	//requested amount
	var amount = getCoinHTLCData(coin,"requestamount");
	
	//Requested token - remove brackets and ETH:
	var token 		= getCoinHTLCData(coin,"requesttoken");
	var tokentype 	= getCoinHTLCData(coin,"requesttokentype");
	
	//What do you expect.. 
	var reqamount = getCoinHTLCData(coin,"amount");
	
	//The hashlock
	var hashlock = getCoinHTLCData(coin,"hashlock");
	
	//Set some time in the future..
	var timelock = getCurrentUnixTime() + HTLC_TIMELOCK_COUNTERPARTY_SECS;
	
	//The receiver is the ETH owner key
	var receiver = getCoinHTLCData(coin,"ownereth");
	
	MDS.log("Send counterparty ETH ("+tokentype+") txn for hashlock:"+hashlock);
	
	//Set up the next HTLC 
	setupETHHTLCSwap(	userdets.minimapublickey,
						receiver, 
					 	hashlock, 
						timelock, 
						token, 
						amount, 
						reqamount, function(ethresp){
		
		//If success put in DB
		if(ethresp.status){
			sentCounterPartyTxn(hashlock,"ETH:"+token,reqamount,ethresp.result,function(){
				callback(ethresp);	
			});
		}else{
			MDS.log("FAIL Send counterparty ETH txn "+JSON.stringify(ethresp));
			callback(ethresp);	
		}			
	});
}

