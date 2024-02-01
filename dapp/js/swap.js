
function startNativeSwap(userdets, amount, requestamount, swappublickey, callback){
	
	//Get the current block
	getCurrentBlock(function(block){
		
		var timelock = +block+10;
		
		//Create a secret
		createSecretHash(function(secret){
			
			var state = {};
			state[0]  = userdets.minimapublickey;
			state[1]  = requestamount;
			state[2]  = "0x0001"; // wMinima on ETH
			state[3]  = timelock;
			state[4]  = swappublickey;
			state[5]  = secret;
			
			MDS.log(JSON.stringify(state));
			 
			//And send from the native wallet..
			sendFromNativeWallet(userdets,amount,HTLC_ADDRESS,state,function(resp){
				callback(resp);	
			});
		});	
	});
}

//Check if there are any coins in the HTLC that have expired..
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
								MDS.log("Timelock Collect Expired Coin! "+timelock+"/"+block);
								
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
	
	var txnid = "txn_"+randomInteger(1,1000000000);
	
	//Create a txn to collect this coin..
	var cmd = "txncreate id:"+txnid+";"
			+"txninput id:"+txnid+" coinid:"+coin.coinid+";"
			+"txnoutput id:"+txnid+" tokenid:"+coin.tokenid+" amount:"+coin.amount+" address:"+userdets.minimaaddress.mxaddress+";"
			+"txnsign id:"+txnid+" publickey:"+userdets.minimapublickey+";"
			+"txnpost id:"+txnid+" auto:true txndelete:true;";
	
	MDS.cmd(cmd,function(resp){
		MDS.log(JSON.stringify(resp));
		
		if(callback){
			callback(resp);
		}
	})
}