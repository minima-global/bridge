
var BRIDGEORDERBBOK = "0xDEADDEADDEADFF";

//Should be 2 hours..
var ORDEBOOK_CHECK_DEPTH = 512;

//How many new SIGS checked in complete orderbook
var SIGS_CHECKED = 0;

function signData(publickey,data, callback){
	MDS.cmd("maxsign data:"+data,function(resp){
		callback(resp.response);
	});
}

function verifyData(publickey,data,signature, callback){
	MDS.cmd("maxverify data:"+data+" publickey:"+publickey+" signature:"+signature,function(ver){
		if(ver.status){
			if(ver.response.valid){
				callback(true);
			}else{
				callback(false);
			}	
		}else{
			callback(false);
		}		
	});
}

function sendOrderBook(userdetails, objson, callback){
	
	//Convert to String..
	var obstr = encodeStringForDB(JSON.stringify(objson));
	
	//Now sha
	var hashdata = hashString(obstr);
	
	//The public key we are signiung with
	var publickey = userdetails.maximapublickey;
	
	//Sign it..
	signData(publickey,hashdata,function(signresp){
		var signature = signresp.signature;	
		
		var state = {};
		state[0] = publickey;
		state[1] = "["+obstr+"]";
		state[2] = signature;
		
		//Send from the bridge wallet..
		var sendfrom = "fromaddress:"+userdetails.minimaaddress.mxaddress+" signkey:"+userdetails.minimapublickey;
		var func = "send "+sendfrom+" amount:0.0000000001 address:"+BRIDGEORDERBBOK+" state:"+JSON.stringify(state);
			
		MDS.cmd(func,function(resp){
			
			//Did it work ?
			if(!resp.status){
				
				//Hmm.. Try sending from the main account..
				var func = "send amount:0.0000000001 address:"+BRIDGEORDERBBOK+" state:"+JSON.stringify(state);
				MDS.cmd(func,function(respmain){
					MDS.log("Send orderbook from Bridge account failed.. trying main account.. ");
					if(callback){
						callback(respmain);
					}	
				});
				
			}else{
				if(callback){
					callback(resp);
				}	
			}		
		});	
	});
}

function setCompleteOrderBook(orderbook,callback){
	MDS.keypair.set("_completeorderbook",JSON.stringify(orderbook),function(setresult){
		callback(setresult);
	}); 	
}

function getCompleteOrderBook(callback){
	MDS.keypair.get("_completeorderbook",function(getresult){
		if(getresult.status){
			callback(JSON.parse(getresult.value));
		}else{
			callback([]);	
		}
	}); 	
}

function createCompleteOrderBook(callback){
	
	//First get ALL the records..
	_getAllOrderCoins(function(allrecords){
		
		//All the valid signed records
		//var validsignedrecords = [];
		
		//Reset the sigs checked
		SIGS_CHECKED = 0;
		
		//Now check all the signatures..
		//_checkValidSigs(0,allrecords,validsignedrecords,function(){
		_checkValidSigsSYNC(allrecords,function(validsignedrecords){
				
			//Now we have all the valid records.. only add the latest per owner..
			var unique = getUniqueRecords(validsignedrecords);
			
			//Did we check any new coins..
			//if(SIGS_CHECKED > 0){
			//	MDS.log("NEW orderbook coins checksigned:"+SIGS_CHECKED+" total:"+validsignedrecords.length+" unique:"+unique.length);	
			//}
			
			//Now we only want the ones providing liquidity
			var finallist 	= [];
			var orderlen 	= unique.length;
			for(var i=0;i<orderlen;i++){
				var orderbk = unique[i];
				
				try{
					if(orderbk.data.orderbook.wminima.enable || orderbk.data.orderbook.usdt.enable){
						finallist.push(orderbk);
					}	
				}catch(e){
					MDS.log("OrderBook inavlid format :"+e+" "+JSON.stringify(orderbk));
				}
			}
			
			//Now STORE this..
			setCompleteOrderBook(finallist,function(){
				//And send this back..
				callback(finallist);	
			});
		});	
	});
}

