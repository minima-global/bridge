
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

/*function getCompleteOrderBookTotals(completeorderbook,callback){
	
	var result = {};
	
	//How many valid books are there
	result.totalbooks 			= 0;
	result.wminima 				= {};
	result.wminima.books 		= 0;
	result.wminima.books 		= 0;
	
	result.minimumminima	= 1000000000;
	result.minimumwminima	= 1000000000; 
	
	result.minima 			= {};
	result.minima.total 	= 0;
	result.minima.maximum 	= 0;
	
	result.wminima 			= {};
	result.wminima.total 	= 0;
	result.wminima.maximum 	= 0;
	
	var len = completeorderbook.length;
	for(var i=0;i<len;i++){
		
		var userorderbook 	= completeorderbook[i];
		
		var orderbk			= userorderbook.data.orderbook;
		if(orderbk.wminima.enable){
			result.totalbooks++;
			result.totalwminimabooks++;
		}
		
		var userbalance = userorderbook.data.balance;
		if(orderbk.nativeenable){
			//get the available Minima..
			result.minima.total += +userbalance.minima.total;
			
			//Check Maximum
			if(+userbalance.minima.total > result.minima.maximum){
				result.minima.maximum = +userbalance.minima.total;
			}
			
			if(+orderbk.minimum < +result.minimumminima){
				result.minimumminima = +orderbk.minimum; 
			}
		}
		
		if(orderbk.wrappedenable){
			//get the available Minima..
			result.wminima.total += +userbalance.eth.total;
			
			//Check Maximum
			if(+userbalance.eth.total > result.wminima.maximum){
				result.wminima.maximum = +userbalance.eth.total;
			}
			
			if(+orderbk.minimum < +result.minimumwminima){
				result.minimumwminima = +orderbk.minimum; 
			}
		}
	}
	
	callback(result);
}*/

//I have AMOUNT of TOKEN to swap.. find the best order
function searchOrderBook(token, amount, ignoreme, callback){
	
	//Get the complete order book
	getCompleteOrderBook(function(completeorderbook){
		
		var validorders = [];
		var currentfee 	= 1000000;
		
		//Cycle through the orders
		var len = completeorderbook.length;
		for(var i=0;i<len;i++){
			
			var data 		= completeorderbook[i].data;
			var user		= data.publickey;
			var orderbook 	= data.orderbook;
			var balance 	= data.balance;
			
			//Which side of the trade are we checking..
			if(user != ignoreme){
				if(amount >= orderbook.minimum){
					
					if(	token == "minima" && 
						orderbook.wrappedenable &&
						+balance.eth > 0 && 
						+balance.wminima >= amount){
						
						//Check fee..
						if(+orderbook.wrappedfee == currentfee){
							//Same fee just add..
							validorders.push(data);
								
						}else if(+orderbook.wrappedfee < currentfee){
							//NEW lowest fee..
							validorders = [];
							currentfee	= +orderbook.wrappedfee;
							validorders.push(data);
						}
						
					}else if(token == "wminima" && 
							 orderbook.nativeenable && 
						 	 +balance.minima.total >= amount){
						
						//Check fee..
						if(+orderbook.nativefee == currentfee){
							//Same fee just add..
							validorders.push(data);
								
						}else if(+orderbook.nativefee < currentfee){
							//NEW lowest fee..
							validorders = [];
							currentfee	= +orderbook.nativefee;
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

//I have AMOUNT of TOKEN to swap.. find the best order
function searchAllOrderBooks(mytoken, requiredtoken, amount, ignoreme, callback){
	
	//Get the complete order book
	getCompleteOrderBook(function(completeorderbook){
		
		var validorders 	= [];
		var currentbuy 		= 0;
		var currentsell 	= 1000000;
		
		//Cycle through the orders
		var len = completeorderbook.length;
		for(var i=0;i<len;i++){
			
			var data 		= completeorderbook[i].data;
			var user		= data.publickey;
			var orderbook 	= data.orderbook;
			var balance 	= data.balance;
			
			//Which side of the trade are we checking..
			
			//HACK ONLY SEARCH ME!
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
		}
	
	}else if(mytoken == "wminima"){
		
		if(requiredtoken == "minima"){
			//Get the BUY price..
			price 		= toFixedNumber(orderbook.wminima.buy);
			youramount 	= swapamount * price;
		}
	}
	
	//Calculate the amount of wMinima.. 
	return toFixedNumber(youramount);
}
