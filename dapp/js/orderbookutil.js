
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
function setOldOrderBook(orderbook,callback){
	MDS.keypair.set("_oldorderbook",JSON.stringify(orderbook),function(setresult){
		callback(setresult);
	}); 	
}

function getOldOrderBook(callback){
	MDS.keypair.get("_oldorderbook",function(getresult){
		if(getresult.status){
			callback(JSON.parse(getresult.value));
		}else{
			callback(getEmptyOrderBook());	
		}
	}); 	
}

var myoldbalance	= {};

/**
 * Set Balance limits given orderbook
 */
function getBalanceWithLimits(orderbook, allbalances){
	
	//Make a copy..
	var newbalances 	= allbalances;
	
	//Set to start
	var maxbuywminima 	= toFixedNumber(newbalances.wminima * orderbook.wminima.buy);
	var maxbuyusdt 		= toFixedNumber(newbalances.usdt * orderbook.usdt.buy);		
		
	//wMinima
	if(orderbook.wminima.enable){
		
		//MAX to SELL
		if(+allbalances.wminima > orderbook.wminima.maximum){
			newbalances.wminima = orderbook.wminima.maximum;
			
			//MAX to BUY
			maxbuywminima 	= toFixedNumber(newbalances.wminima * orderbook.wminima.buy);
		}
	}
	
	//USDT
	if(orderbook.usdt.enable){
		
		//MAX SELL
		if(+allbalances.usdt > orderbook.usdt.maximum){
			newbalances.usdt = orderbook.usdt.maximum;
			
			//MAX to BUY
			maxbuyusdt = toFixedNumber(newbalances.usdt * orderbook.usdt.buy);
		}
	}
	
	//Now sort max Minima..
	if(maxbuywminima > maxbuyusdt){
		if(maxbuywminima < newbalances.minima.total){
			newbalances.minima.total = maxbuywminima; 
		}
	}else{
		if(maxbuyusdt < newbalances.minima.total){
			newbalances.minima.total = maxbuyusdt;
		}
	}
	
	return newbalances;
}

/**
 * Create and send the complete order book
 */
