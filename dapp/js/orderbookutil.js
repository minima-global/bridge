
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

//Store the old blanace..
var myoldbalance	= {};


/**
 * Set Balance limits given orderbook
 */
function getBalanceWithLimits(orderbook, allbalances){
	
	//Make a copy.. leave out uneeded info..
	var newbalances 			= {};
	newbalances.minima  		= {};
	newbalances.minima.total  	= allbalances.minima.total;
	newbalances.eth  			= allbalances.eth;
	newbalances.wminima  		= allbalances.wminima;
	newbalances.usdt  			= allbalances.usdt;
	
	//Calculate maximum BUY..
	var maxwminimabuy = toFixedNumber(MAXIMUM_MINIMA_TRADE *  orderbook.wminima.buy);
	if(newbalances.wminima > maxwminimabuy){
		//MDS.log("MAX WMINIMA BUY REQUIRED : "+maxwminimabuy+" have:"+newbalances.wminima);
		newbalances.wminima = maxwminimabuy;
	}
	
	var maxusdtbuy = toFixedNumber(MAXIMUM_MINIMA_TRADE *  orderbook.usdt.buy);
	if(newbalances.usdt > maxusdtbuy){
		//MDS.log("MAX USDT BUY REQUIRED : "+maxusdtbuy+" have:"+newbalances.usdt);
		newbalances.usdt = maxusdtbuy;
	}
	
	//Calculate max sell..
	if(newbalances.minima.total > MAXIMUM_MINIMA_TRADE){
		//MDS.log("MAX MINIMA REQUIRED : "+MAXIMUM_MINIMA_TRADE+" have:"+newbalances.minima.total);
		newbalances.minima.total = MAXIMUM_MINIMA_TRADE;
	}
	
	//MDS.log("LIMIT BALANCE : "+JSON.stringify(newbalances));
	
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
		
		MDS.log("Regular orderbook update..");
		
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
			
			//Now check whether the balance hash changed..
			getAllBalances(userdets,function(fullbalance){
				
				//Get limited balance..
				var currentbalances = getBalanceWithLimits(currentorderbook, fullbalance);
			
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

//I have AMOUNT of MINIMA - I want to swap for TOKEN.. find the best order
function searchAllOrderBooks(action, amount, token, ignoreme, callback){
	//Get the complete order book
	getCompleteOrderBook(function(completeorderbook){
		_searchAllOrderBooksWithBook(completeorderbook, action, amount, token, ignoreme, function(res,order){
			callback(res,order);
		});
	});
}

//I have AMOUNT of MINIMA - I want to swap for TOKEN.. find the best order
function searchAllorFavsOrderBooks(favs,action, amount, token, ignoreme, callback){
	
	if(favs){
		//Get the complete order book
		getFavsOrderBook(function(completeorderbook){
			_searchAllOrderBooksWithBook(completeorderbook, action, amount, token, ignoreme, function(res,order){
				callback(res,order);
			});
		});
	}else{
		//Get the complete order book
		getCompleteOrderBook(function(completeorderbook){
			_searchAllOrderBooksWithBook(completeorderbook, action, amount, token, ignoreme, function(res,order){
				callback(res,order);
			});
		});	
	}
}

function getFavsOrderBook(callback){
	
	//Get the current complete
	getCompleteOrderBook(function(completeorderbook){
		
		//Get the favourites..
		getFavourites(function(favs){
			var filterorderbook = [];
			
			var orderlen = completeorderbook.length;
			for(var o=0;o<orderlen;o++){
				var ob = completeorderbook[o];
				
				var len = favs.rows.length;
				for(var i=0;i<len;i++){
					var fav = favs.rows[i];
					
					//Check is not THIS user
					if(ob.data.publickey == fav.BRIDGEUID){
						filterorderbook.push(ob);	
					}			
				}
			}
			
			//And send back
			callback(filterorderbook);
		});	
	});
}

function _searchAllOrderBooksWithBook(completeorderbook, action, amount, token, ignoreme, callback){	
		
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
			
			//Which book are we using..
			var ob 		= {};
			var bookbal = 0;
			if(token == "wminima"){
				ob 		= orderbook.wminima;
				bookbal = balance.wminima;
				
			}else if(token == "usdt"){
				ob 		= orderbook.usdt;
				bookbal = balance.usdt;
				
			}else{
				//ERROR - should not happen
				continue;
			}
			
			//Is this book enabled..
			if(!ob.enable){
				continue;
			}
			
			if(action == "buy"){
				
				//Check they have enough Minima - They are SELLING to you
				if(+amount <= balance.minima.total){
						
					//The order book price
					var obkprice = +ob.sell;
					
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
			
			}else if(action == "sell"){
				
				//Trying to SELL this much MINIMA - so look for BUYERS
				var totalamounttoken = toFixedNumber(+amount * +ob.buy);
					
				//Do we have that much of the token..
				if(totalamounttoken <= bookbal){
					
					//The order book price
					var obkprice = +ob.buy;
					
					//Is the price better than current or the same
					if(obkprice == currentbuy){
						//Same as current best.. just add
						validorders.push(data);
						
					}else if(obkprice > currentbuy){
						
						//Best price so far	
						validorders = [];
						currentbuy	= obkprice;
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
}

function calculateAmount(action, amount, token, orderbook){
	
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

function calculatePrice(action, token, orderbook){
	
	if(action == "buy"){
		
		if(token == "wminima"){
			return toFixedNumber(orderbook.wminima.sell);	
			
		}else if(token == "usdt"){
			return toFixedNumber(orderbook.usdt.sell);	
		}
		
	}else if(action == "sell"){
		
		if(token == "wminima"){
			return toFixedNumber(orderbook.wminima.buy);	
			
		}else if(token == "usdt"){
			return  toFixedNumber(orderbook.usdt.buy);	
		}
	}
		
	MDS.log("UNKNOWN QUESTION : "+action+" "+token+" "+JSON.stringify(orderbook));	
	//Calculate the amount of wMinima.. 
	return 0;
}