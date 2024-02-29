
/**
 * Some vars 
 */

//The timelock in BLOCK that gets added
var HTLC_TIMELOCK_BLOCKS = 10;

/**
 * Get the current Minima block
 */
function getCurrentMinimaBlock(callback){
	MDS.cmd("block",function(resp){
		callback(resp.response.block);
	});
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
		if(resp.status){
			logDeposit("minima",amount);	
		}
		callback(resp);			
	});
}

/**
 * Create the HTLC state required by a coin
 */
function createHTLCState(owner, ownerethkey, receiver, requestamount, timelock, hashlock){
	var state = {};
	state[0]  = owner;
	state[1]  = ""+requestamount;
	state[2]  = "[ETH:0x669C01CAF0EDCAD7C2B8DC771474AD937A7CA4AF]"; // wMinima on ETH
	state[3]  = timelock;
	state[4]  = receiver;
	state[5]  = hashlock;
	state[6]  = ownerethkey;
	
	return state;
}

/**
 * Start a Minima -> wMinima SWAP
 */
function startMinimaSwap(userdets, amount, requestamount, swappublickey, callback){
	
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
										timelock,
										hash);
			
			//And send from the native wallet..
			sendMinima(userdets,amount,HTLC_ADDRESS,state,function(resp){
				
				//If success put in DB
				if(resp.status){
					
					//Log it..
					startedCounterPartySwap(hash,"minima",amount,resp.response.txpowid,function(){
						
						//Insert these details so you know in future if right amount sent
						insertNewHTLCContract(hash,requestamount,"wminima",function(){
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
function checkExpiredMinimaHTLC(userdets, callback){
	
	//First search coins
	var cmd = "coins coinage:2 tokenid:0x00 simplestate:true relevant:true address:"+HTLC_ADDRESS;		
	MDS.cmd(cmd,function(resp){
		
		//How many coins..
		var len=resp.response.length;
		if(len>0){
			
			//Coins found..
			getCurrentMinimaBlock(function(blockstr){
				
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
										
									MDS.log("Timelock Collect Expired Minima Coin! timelock:"
												+timelock+" block:"+block+" amount:"+coin.amount+" hash:"+coin.state[5]);
								
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
			
			//Log it..	
			collectExpiredHTLC(coin.state[5],"minima",coin.amount,"0x00",function(){
				callback(resp);
			});
		});
	});
}

/**
 * Check if there are any SWAP coins available on MINIMA
 */
function checkMinimaSwapHTLC(userdets, callback){
	
	//First search coins
	var cmd = "coins coinage:2 tokenid:0x00 simplestate:true relevant:true address:"+HTLC_ADDRESS;		
	MDS.cmd(cmd,function(resp){
		
		//How many coins..
		var len=resp.response.length;
		for(var i=0;i<len;i++){
			
			//Get the coin
			var coin=resp.response[i];
			try{
				if(coin.state[4] == USER_DETAILS.minimapublickey){
					_checkCanSwapCoin(userdets, coin, function(res){});		
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

function _checkCanSwapCoin(userdets, coin, callback){
	
	//Make sure is Minima..
	if(coin.tokenid != "0x00"){
		//Not Minima!..
		MDS.log("NOT a Minima HTLC.. token:"+coin.tokenid);
		if(callback){
			callback();
		}	
		return;
		
	}
	
	//What is the hash of the secret
	var hash = coin.state[5];
	
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
					if(+reqamount.REQAMOUNT > +coin.amount){
						
						//Incorrect amount - do NOT reveal the secret
						MDS.log("ERROR : Incorrect amount HTLC required:"+reqamount.REQAMOUNT+" htlc:"+JSON.stringify(coin));
						collectHTLC(hash, "minima", coin.amount, "0xCC", function(sqlresp){
							callback();		
						});	
						
						return;
					}
				}
				
				//We can collect
				MDS.log("Can Collect Minima HTLC coin as we know secret for hash "+hash);
				_collectMinimaHTLCCoin(userdets, hash, secret, coin, function(resp){
					if(callback){
						callback(resp);
					}
				});
			});
			
		}else{
					
			//Have we sent the OTHER side txn to get them to reveal the secret..
			haveSentCounterPartyTxn(hash,function(sent){
				
				//Only send it once..
				if(!sent){
					
					//Check the timelock is in good time..
					//..
					
					//Check the details are valid!.. FEES etc.. 
					getMyOrderBook(function(myorderbook){
						
						//Are we enabled
						//MDS.log("SKIPPING ORDER BOOK CHECK FOR MINIMA SWAP!")
						if(myorderbook.wrappedenable){
							//Check the details are valid!.. FEES etc.. 
							var sendamount 		= +coin.amount; 
							var requestamount 	= +coin.state[1];
						
							//Calculate how much we should send back..
							var calcamount = calculateRequiredAmount("wminima",sendamount,myorderbook);
							if((calcamount >= requestamount)){
								
								//Send the ETH counter TXN - to make him reveal the secret
								sendCounterPartyMinimaTxn(userdets,coin,function(resp){
									if(callback){
										callback(resp);
									}
								});
								
							}else{
								MDS.log("Invalid request amount for Minima SWAP sent minima:"+sendamount+" requestedwminima:"+requestamount+" actual:"+calcamount)
							}	
							
						}else{
							MDS.log("Invalid request for ETH swap - not enabled");
						}
					});
				}
			});
		}
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
			collectHTLC(coin.state[5],"minima",finalamount+"");
			
			if(callback){
				callback(resp);
			}
		});
	});
}

function sendCounterPartyMinimaTxn(userdets, coin, callback){
	
	//requested amount
	var amount 			= coin.state[1];
	
	//What do you expect.. not rerally needed
	var reqamount 		= coin.amount;
	
	//The hashlock
	var hashlock 		= coin.state[5];
	
	//Set some time in the future..
	var timelock 		= getCurrentUnixTime() + 300;
	
	//The receiver is the ETH owner key
	var receiver		= coin.state[6];
	
	MDS.log("Send counterparty ETH txn for hashlock:"+hashlock);
	
	//Set up the next HTLC 
	setupETHHTLCSwap(	userdets.minimapublickey,
						receiver, 
					 	hashlock, 
						timelock, 
						wMinimaContractAddress, 
						amount, 
						reqamount, function(ethresp){
		
		//If success put in DB
		if(ethresp.status){
			sentCounterPartyTxn(hashlock,"wminima",reqamount,ethresp.result,function(){
				callback(ethresp);	
			});
		}else{
			MDS.log("FAIL! "+JSON.stringify(ethresp));
			callback(ethresp);	
		}			
	});
}

