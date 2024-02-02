
var TOKEN_ID_TEST ="0xF5CFEC47B652DEA8E62C444107FA5CC91F122F47E3DDA14F0561E17450E59856";

/**
 * Get the balance of your Minima Coins
 */
function getETHBalance(userdetails,callback){
	MDS.cmd("balance tokenid:"+TOKEN_ID_TEST+" address:"+userdetails.minimaaddress.mxaddress,function(balresp){
		
		//Do we have ANY..
		if(balresp.response.length == 0){
			
			//Create balance object
			var ethbalance 			= {};
			ethbalance.confirmed	= 0;
			ethbalance.unconfirmed	= 0;
			ethbalance.total 		= 0;
			ethbalance.rounded 		= 0;
			ethbalance.coins		= 0;
			
			//Send this..
			callback(ethbalance);
			
		}else{
			var confirmed 	= balresp.response[0].confirmed;
			var unconfirmed = balresp.response[0].unconfirmed;
			
			//Add the confirmed and unconfirmed
			var add = "runscript script:\"LET total="+confirmed+"+"+unconfirmed
					 +" LET roundedtotal=FLOOR(total)\"";
				
			MDS.cmd(add,function(resp){
				
				//Create balance object
				var ethbalance 			= {};
				ethbalance.confirmed	= confirmed;
				ethbalance.unconfirmed	= unconfirmed;
				ethbalance.total 		= resp.response.variables.total;
				ethbalance.rounded 		= resp.response.variables.roundedtotal;
				ethbalance.coins		= balresp.response[0].coins;
				
				//Send this..
				callback(ethbalance);		
			});	
		}
	});
}

/**
 * Sendf funds from the Brideg Wallet 
 */
function sendETH(userdets, amount, address, state, callback){
	
	//The state ius a JSON of the state
	var statestr = JSON.stringify(state);
	
	//Send that amount to his address
	MDS.cmd("send amount:"+amount
			+" mine:true"
			+" address:"+address
			+" fromaddress:"+userdets.minimaaddress.mxaddress
			+" signkey:"+userdets.minimapublickey
			+" state:"+statestr
			+" tokenid:"+TOKEN_ID_TEST, function(resp){
		callback(resp);				
	});
}

/**
 * Deposit wMinima from main Wallet to your Brideg Wallet
 */
function depositWrappedMinima(userdets, amount, callback){
	//Send that amount to his address
	MDS.cmd("send amount:"+amount
			+" address:"+userdets.minimaaddress.mxaddress
			+" tokenid:"+TOKEN_ID_TEST+" split:10",function(resp){
		callback(resp);			
	});
}

/**
 * Start a wMinima -> Minima SWAP
 */
function startETHSwap(userdets, amount, requestamount, swappublickey, callback){
	
	//Get the current block
	getCurrentBlock(function(block){
		
		//How long do we wait..
		var timelock = +block+20;
		
		//Create a secret
		createSecretHash(function(hash){
			
			var state = {};
			state[0]  = userdets.minimapublickey;
			state[1]  = requestamount;
			state[2]  = "0x00"; // Minima TokenID
			state[3]  = timelock;
			state[4]  = swappublickey;
			state[5]  = hash;
			 
			//And send from the native wallet..
			sendETH(userdets,amount,HTLC_ADDRESS,state,function(resp){
				
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
function checkExpiredETHHTLC(userdets, callback){
	
	//First search coins
	var cmd = "coins tokenid:"+TOKEN_ID_TEST+" simplestate:true relevant:true address:"+HTLC_ADDRESS;		
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
								MDS.log("Timelock Collect Expired ETH Coin! timelock:"+timelock+" block:"+block+" amount:"+coin.tokenamount);
								
								//Add to our list
								expired.push(coin);
								
								//Collect the coin
								_collectExpiredETHCoin(userdets, coin, function(){});
							}else{
								MDS.log("Timelock CANNOT YET Collect Expired ETH Coin! timelock:"+timelock+" block:"+block+" amount:"+coin.tokenamount);
							}	
						}
					}catch(e){
						MDS.log("ERROR parsing expired coin : "+JSON.stringify(coin)+" "+e);
					}
				}
				
				if(callback){
					callback(expired);
				}
			});
		}
	});
}

function _collectExpiredETHCoin(userdets,coin,callback){
	
	//Random txn ID
	var txnid = "htlc_collect_txn_"+randomInteger(1,1000000000);
	
	//Create a txn to collect this coin..
	var cmd = "txncreate id:"+txnid+";"
			+"txninput id:"+txnid+" coinid:"+coin.coinid+";"
			+"txnoutput id:"+txnid+" tokenid:"+coin.tokenid+" amount:"+coin.tokenamount+" address:"+userdets.minimaaddress.mxaddress+";"
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
 * Check if there are any SWAP coins
 */
function checkETHSwapHTLC(userdets, callback){
	
	//First search coins
	var cmd = "coins tokenid:"+TOKEN_ID_TEST+" simplestate:true relevant:true address:"+HTLC_ADDRESS;		
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
					if(coin.state[4] == userdets.minimapublickey){
						_checkCanCollectETHCoin(userdets, coin, function(swapcoins){});		
					}
				}catch(e){
					MDS.log("ERROR parsing HTLC coin : "+JSON.stringify(coin)+" "+e);
				}
			}
		}
	});
}

function _checkCanCollectETHCoin(userdets, coin, callback){
	
	MDS.log("CHECK ETH SWAP.. "+JSON.stringify(coin));
	
	//What is the hash of the secret
	var hash = coin.state[5];
	
	//Do we know the secret..
	getSecretFromHash(hash, function(secret){
		if(secret != null){
			
			//We know the secret! - Collect this coin..
			MDS.log("Can Collect Minima HTLC coin as we know secret!!" +JSON.stringify(coin));
			
			//Collect the Minimam coin..
			_collectETHHTLCCoin(userdets, coin, function(collect){
				
			});
		}
	});
}

function _collectETHHTLCCoin(userdets, coin, callback){
	
	//Random txn ID
	var txnid = "htlc_collect_txn_"+randomInteger(1,1000000000);
	
	//Create a txn to collect this coin..
	var cmd = "txncreate id:"+txnid+";"
	
			//Add the HTLC coin..
			+"txninput id:"+txnid+" coinid:"+coin.coinid+";"
			
			//Send the coin back to me..
			+"txnoutput id:"+txnid+" tokenid:"+coin.tokenid+" amount:"+coin.tokenamount+" address:"+userdets.minimaaddress.mxaddress+";"
			
			//Also add an output to the notify coin address..
			//..
			
			//Set the correct state vars.. the secret etc..
			//..
			
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