/**
 * Recursive capable functions to check the coins for valid signed messages
 */
function _getAllOrderCoins(callback){
	
	//Search for coins..
	var search = "coins depth:"+ORDEBOOK_CHECK_DEPTH+" simplestate:true address:"+BRIDGEORDERBBOK;
	
	//Run it..
	MDS.cmd(search,function(resp){
		
		//Now get only the first per owner..
		var coins 			= resp.response;
		var len 			= coins.length;
		var allfound  	 	= [];
		
		for(var i=0;i<len;i++){
			
			//Get the coin
			var coin = coins[i];
			
			try{
				//Create a Record..
				var record 			= {};
				record.publickey	= coin.state[0];
				record.data 		= stripBrackets(coin.state[1]);
				record.datahash 	= hashString(record.data);
				record.signature	= coin.state[2];
				
				//Add to our list
				allfound.push(record);	
				
			}catch(e){
				MDS.log("OrderBook COIN inavlid format :"+e+" "+JSON.stringify(coin));	
			}
		}
			//Send the result back		
		callback(allfound);
	});
}

//Do not check previously checked Signatures..
var PREV_VALID_SIG = [];
function _makeCompleteSigData(publickey,data,signature){
	return	publickey+data+signature+"";
}

function _addValidSig(publickey,data,signature){
	PREV_VALID_SIG.push(_makeCompleteSigData(publickey,data,signature));
}

function _isPrevValidSig(publickey,data,signature){
	return 	PREV_VALID_SIG.includes(_makeCompleteSigData(publickey,data,signature));
}

function getSizePreviousValidSigs(){
	return PREV_VALID_SIG.length;
}

function clearPreviousValidSigs(){
	PREV_VALID_SIG = [];
}

function _checkValidSigs(counter,allrecords,correctrecords,callback){
	
	//How many records in all
	var len = allrecords.length;
	
	//Have we scanned them all
	if(counter<len){
		
		//Get the record
		var record = allrecords[counter];
		
		//Has it already been checked
		if(_isPrevValidSig(record.publickey,record.datahash,record.signature)){
			
			//Add to the records
			correctrecords.push(record);
			
			//And continue scanning..
			_checkValidSigs(counter+1,allrecords,correctrecords,callback);
			
		}else{
			
			//Checking a NEW signature coin
			SIGS_CHECKED++;
			
			//Check it..
			verifyData(record.publickey,record.datahash,record.signature,function(isvalid){
				
				//Is it valid..
				if(isvalid){
					
					//Add to previous
					_addValidSig(record.publickey,record.datahash,record.signature);
					
					//Add to correct records..
					correctrecords.push(record);
					
				}else{
					MDS.log("Invalid signature for record.. publickey:"+record.publickey);
				}
				
				//And continue scanning..
				_checkValidSigs(counter+1,allrecords,correctrecords,callback);
			});	
		}
		
	}else{
		//All scanned..
		callback();
	}
}

function _checkValidSigsSYNC(allrecords,callback){
	
	//The correctly signed records..
	var correctrecords = [];
	
	//How many records in all
	var len = allrecords.length;
	
	//Cycle through
	for(var i=0;i<len;i++){
		
		//Get the record
		var record = allrecords[i];
		
		//Has it already been checked
		if(_isPrevValidSig(record.publickey,record.datahash,record.signature)){
			
			//Add to the records
			correctrecords.push(record);
			
		}else{
			
			//Checking a NEW signature coin
			SIGS_CHECKED++;
			
			//Check it..
			verifyData(record.publickey,record.datahash,record.signature,function(isvalid){
				
				//Is it valid..
				if(isvalid){
					
					//Add to previous
					_addValidSig(record.publickey,record.datahash,record.signature);
					
					//Add to correct records..
					correctrecords.push(record);
					
				}else{
					MDS.log("Invalid signature for record.. publickey:"+record.publickey);
				}
			});	
		}
	}
	
	//And send them back
	callback(correctrecords);
}

