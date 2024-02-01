
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
var myoldorderbook 	= JSON.stringify(getEmptyOrderBook());
var myoldbalance 	= {};

//Are we providing liquidity
var IS_LIQUIDITY = false;

//Check YOUR orderBook details..
function checkMyOrderBook(callback){
	
	//My Order book status..
	getMyOrderBook(function(myorderbook){
		
		//Any change..
		var newbook = JSON.stringify(myorderbook);
		
		//Are they the same..
		if(myoldorderbook != newbook){
			MDS.log("My Order book changed..");
			
			//Get his balance..
			broadcastMyOrderBook(USER_DETAILS,function(sendvalid){
				
				//Success send..?
				if(sendvalid){
					
					//Are we liquiduty - update on balance change
					IS_LIQUIDITY = (myorderbook.nativeenable || myorderbook.wrappedenable);
					
					//Store for later
					myoldorderbook = newbook;	
				}
				
				if(callback){
					callback();
				}	
			});
		}else{
			
			//Are we providing liquidity - if so check balance
			if(IS_LIQUIDITY){
				
				//Check the balances..
				getAllBalances(userdets,function(currentbalances){
					
					var oldstr = JSON.stringify(myoldbalance);
					var newstr = JSON.stringify(currentbalances);
					
					if(oldstr != newstr){
						
					}
				}); 
				
				
			}
			
			
			if(callback){
				callback();
			}
		}
	});
}

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
				
			//Check if your order book is blank..
			checkMyOrderBook(function(){
				
				//And store the balances
				getAllBalances(userdets,function(currentbalances){
					myoldbalance = currentbalances;
				
					MDS.log("Bridge Service inited..");	
				});	
			});
		});
		
	}else if(msg.event == "MDS_TIMER_10SECONDS"){
		//Check if your order book has changed..
		checkMyOrderBook();
	
	}else if(msg.event == "MDS_TIMER_60SECONDS"){
		//Check expired coins
		checkTimeLockMinimaHTLC(function(expired){});
			
	}else if(msg.event == "MDS_TIMER_1HOUR"){
		//Always publish your book every hour
		broadcastMyOrderBook(USER_DETAILS);
	}	
});