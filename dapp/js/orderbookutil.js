function getOrderBookBalance(userdets,callback){
	
	//My Order book
	getMyOrderBook(function(myorderbook){
		
		//Get his balance..
		getAllBalances(userdets,function(balances){
			
			var orderbookmsg = {};
			orderbookmsg.publickey 	= userdets.minimapublickey;
			orderbookmsg.orderbook 	= myorderbook;
			orderbookmsg.balance 	= balances;

			//return it all..
			callback(orderbookmsg);
		});
	});
}

function broadcastMyOrderBook(userdets,callback){
	
	//Get the complete
	getOrderBookBalance(userdets,function(orderbook){
		
		//Send a message to the network..
		MDS.log("Sending my orderbook to network.. "+JSON.stringify(orderbookmsg));
		sendOrderBook(userdets,orderbookmsg,function(resp){
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
}