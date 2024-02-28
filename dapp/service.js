
//Load required files..
MDS.load("./js/puresha1.js");
MDS.load("./js/jslib.js");
MDS.load("./js/scripts.js");
MDS.load("./js/auth.js");
MDS.load("./js/sql.js");
MDS.load("./js/orderbook.js");
MDS.load("./js/orderbookutil.js");

//API files for Minima and ETH
MDS.load("./js/apiminima.js");
MDS.load("./js/apieth.js");
MDS.load("./js/balance.js");

MDS.load("./js/ethers-4.0.31.min.js");
MDS.load("./abi/htlcabi.js");
MDS.load("./abi/wminimaabi.js");
MDS.load("./js/ethutil.js");
MDS.load("./js/etherc20util.js");
MDS.load("./js/ethhtlcutil.js");

MDS.load("./js/ethjs-signer.js");

//const signjs = require('ethjs-signer').sign;

				
//The USER details..
var USER_DETAILS 	= {};

//Main message handler..
MDS.init(function(msg){
	
	//Do initialisation
	if(msg.event == "inited"){
		
		MDS.log("Start Bridge Init..");
			
		//Init ETH
		initETHSubSystem(function(){
			
			//Get the main user details.. thesew don't change..
			getUserDetails(function(userdets){
				
				//Get User Details..
				USER_DETAILS=userdets;
				
				//Set Up the HTLC contract script
				setUpHTLCScript(USER_DETAILS, function(resp){
					
					//We want to be notified of Coin Events
					MDS.cmd("coinnotify action:add address:"+COIN_NOTIFY, function(){
						
						//Set up the DB
						createDB(function(res){
							
							//Check at startup..
							checkNeedPublishOrderBook(USER_DETAILS);
									
							//Inited..	
							MDS.log("Bridge Service inited..");	
						});	
					});	
				});	
			});	
		});
				
	}else if(msg.event == "MDS_TIMER_60SECONDS"){
		
		//return;
		
		//SERVICE.js runs function synchromously... as no HTTP call.. 
		//so no need to to stack functions inside each other
		
		//Get the current ETH block
		var ethblock = 0;
		getCurrentETHBlock(function(block){
			//MDS.log("Current ETH block : "+block);
			ethblock = block;
		});
		
		//Auto set the Nonce..
		setNonceAuto(function(){});
			
		//Check for new secrets
		checkETHNewSecrets(ethblock,function(){});
		
		//Check expired Minima coins
		//checkExpiredMinimaHTLC(USER_DETAILS, function(expiredminima){});
		
		//Check expired Wrappped Minima
		checkExpiredETHHTLC(ethblock,function(expiredeth){});
		
		//Now check Minima for SWAPS
		//checkMinimaSwapHTLC(USER_DETAILS,function(swaps){});
		
		//Check ETH for SWAPS
		//checkETHSwapHTLC(USER_DETAILS,ethblock, function(ethswaps){});
		
		//Check if my orderbook has changed..
		//checkNeedPublishOrderBook(USER_DETAILS);	
	
			
	}else if(msg.event == "MDS_TIMER_1HOUR"){
		
		//Always publish your book every hour
		createAndSendOrderBook(USER_DETAILS);
	
	}else if(msg.event == "NOTIFYCOIN"){
		
		//Is it relevant to Bridge
		if(msg.data.address ==  COIN_NOTIFY){
			
			//Is it relevant to us!
			//MDS.log("NOTIFYCOIN : "+JSON.stringify(msg.data));
			
			//Get the coin
			var coin = msg.data.coin;
			
			//Get the Relevant users..
			var owner 		 = coin.state[102];
			var counterparty = coin.state[103];
			var weare 		 = "["+USER_DETAILS.minimapublickey+"]" 
			
			//Are we either..
			if(weare==owner || weare==counterparty){
				
				//Get the secret and hash
				var secret 	= coin.state[100];
				var hash 	= coin.state[101];
			
				//Put the secret and hash in the db
				insertSecret(secret,hash,function(added){
					if(added){
						MDS.log("NEW SECRET for hash "+hash);		
					}
				});
			}			
		}
	}	
});