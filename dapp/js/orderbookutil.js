
/**
 * Broadcast the JSON orderbook to the network
 */
function broadcastMyOrderBook(userdets, completeorderbook, callback){
	
	//Send a message to the network..
	MDS.log("Sending my orderbook to network.. "+JSON.stringify(completeorderbook));
	sendOrderBook(userdets,completeorderbook,function(resp){
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
}

/**
 * Keep the old versions to check..
 */
var myoldorderbook 	= getEmptyOrderBook();
var myoldbalance	= {};

/**
 * Create and send the complete order book
 */
function createAndSendOrderBook(userdets, callback){
	
	MDS.log("Regular hourly orderbook update..");
				
	//Get order book and balance..
	getMyOrderBook(function(currentorderbook){
		getAllBalances(userdets,function(currentbalances){
				
			//Create the complete book
			var orderbookmsg = {};
			orderbookmsg.publickey 	= userdets.minimapublickey;
			orderbookmsg.orderbook 	= currentorderbook;
			orderbookmsg.balance 	= currentbalances;
			
			//Get his balance..
			broadcastMyOrderBook(userdets, orderbookmsg, function(sendvalid){
				
				//Success send..?
				if(sendvalid){
					myoldorderbook  = currentorderbook;
					myoldbalance	= currentbalances;
				}else{
					
					//Wipe the order book so the timer check sends again..
					myoldorderbook 	= getEmptyOrderBook();
				}
				
				if(callback){
					callback(true);
				}	
			});			
		});
	});
}


function checkNeedPublishOrderBook(userdets,callback){
	
	//First check if your orderbook has changed - default is empty
	getMyOrderBook(function(currentorderbook){
		
		//Has it changed or not providing liquidity..
		var oldbook = JSON.stringify(myoldorderbook);
		var newbook = JSON.stringify(currentorderbook);
		if((oldbook==newbook) && !currentorderbook.nativeenable && !currentorderbook.wrappedenable){
			//No change.. no need to check any further..
			if(callback){
				callback(false);	
			}
			return;	
		}
		
		//Now check whether the balance hash changed..
		getAllBalances(userdets,function(currentbalances){
			
			//Now do some some checking..
			var publishbook = false;
			if(oldbook != newbook){
				MDS.log("OrderBook changed! old:"+oldbook+" new:"+newbook);
				publishbook = true;	
			
			//Are we providing liquidity
			}else if(currentorderbook.nativeenable || currentorderbook.wrappedenable){
				//Check balances for all - use rounded values to ignore the publish messages
				if( currentbalances.minima.rounded != myoldbalance.minima.rounded ||
					currentbalances.eth.rounded != myoldbalance.eth.rounded){
					MDS.log("Balance Changed! old:"+JSON.stringify(myoldbalance)+" new:"+JSON.stringify(currentbalances));
					publishbook = true;
				}
			}	
			
			//Are we publishing..
			if(publishbook){
				
				//Create the complete book
				var orderbookmsg = {};
				orderbookmsg.publickey 	= userdets.minimapublickey;
				orderbookmsg.orderbook 	= currentorderbook;
				orderbookmsg.balance 	= currentbalances;
				
				//Get his balance..
				broadcastMyOrderBook(userdets, orderbookmsg, function(sendvalid){
					
					//Success send..?
					if(sendvalid){
						myoldorderbook  = currentorderbook;
						myoldbalance	= currentbalances;
					}
					
					if(callback){
						callback(true);
					}	
				});
			}else{
				if(callback){
					callback(false);
				}
			}				
		});
	});
}