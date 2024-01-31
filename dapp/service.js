
//Load required files..
MDS.load("./js/puresha1.js");
MDS.load("./js/jslib.js");
MDS.load("./js/scripts.js");
MDS.load("./js/auth.js");
MDS.load("./js/orderbook.js");
MDS.load("./js/balance.js");

//The USER details..
var USER_DETAILS 	= {};
var myoldorderbook 	= JSON.stringify(getEmptyOrderBook());

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
			broadcastMyOrderBook(function(sendvalid){
				
				//Success send..?
				if(sendvalid){
					//Store for later
					myoldorderbook = newbook;	
				}
				
				if(callback){
					callback();
				}	
			});
		}else{
			MDS.log("My Order book is the same.. "+newbook);
			if(callback){
				callback();
			}
		}
	});
}

function broadcastMyOrderBook(callback){
	//My Order book
	getMyOrderBook(function(myorderbook){
		
		//Get his balance..
		getAllBalances(USER_DETAILS,function(balances){
			
			var orderbookmsg = {};
			orderbookmsg.publickey 	= USER_DETAILS.minimapublickey;
			orderbookmsg.orderbook 	= myorderbook;
			orderbookmsg.balance 	= balances;
		
			//Send a message to the network..
			MDS.log("Sending my orderbook to network.. "+JSON.stringify(orderbookmsg));
			sendOrderBook(USER_DETAILS,orderbookmsg,function(resp){
				if(!resp.status){
					MDS.log("ERROR sending order book "+JSON.stringify(resp));
					if(callback){
						callback(false);
					}
				}else{
					if(callback){
						callback(true);
					}		
				}
			});
		});
	});
}

//Main message handler..
MDS.init(function(msg){
	
	//Do initialisation
	if(msg.event == "inited"){
			
		//Set up the DB
		//..
		
		getUserDetails(function(userdets){
			//Get User Details..
			USER_DETAILS=userdets;
				
			//Check if your order book is blank..
			checkMyOrderBook(function(){
				MDS.log("Bridge Service inited..");	
			});
		});
		
	}else if(msg.event == "MDS_TIMER_60SECONDS"){
		//Check if your order book has changed..
		checkMyOrderBook();
			
	}else if(msg.event == "MDS_TIMER_1HOUR"){
		//Always publish your book every hour
		broadcastMyOrderBook();
	}	
});