function getUniqueRecords(validrecords){
	
	var len = validrecords.length;
	
	var prevowner  	 = [];
	var orderbook  	 = [];
	
	for(var i=0;i<len;i++){
		
		//Get the order
		var record = validrecords[i];
		
		//get the owner
		var publickey = record.publickey;
		
		//Have we already added..
		if(!prevowner.includes(publickey)){
			
			//Create a new JSON
			var ob 	= {};
			ob.maximapublickey 	= publickey;
			
			try {
				//Now convert the data to a JSON
			    var orderstr = decodeStringFromDB(record.data);
			
				//Convert to a JSON
				ob.data = JSON.parse(orderstr);
				
				//Add it to our list
				orderbook.push(ob);
				
				//We now have an orderbook from this user
				prevowner.push(publickey);
			    
			} catch (e) {
		        MDs.log("Invalid JSON for orderbook from "+publickey);
		    }
		} 
	}
	
	return orderbook;
}

function setUserOrderBook(wrappedenable, wrappedbuy, wrappedsell, wrappedminimum, wrappedmaximum, 
						  usdtenable, usdtbuy, usdtsell, usdtminimum, usdtmaximum, callback){
	
	//Create an order book for this user
	var orderbook 				= {};
	
	//wMinima
	orderbook.wminima 			= {};
	orderbook.wminima.enable 	= wrappedenable;
	if(wrappedenable){
		orderbook.wminima.buy 		= toFixedNumber(wrappedbuy);
		orderbook.wminima.sell 		= toFixedNumber(wrappedsell);
		orderbook.wminima.minimum 	= toFixedNumber(wrappedminimum);
		orderbook.wminima.maximum 	= toFixedNumber(wrappedmaximum);	
	}else{
		orderbook.wminima.buy 		= 0;
		orderbook.wminima.sell 		= 0;
		orderbook.wminima.minimum 	= 0;
		orderbook.wminima.maximum 	= 0;
	}
	
	//USDT
	orderbook.usdt 				= {};
	orderbook.usdt.enable 		= usdtenable;
	if(usdtenable){
		orderbook.usdt.buy 		= toFixedNumber(usdtbuy);
		orderbook.usdt.sell 	= toFixedNumber(usdtsell);
		orderbook.usdt.minimum 	= toFixedNumber(usdtminimum);
		orderbook.usdt.maximum 	= toFixedNumber(usdtmaximum);	
	}else{
		orderbook.usdt.buy 		= 0;
		orderbook.usdt.sell 	= 0;
		orderbook.usdt.minimum 	= 0;
		orderbook.usdt.maximum 	= 0;
	}
	
	MDS.keypair.set("myorderbook",JSON.stringify(orderbook),function(setorder){
		if(callback){
			callback(setorder);
		}
	});
}

function getMyOrderBook(callback){
	//Get the details..
	MDS.keypair.get("myorderbook",function(getorders){
		var orderbook = {};
		if(getorders.status){
			orderbook = JSON.parse(getorders.value);
		}else{
			orderbook = getEmptyOrderBook();
		}
		
		callback(orderbook);
	});
}

function getEmptyOrderBook(){
	var orderbook 				= {};
	
	orderbook.wminima			= {};
	orderbook.wminima.enable	= false;
	orderbook.wminima.buy 		= 0;
	orderbook.wminima.sell 		= 0;
	orderbook.wminima.minimum 	= 0;
	orderbook.wminima.maximum  	= 0;
	
	orderbook.usdt				= {};
	orderbook.usdt.enable		= false;
	orderbook.usdt.buy 			= 0;
	orderbook.usdt.sell 		= 0;
	orderbook.usdt.minimum 		= 0;
	orderbook.usdt.maximum  	= 0;
	
	return orderbook;
}
