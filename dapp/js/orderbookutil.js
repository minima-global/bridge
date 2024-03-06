
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
	
	//Get order book and balance..
	getMyOrderBook(function(currentorderbook){
		
		//Do we need to send..
		if(!currentorderbook.nativeenable && !currentorderbook.wrappedenable){
			//no need..
			if(callback){
				callback(false);	
			}
			return;	
		}
		
		MDS.log("Regular hourly orderbook update..");
		
		getAllBalances(userdets,function(currentbalances){
				
			//Create the complete book
			var orderbookmsg = {};
			orderbookmsg.publickey 		= userdets.minimapublickey;
			orderbookmsg.ethpublickey 	= userdets.ethaddress;
			orderbookmsg.orderbook 		= currentorderbook;
			orderbookmsg.balance 		= currentbalances;
			
			//Get his balance..
			broadcastMyOrderBook(userdets, orderbookmsg, function(sendvalid){
				
				//Success send..?
				if(sendvalid){
					myoldorderbook  = currentorderbook;
					myoldbalance	= currentbalances;
				}else{
					
					//Wipe the order book so the timer check sends again..
					myoldorderbook 	= getEmptyOrderBook();
					myoldbalance	= {};
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
		if((oldbook==newbook) && !currentorderbook.wminima.enable){
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
				//MDS.log("OrderBook changed! old:"+oldbook+" new:"+newbook);
				publishbook = true;	
			
			//Are we providing liquidity - then check balance
			}else if(currentorderbook.wminima.enable){
				//Check balances for all - use rounded values to ignore the publish messages
				if( currentbalances.minima.total != myoldbalance.minima.total ||
					currentbalances.wminima != myoldbalance.wminima){
					//MDS.log("Balance Changed! old:"+JSON.stringify(myoldbalance)+" new:"+JSON.stringify(currentbalances));
					publishbook = true;
				}
			}	
			
			//Are we publishing..
			if(publishbook){
				
				//Create the complete book
				var orderbookmsg = {};
				orderbookmsg.publickey 		= userdets.minimapublickey;
				orderbookmsg.ethpublickey 	= userdets.ethaddress;
				orderbookmsg.orderbook 		= currentorderbook;
				orderbookmsg.balance 		= currentbalances;
				
				//Get his balance..
				broadcastMyOrderBook(userdets, orderbookmsg, function(sendvalid){
					
					//Success send..?
					if(sendvalid){
						myoldorderbook  = currentorderbook;
						myoldbalance	= currentbalances;
					}else{
						
						//Wipe so send again..
						myoldorderbook 	= getEmptyOrderBook();
						myoldbalance	= {};
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

//I have AMOUNT of TOKEN to swap.. find the best order
function searchAllOrderBooks(mytoken, requiredtoken, amount, ignoreme, callback){
	
	//Get the complete order book
	getCompleteOrderBook(function(completeorderbook){
		
		var validorders 	= [];
		var currentbuy 		= -1;
		var currentsell 	= 10000000;
		
		//Cycle through the orders
		var len = completeorderbook.length;
		for(var i=0;i<len;i++){
			
			var data 		= completeorderbook[i].data;
			var user		= data.publickey;
			var orderbook 	= data.orderbook;
			var balance 	= data.balance;
			
			//Which side of the trade are we checking..
			if(user != ignoreme){
				
				if(mytoken == "minima"){
					
					//SELL Orders!
					if(	requiredtoken == "wminima" &&
						orderbook.wminima.enable &&
						balance.wminima >= +amount
					){
						//Is the price better than current
						if(orderbook.wminima.sell == currentsell){
							//Same as current best.. just add
							validorders.push(data);
							
						}else if(orderbook.wminima.sell < currentsell){
							
							//Best price so far	
							validorders = [];
							currentsell	= +orderbook.wminima.sell;
							validorders.push(data);
						}
					
					}else if(requiredtoken == "usdt" &&
							 orderbook.usdt.enable &&
							 balance.usdt >= +amount
					){
						//Is the price better than current
						if(orderbook.usdt.sell == currentsell){
							//Same as current best.. just add
							validorders.push(data);
							
						}else if(orderbook.usdt.sell < currentsell){
							
							//Best price so far	
							validorders = [];
							currentsell	= +orderbook.usdt.sell;
							validorders.push(data);
						}
					}
				
				}else if(mytoken == "wminima"){
					
					//BUY Orders!
					if(	requiredtoken == "minima" &&
						orderbook.wminima.enable &&
						balance.minima.total >= +amount
					){
						//Is the price better than current
						if(orderbook.wminima.buy == currentbuy){
							
							//Same as current best.. just add
							validorders.push(data);
						}else if(orderbook.wminima.buy > currentbuy){
							
							//Best price so far	
							validorders = [];
							currentbuy	= +orderbook.wminima.buy;
							validorders.push(data);
						}
					}
				
				}else if(mytoken == "usdt"){
						
					//BUY Orders!
					if(	requiredtoken == "minima" &&
						orderbook.usdt.enable &&
						balance.minima.total >= +amount
					){
						
						//Is the price better than current
						if(orderbook.usdt.buy == currentbuy){
							
							//Same as current best.. just add
							validorders.push(data);
						}else if(orderbook.usdt.buy > currentbuy){
							
							//Best price so far	
							validorders = [];
							currentbuy	= +orderbook.usdt.buy;
							validorders.push(data);
						}
					}
				}
				 
			}
		}
		
		//Any at all found ?
		if(validorders.length == 0){
			callback(false,{});
			return;
		}
		
		//MDS.log("Found valid orders : "+validorders.length);
		
		//Pick a random one..
		var finalorder = validorders[Math.floor(Math.random()*validorders.length)];

		//Send it back..
		callback(true,finalorder);
	});
}

function calculateSwapAmount(mytoken,requiredtoken,amount,orderbook){
	
	//What is the fee..
	var swapamount = toFixedNumber(amount);
	var youramount = 0;
	if(mytoken == "minima"){
		
		if(requiredtoken == "wminima"){
			//Get the SELL price..
			price 		= toFixedNumber(orderbook.wminima.sell);
			youramount 	= swapamount / price;
		
		}else if(requiredtoken == "usdt"){
			//Get the SELL price..
			price 		= toFixedNumber(orderbook.usdt.sell);
			youramount 	= swapamount / price;
		} 
	
	}else if(mytoken == "wminima"){
		
		if(requiredtoken == "minima"){
			//Get the BUY price..
			price 		= toFixedNumber(orderbook.wminima.buy);
			youramount 	= swapamount * price;
		}
	
	}else if(mytoken == "usdt"){
		
		if(requiredtoken == "minima"){
			//Get the BUY price..
			price 		= toFixedNumber(orderbook.usdt.buy);
			youramount 	= swapamount * price;
		}
	}
	
	//Calculate the amount of wMinima.. 
	return toFixedNumber(youramount);
}
