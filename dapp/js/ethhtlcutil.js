/**
 * The HTLC ABI interfaces
 */
var HTLCInterfaceABI = new ethers.utils.Interface(HTLC_ABI.abi);

/**
 * HTLC Contract Address
 */

//SEPOLIA
//var HTLCContractAddress = "0x"+("D359f1A2C1026646a2FBaF1B4339F4b3449716aB".toUpperCase());

//HARDHAT
var HTLCContractAddress = "0x"+("0165878A594ca255338adfa4d48449f69242Eb8F".toUpperCase());

/**
 * Start an HTLC
 */
function setupETHHTLCSwap(ownerminimakey, swappubkey, hashlock, timelock, 
								erc20address, amount, requestamount,  callback){
	
	/*var datalogs = {};
	datalogs.ownerminimakey = ownerminimakey;
	datalogs.swappubkey = swappubkey;
	datalogs.hashlock = hashlock;
	datalogs.timelock = timelock;
	datalogs.erc20address = erc20address;
	datalogs.amount = amount;
	datalogs.reqamount = reqamount;
	MDS.log("setupETHHTLCSwap : "+JSON.stringify(datalogs));*/
	
	//Get ETH valid address
	var rec 	= swappubkey.toLowerCase();
	var ercaddr = erc20address.toLowerCase();
	
	//How many decimla places..
	var decimals = 18;
	if(erc20address == wMinimaContractAddress){
		decimals = WMINIMA_DECIMALS;
	}else if(erc20address == USDTContractAddress){
		decimals = USDT_DECIMALS;
	}else{
		MDS.log("ERROR - UNKNOWN ERC20 setupETHHTLCSwap "+erc20address);
		
		var err 	= {};
		err.status 	= false;
		err.error 	= "ERROR - UNKNOWN ERC20 setupETHHTLCSwap "+erc20address;
		
		callback(err);
		return;
	}
	
	//The actual amount of the erc20
	var sendamount 	= ethers.utils.parseUnits(""+amount,decimals);
	
	//How much Minima are we requesting - always 18 decimals
	var reqamount   = ethers.utils.parseUnits(""+requestamount,18);
	
	//Get the function data
	var functiondata = HTLCInterfaceABI.functions.newContract.encode([ownerminimakey, 
			rec , hashlock, timelock, ercaddr, sendamount, reqamount, false]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(HTLCContractAddress, functiondata, 500000);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Can you collect an HTLC contract - not refunded or withdrawn..
 */
function canCollect(contractid, callback){
	
	//Get the function data
	var functiondata = HTLCInterfaceABI.functions.canCollect.encode([contractid]);
	
	//Run this as a READ command
	ethCallCommand(HTLCContractAddress,functiondata,function(ethresp){
		if(ethresp.status){
			var resulthex 	= ethers.utils.hexStripZeros(ethresp.result);
			var ret 		= parseInt(resulthex,16);
			callback(ret!=0);
		}else{
			callback(false);	
		}
	}); 
}

/**
 * Withdraw an HTLC with the secret
 */
function withdrawHTLCSwap(contractId, secret, callback){
	
	//Get ETH valid address
	var contr 	= contractId.toLowerCase();
	var sec 	= secret.toLowerCase();
	
	//Get the function data
	var functiondata = HTLCInterfaceABI.functions.withdraw.encode([contr, sec]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(HTLCContractAddress, functiondata, 120000);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Refunc an HTLC after the timeout
 */
function refundHTLCSwap(contractId, callback){
	
	//Get ETH valid address
	var contr = contractId.toLowerCase();
	
	//Get the function data
	var functiondata = HTLCInterfaceABI.functions.refund.encode([contr]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(HTLCContractAddress, functiondata, 120000);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Get the NEWCONTRACT logs of any HTLC which you own
 */
function getHTLCAllLogs(fomBlockHEX, toBlockHEX, callback){
	
	//Get your address - padded to fit the topics.
	var addr = ethers.utils.hexZeroPad(getETHERUMAddress(), 32);
	
	//Get all the New Contracts that you OWN 
	var params = [
					{
						fromBlock:fomBlockHEX+"",
					 	toBlock:toBlockHEX+"",
					 	topics:[],
					 	address:HTLCContractAddress
					}
				];
	//var params = [{"address":contractAddress}];
	var payload = {"jsonrpc":"2.0", "method":"eth_getLogs",
			"params": params, "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp);
	});
}

/**
 * Get the NEWCONTRACT logs of any HTLC which you own
 */
function getHTLCContractAsOwner(fomBlockHEX, toBlockHEX, callback){
	
	//Get your address - padded to fit the topics.
	var addr = ethers.utils.hexZeroPad(getETHERUMAddress(), 32);
	
	//Get all the New Contracts that you OWN 
	var params = [
					{
						fromBlock:fomBlockHEX+"",
					 	toBlock:toBlockHEX+"",
					 	
						topics:[
								//Use the function SHA address, and your pub key in the index filter	
								"0x241f395d4e943ea32c5c6e0b8c523cb6fbf735af15880f21756155e7a5d576eb",
								// This is the contractID - we don't care
								null, 
								// This is the OWNER
								addr],
								 
					 	address:HTLCContractAddress
					}
				];
	//var params = [{"address":contractAddress}];
	var payload = {"jsonrpc":"2.0", "method":"eth_getLogs",
			"params": params, "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		
		//Complete list of contracts
		var newcontracts = [];
		
		//Did it work..
		if(ethresp.status){
		
			//Now decode the response..
			var len = ethresp.result.length;
			for(var i=0;i<len;i++){
				
				//Parse the returned Data
				var newcontract = parseHTLCContractData(ethresp.result[i]);
							
				//Add to the total list..
				newcontracts.push(newcontract);
			}
		}
		
		callback(newcontracts);
	});
}

/**
 * Get the NEWCONTRACT logs of any HTLC which you are the RECEIVER
 */
function getHTLCContractAsReceiver(fomBlockHEX, toBlockHEX, callback){
	
	//Get your address - padded to fit the topics.
	var addr = ethers.utils.hexZeroPad(getETHERUMAddress(), 32);
	
	//Get all the New Contracts that you OWN 
	var params = [
					{
						fromBlock:fomBlockHEX+"",
					 	toBlock:toBlockHEX+"",
					 	
						topics:[
								//Use the function SHA address, and your pub key in the index filter	
								"0x241f395d4e943ea32c5c6e0b8c523cb6fbf735af15880f21756155e7a5d576eb",
								// This is the contractID - we don't care
								null, 
								// This is your address and the OWNER - we don't care'
								null,
								// This is your address and the RECEIVER
								addr],
								 
					 	address:HTLCContractAddress
					}
				];
	//var params = [{"address":contractAddress}];
	var payload = {"jsonrpc":"2.0", "method":"eth_getLogs",
			"params": params, "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		
		//Complete list of contracts
		var newcontracts = [];
		
		//Did it work..
		if(ethresp.status){
			
			//Now decode the response..
			var len = ethresp.result.length;
			for(var i=0;i<len;i++){
				
				//Parse the returned Data
				var newcontract = parseHTLCContractData(ethresp.result[i]);
							
				//Add to the total list..
				newcontracts.push(newcontract);
			}	
		}
		
		callback(newcontracts);
	});
}

function parseHTLCContractData(logdata){
	
	//Get the contractid
	var contractid = logdata.topics[1]; 

	//Decode the data
	var datavars  = ethers.utils.defaultAbiCoder.decode(["bytes32","address","uint256","uint256","bytes32","uint256","bool"],logdata.data);
	
	//Now create a complete object
	var newcontract = {};
	newcontract.block		= parseInt(logdata.blockNumber);
	newcontract.txnhash		= "0x"+(logdata.transactionHash+"").slice(2).toUpperCase();
	
	//This data is indexed..
	newcontract.contractid 	= "0x"+(logdata.topics[1].slice(2).toUpperCase());
	newcontract.owner 		= "0x"+(logdata.topics[2].substring(26).toUpperCase());
	newcontract.receiver	= "0x"+(logdata.topics[3].substring(26).toUpperCase());
	
	//Now get the rest..
	newcontract.minimapublickey = "0x"+datavars[0].slice(2).toUpperCase();
	newcontract.tokencontract	= "0x"+datavars[1].slice(2).toUpperCase();
	
	var decimals = 18;
	if(newcontract.tokencontract == wMinimaContractAddress){
		decimals = WMINIMA_DECIMALS;
	}else if(newcontract.tokencontract == USDTContractAddress){
		decimals = USDT_DECIMALS;
	}
	
	//The amount of the token
	var weiamount 			= ""+parseInt(datavars[2]._hex,16);
	newcontract.amount		= ethers.utils.formatEther(weiamount,decimals);
	
	//The requested amount of Minima
	var reqweiamount 			= ""+parseInt(datavars[3]._hex,16);
	newcontract.requestamount	= ethers.utils.formatEther(reqweiamount,18);
	
	newcontract.hashlock	= "0x"+datavars[4].slice(2).toUpperCase();
	newcontract.timelock 	= parseInt(datavars[5]._hex,16);
	
	newcontract.otc			= datavars[6];
	
	return newcontract;
}

function getHTLCContractWithdrawLogs(fomBlockHEX, toBlockHEX, callback){
	
	//Get your address - padded to fit the topics.
	var addr = ethers.utils.hexZeroPad(getETHERUMAddress(), 32);
	
	//Get all the New Contracts that you OWN 
	var params = [
					{
						fromBlock:fomBlockHEX+"",
					 	toBlock:toBlockHEX+"",
					 	
						//The withdraw function sha address
						topics:["0xae1c384441b246473ee31fdf0bd4cc25284d0cdb2c5258ada6b84b4550b9c058"],
								 
					 	address:HTLCContractAddress
					}
				];
	//var params = [{"address":contractAddress}];
	var payload = {"jsonrpc":"2.0", "method":"eth_getLogs",
			"params": params, "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		//MDS.log("FROM:"+fomBlockHEX+" TO:"+toBlockHEX+" "+JSON.stringify(ethresp,null,2));
		
		//Complete list of contracts
		var newcontracts = [];
		
		//Did it work..
		if(ethresp.status){
			//Now decode the response..
			var len = ethresp.result.length;
			for(var i=0;i<len;i++){
				
				//Get the topics
				var topics = ethresp.result[i].topics;
				
				//Parse the returned Data
				var newcontract 		= {};
				newcontract.block		= parseInt(ethresp.result[i].blockNumber);
				newcontract.txnhash		= "0x"+(ethresp.result[i].transactionHash+"").slice(2).toUpperCase();
				newcontract.contractid 	= "0x"+topics[1].slice(2).toUpperCase();
				newcontract.secret 		= "0x"+topics[2].slice(2).toUpperCase(); 	
				newcontract.hashlock 	= "0x"+topics[3].slice(2).toUpperCase();
							
				//Add to the total list..
				newcontracts.push(newcontract);
			}
		}
		
		//Add this to the response
		ethresp.logs = newcontracts;
		
		//And send back the details
		callback(ethresp);
	});
}