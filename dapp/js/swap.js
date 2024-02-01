
/**
 * Start a Minima -> wMinima SWAP
 */
function startNativeSwap(userdets, amount, requestamount, swappublickey, callback){
	
	//Get the current block
	getCurrentBlock(function(block){
		
		//How long do we wait..
		var timelock = +block+10;
		
		//Create a secret
		createSecretHash(function(secret){
			
			var state = {};
			state[0]  = userdets.minimapublickey;
			state[1]  = requestamount;
			state[2]  = "0x00000001"; // wMinima on ETH
			state[3]  = timelock;
			state[4]  = swappublickey;
			state[5]  = secret;
			 
			//And send from the native wallet..
			sendFromNativeWallet(userdets,amount,HTLC_ADDRESS,state,function(resp){
				callback(resp);	
			});
		});	
	});
}

/**
 * Check if there are any coins in the HTLC that have expired..
 */
function checkTimeLockMinimaHTLC(callback){
	
	//First search coins
	var cmd = "coins simplestate:true relevant:true address:"+HTLC_ADDRESS;		
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
						if(coin.state[0] == USER_DETAILS.minimapublickey){
							//Check if we can collect it..
							var timelock=+coin.state[3];
							if(block>timelock){
								MDS.log("Timelock Collect Expired Coin! timelock:"+timelock+" block:"+block+" amount:"+coin.amount);
								
								//Add to our list
								expired.push(coin);
								
								//Collect the coin
								collectExpiredCoin(USER_DETAILS,coin,function(resp){});
							}	
						}
					}catch(e){
						MDS.log("ERROR parsing expired coin : "+JSON.stringify(coin));
					}
				}
				
				if(callback){
					callback(expired);
				}
			});
		}
	});
}

function collectExpiredCoin(userdets,coin,callback){
	
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
 * Check if there are any coins we can collect
 */
function checkMinimaHTLC(callback){
	
	//First search coins
	var cmd = "coins simplestate:true relevant:true address:"+HTLC_ADDRESS;		
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
						checkCanCollectCoin(coin);		
					}
				}catch(e){
					MDS.log("ERROR parsing HTLC coin : "+JSON.stringify(coin));
				}
			}
		}
	});
}

function checkCanCollectCoin(coin, callback){
	
	//What is the hash of the secret
	var hash = coin.state[5];
	
	//Do we know the secret..
	getSecretFromHash(hash, function(secret){
		if(secret != null){
			//We know the secret! - Collect this coin..
			MDS.log("Can Collect HTLC coin as we know secret!!");
			
		}else{
			
			//Have we sent the OTHER side txn to get them to reveal the secret..
			haveSentCounterPartyTxn(hash,function(sent){
				if(!sent){
					
					//Check the details are valid!.. FEES etc.. 
					//..
					
					//Send the ETH counter TXN - to make him reveal the secret
					//..
					
					//FOR NOW..use Minima..
					var state = {};
					state[0]  = userdets.minimapublickey;
					state[1]  = requestamount;
					state[2]  = "0x00000001"; // wMinima on ETH
					state[3]  = timelock;
					state[4]  = swappublickey;
					state[5]  = secret;
					 
					//And send from the native wallet..
					sendFromNativeWallet(userdets,amount,HTLC_ADDRESS,state,function(resp){
						callback(resp);	
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
