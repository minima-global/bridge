
//Load required files..
MDS.load("./js/puresha1.js");
MDS.load("./js/jslib.js");
MDS.load("./js/scripts.js");
MDS.load("./js/auth.js");
MDS.load("./js/orderbook.js");
MDS.load("./js/balance.js");
MDS.load("./js/sql.js");
MDS.load("./js/swap.js");
MDS.load("./js/orderbookutil.js");

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
				
			//Set up the DB
			createDB(function(res){});
			
			//HACK
			//createAndSendOrderBook(USER_DETAILS);
			checkNeedPublishOrderBook(USER_DETAILS);
		
			//Inited..	
			MDS.log("Bridge Service inited..");
		});
		
	}else if(msg.event == "MDS_TIMER_10SECONDS"){
		
		//Check expired coins
		//checkTimeLockMinimaHTLC(function(expired){});
		
		//Check if my orderbook has changed..
		checkNeedPublishOrderBook(USER_DETAILS);
			
	}else if(msg.event == "MDS_TIMER_1HOUR"){
		
		//Always publish your book every hour
		createAndSendOrderBook(USER_DETAILS);
	}	
});