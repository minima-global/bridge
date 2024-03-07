
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

MDS.load("./abi/erc20abi.js");
MDS.load("./js/etherc20util.js");
MDS.load("./js/etherc20wMinima.js");
MDS.load("./js/etherc20USDT.js");

MDS.load("./js/htlcvars.js");
MDS.load("./abi/htlcabi.js");
MDS.load("./js/ethhtlcutil.js");

MDS.load("./js/ethutil.js");

MDS.load("./js/ethjs-signer.js");
				
//The USER details..
var USER_DETAILS 	= {};

//Has the bridge been initialised - done in the frontend
var BRIDGE_INITED = false;

//Check and init the bridge - when you can
function serviceCheckBridgeInited(){
	
	//Have we already done this..
	if(BRIDGE_INITED){
		return;
	}
	
	//Are we inited..
	isBridgeInited(function(inited){
		BRIDGE_INITED = inited;
		
		//IF inited.. get the details..
		if(BRIDGE_INITED){
			
			//Init ETH
			initETHSubSystem(function(ethaddress){
				//Now get the user details.. need ETH to havce started up
				getUserDetails(function(userdets){
					USER_DETAILS = userdets;
				});
			});	
		}
	});
}

//Main message handler..
MDS.init(function(msg){
	
	//Do initialisation
	if(msg.event == "inited"){
		
		MDS.log("Bridge Init start..");
		
		//Are we inited..
		serviceCheckBridgeInited();
		
		//We want to be notified of Coin Secret Events
		setupCoinSecretEvents(function(notify){});
		
		//Are we already inited.. then check order book
		if(BRIDGE_INITED){
			createAndSendOrderBook(USER_DETAILS,function(){});
		}
						
		MDS.log("Bridge Inited..");
		
		return;
	}
	
	//Check the bridge has inited..
	serviceCheckBridgeInited();
	if(!BRIDGE_INITED){
		MDS.log("BRIDGE NOT YET INITED:"+JSON.stringify(msg.event));
		return;
	}
	
	//NOW we can continue..
	if(msg.event == "MDS_TIMER_60SECONDS"){
		
		//SERVICE.js runs function synchromously... as no HTTP call.. 
		//so no need to to stack functions inside each other
		
		//Get the current ETH block
		var ethblock = 0;
		getCurrentETHBlock(function(block){
			ethblock = block;
		});
		
		//Get the current Minima block
		var minimablock = 0;
		getCurrentMinimaBlock(function(mblock){
			minimablock = +mblock;
		});
		
		//Auto set the Nonce..
		setNonceAuto(function(){});
			
		//Check for new secrets
		checkETHNewSecrets(ethblock,function(){});
		
		//Check expired Minima coins
		checkExpiredMinimaHTLC(USER_DETAILS, minimablock, function(expiredminima){});
		
		//Check expired Wrappped Minima
		checkExpiredETHHTLC(ethblock, function(expiredeth){});
		
		//Now check Minima for SWAPS
		checkMinimaSwapHTLC(USER_DETAILS, minimablock, function(swaps){});
		
		//Check ETH for SWAPS
		checkETHSwapHTLC(USER_DETAILS,ethblock, minimablock, function(ethswaps){});
		
		//Check if my orderbook has changed..
		checkNeedPublishOrderBook(USER_DETAILS);	
			
	}else if(msg.event == "MDS_TIMER_1HOUR"){
		
		//Always publish your book every hour
		createAndSendOrderBook(USER_DETAILS);
	
	}else if(msg.event == "NEWBLOCK"){
	
		//Check the Complete Order Book - will only check sigs for NEW entries..
		createCompleteOrderBook(function(completeorderbook){});
	
	}else if(msg.event == "NOTIFYCOIN"){
		
		//Is it relevant to Bridge
		if(msg.data.address ==  COIN_SECRET_NOTIFY){
			
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
						MDS.log("NEW SECRET from Minima for hash "+hash);		
					}
				});
			}			
		}
	}	
});