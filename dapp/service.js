
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

//The USER details..
var USER_DETAILS 	= {};

//Main message handler..
MDS.init(function(msg){
	
	//Do initialisation
	if(msg.event == "inited"){
		
		//Get the main user details.. thesew don't change..
		getUserDetails(function(userdets){
			//Get User Details..
			USER_DETAILS=userdets;
			
			//Set Up the HTLC contract script
			setUpHTLCScript(function(resp){});	
			
			//We want to be notified of Coin Events
			MDS.cmd("coinnotify action:add address:"+COIN_NOTIFY);
				
			//Set up the DB
			createDB(function(res){});
			
			//Check at startup..
			checkNeedPublishOrderBook(USER_DETAILS);
		
			//Inited..	
			MDS.log("Bridge Service inited..");
		});
		
	}else if(msg.event == "MDS_TIMER_60SECONDS"){
		
		//Check expired Minima coins
		checkExpiredMinimaHTLC(USER_DETAILS, function(expiredminima){});
		
		//Check expired Wrappped Minima
		checkExpiredETHHTLC(USER_DETAILS, function(expiredeth){});
		
		//Now check Minima for SWAPS
		checkMinimaSwapHTLC(USER_DETAILS,function(swaps){});
		
		//Check ETH for SWAPS
		checkETHSwapHTLC(USER_DETAILS,function(ethswaps){});
		
		//Check if my orderbook has changed..
		checkNeedPublishOrderBook(USER_DETAILS);
			
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
			if(owner==weare || counterparty==weare){
				
				//Get the secret and hash
				var secret 	= coin.state[100];
				var hash 	= coin.state[101];
			
				//Put the secret and hash in the db
				insertSecret(secret,hash,function(added){
					if(added){
						MDS.log("NEW SECRET : "+secret+" : "+hash);		
					}
				});
			}			
		}
	}	
});