function createAndSendOrderBook(userdets, callback){
	
	//Get order book and balance..
	getMyOrderBook(function(currentorderbook){
				
		//Do we need to send..
		if(!currentorderbook.wminima.enable && !currentorderbook.usdt.enable){
			//no need..
			if(callback){
				callback(false);	
			}
			return;	
		}
		
		MDS.log("Regular hourly orderbook update..");
		
		getAllBalances(userdets,function(fullbalance){
			
			//Get limited balance..
			var currentbalances = getBalanceWithLimits(currentorderbook, fullbalance);
					
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
					setOldOrderBook(currentorderbook,function(oldbk){
						myoldbalance = currentbalances;	
					});
					
				}else{
					
					//Wipe the order book so the timer check sends again..
					var warpedorderbook 	= getEmptyOrderBook();
					warpedorderbook.warped 	= true;
					setOldOrderBook(warpedorderbook,function(oldbk){
						myoldbalance = {};	
					});
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
		
		//Get the OLD orderbook..
		getOldOrderBook(function(myoldorderbook){
			
			//Has it changed or not providing liquidity.. otherwise need to check balances
			var oldbook = JSON.stringify(myoldorderbook);
			var newbook = JSON.stringify(currentorderbook);
			if((oldbook==newbook) && 
				!currentorderbook.wminima.enable &&
				!currentorderbook.usdt.enable){
				
				//No change.. no need to check any further..
				if(callback){
					callback(false);	
				}
				return;	
			}
			
			//Now check whether the balance hash changed..
			getAllBalances(userdets,function(fullbalance){
				
				//Get limited balance..
				var currentbalances = getBalanceWithLimits(currentorderbook, fullbalance);
				
				//Now do some some checking..
				var publishbook = false;
				if(oldbook != newbook){
					publishbook = true;	
				
				//Are we providing liquidity - then check balance
				}else if(currentorderbook.wminima.enable){
					
					if(myoldbalance.minima){
						if( currentbalances.minima.total != myoldbalance.minima.total ||
							currentbalances.wminima != myoldbalance.wminima){
							publishbook = true;
						}	
					}else{
						publishbook = true;
					}
				}else if(currentorderbook.usdt.enable){
					
					if(myoldbalance.minima){
						if( currentbalances.minima.total != myoldbalance.minima.total ||
							currentbalances.usdt != myoldbalance.usdt){
							publishbook = true;
						}	
					}else{
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
							setOldOrderBook(currentorderbook,function(oldbk){
								myoldbalance = currentbalances;	
							});
					
						}else{
							
							//Wipe so send again..
							var warpedorderbook 	= getEmptyOrderBook();
							warpedorderbook.warped 	= true;
							setOldOrderBook(warpedorderbook,function(oldbk){
								myoldbalance = {};	
							});
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
	});
}

//I have AMOUNT of TOKEN to swap.. find the best order
function searchAllOrderBooks(action, amount, token, ignoreme, callback){
	
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
				
				if(action == "buy"){
					if(token == "wminima"){
					
						//Serach for people SELLING	
						if(orderbook.wminima.enable){
							
							//Check maximum
							if(amount <= orderbook.wminima.maximum && amount >= orderbook.wminima.minimum){
								
								//Check have the required amount..
								if(+balance.wminima >= +amount){
									
									//The order book price
									var obkprice = +orderbook.wminima.sell;
									
									//Is the price better than current or the same
									if(obkprice == currentsell){
										//Same as current best.. just add
										validorders.push(data);
										
									}else if(obkprice < currentsell){
										
										//Best price so far	
										validorders = [];
										currentsell	= obkprice;
										validorders.push(data);
									}	
								}
							}
						}
					
					}else if(token == "usdt"){
					
						//Serach for people SELLING	
						if(orderbook.usdt.enable){
							
							//Check maximum
							if(amount <= orderbook.usdt.maximum && amount >= orderbook.usdt.minimum){
								
								//Check have the required amount..
								if(+balance.usdt >= +amount){
									
									//The order book price
									var obkprice = +orderbook.usdt.sell;
									
									//Is the price better than current
									if(obkprice == currentsell){
										//Same as current best.. just add
										validorders.push(data);
										
									}else if(obkprice < currentsell){
										
										//Best price so far	
										validorders = [];
										currentsell	= obkprice;
										validorders.push(data);
									}	
								}
							}
						}
					}
				
				}else if(action == "sell"){
					if(token == "wminima"){
						
						//Serach for people BUYING	
						if(orderbook.wminima.enable){
							
							//Check maximum
							if(amount <= orderbook.wminima.maximum && amount >= orderbook.wminima.minimum){
								
								//How much Minima do we need
								var totalamount = toFixedNumber(amount * orderbook.wminima.buy); 
								
								//Check have the required amount..
								if(balance.minima.total >= totalamount){
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
					}else if(token == "usdt"){
						
						//Serach for people BUYING	
						if(orderbook.usdt.enable){
							
							//Check maximum
							if(amount <= orderbook.usdt.maximum && amount >= orderbook.usdt.minimum){
								
								//How much Minima do we need
								var totalamount = toFixedNumber(amount * orderbook.usdt.buy); 
								
								//Check have the required amount..
								if(balance.minima.total >= totalamount){
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

function calculateAmount(action, amount, token, orderbook){
	
	//What is the fee..
	var useamount 	= toFixedNumber(amount);
	var calcamount 	= 0;
	
	if(action == "buy"){
		
		if(token == "wminima"){
			var price 	= toFixedNumber(orderbook.wminima.sell);	
			calcamount	= useamount * price;
		
		}else if(token == "usdt"){
			var price 	= toFixedNumber(orderbook.usdt.sell);	
			calcamount	= useamount * price;
		}
		
	}else if(action == "sell"){
		
		if(token == "wminima"){
			var price 	= toFixedNumber(orderbook.wminima.buy);	
			calcamount	= useamount * price;
		
		}else if(token == "usdt"){
			var price 	= toFixedNumber(orderbook.usdt.buy);	
			calcamount	= useamount * price;
		}
	}
		
	//Calculate the amount of wMinima.. 
	return toFixedNumber(calcamount);
}