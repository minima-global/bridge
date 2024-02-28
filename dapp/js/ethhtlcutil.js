/**
 * The HTLC ABI interfaces
 */
var HTLCInterfaceABI = new ethers.utils.Interface(HTLC_ABI.abi);

/**
 * wMinima Contract Address
 */
var HTLCContractAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

/**
 * Get the current unix time in secs
 */
var TIME_1MINUTE_SECS = 60; 
function getCurrentUnixTime(){
	return Math.floor(new Date().getTime() / 1000);
}

/**
 * Start an HTLC
 */
function startETHHTLCSwap(swappubkey, hashlock, timelock, erc20address, amount, requestamount,  callback){
	
	//Get ETH valid address
	var rec 	= swappubkey.toLowerCase();
	var ercaddr = erc20address.toLowerCase();
	var sec 	= hashlock.toLowerCase();
	
	//The actual amount - wMinima has 18 decimla places..
	var sendamount 	= ethers.utils.parseUnits(""+amount,18);
	var reqamount   = ethers.utils.parseUnits(""+requestamount,18);
	
	//Get the function data
	var functiondata = HTLCInterfaceABI.functions.newContract.encode([rec , sec, timelock, ercaddr, sendamount, reqamount]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(HTLCContractAddress, functiondata);
	
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
	var transaction = createRAWContractCallTxn(HTLCContractAddress, functiondata);
	
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
	var transaction = createRAWContractCallTxn(HTLCContractAddress, functiondata);
	
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
	var addr = ethers.utils.hexZeroPad(MAIN_WALLET.address, 32);
	
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
	var addr = ethers.utils.hexZeroPad(MAIN_WALLET.address, 32);
	
	//Get all the New Contracts that you OWN 
	var params = [
					{
						fromBlock:fomBlockHEX+"",
					 	toBlock:toBlockHEX+"",
					 	
						topics:[
								//Use the function SHA address, and your pub key in the index filter	
								"0xe1112233d6a5bc9bad993b4a9a3994fc2cb0c8bdbde576d7309e1cc9e7099f32",
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
		
		//Now decode the response..
		var len = ethresp.result.length;
		for(var i=0;i<len;i++){
			
			//Parse the returned Data
			var newcontract = parseHTLCContractData(ethresp.result[i]);
						
			//Add to the total list..
			newcontracts.push(newcontract);
		}
		
		callback(newcontracts);
	});
}

/**
 * Get the NEWCONTRACT logs of any HTLC which you are the RECEIVER
 */
function getHTLCContractAsReceiver(fomBlockHEX, toBlockHEX, callback){
	
	//Get your address - padded to fit the topics.
	var addr = ethers.utils.hexZeroPad(MAIN_WALLET.address, 32);
	
	//Get all the New Contracts that you OWN 
	var params = [
					{
						fromBlock:fomBlockHEX+"",
					 	toBlock:toBlockHEX+"",
					 	
						topics:[
								//Use the function SHA address, and your pub key in the index filter	
								"0xe1112233d6a5bc9bad993b4a9a3994fc2cb0c8bdbde576d7309e1cc9e7099f32",
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
		
		//Now decode the response..
		var len = ethresp.result.length;
		for(var i=0;i<len;i++){
			
			//Parse the returned Data
			var newcontract = parseHTLCContractData(ethresp.result[i]);
						
			//Add to the total list..
			newcontracts.push(newcontract);
		}
		
		callback(newcontracts);
	});
}

function parseHTLCContractData(logdata){
	
	//Get the contractid
	var contractid = logdata.topics[1]; 

	//Decode the data
	var datavars  = ethers.utils.defaultAbiCoder.decode(["uint256","uint256","bytes32","uint256"],logdata.data);
	
	//Now create a complete object
	var newcontract = {};
	newcontract.block		= parseInt(logdata.blockNumber);
	newcontract.txnhash		= "0x"+(logdata.transactionHash+"").slice(2).toUpperCase();
	
	//This data is indexed..
	newcontract.contractid 	= "0x"+(logdata.topics[1].slice(2).toUpperCase());
	newcontract.owner 		= "0x"+(logdata.topics[2].substring(26).toUpperCase());
	newcontract.receiver	= "0x"+(logdata.topics[3].substring(26).toUpperCase());
	
	//Now get the rest..
	var weiamount 			= ""+parseInt(datavars[0]._hex,16);
	newcontract.amount		= ethers.utils.formatEther(weiamount,18);
	
	var reqweiamount 			= ""+parseInt(datavars[1]._hex,16);
	newcontract.requestamount	= ethers.utils.formatEther(reqweiamount,18);
	
	var hashlock 			= datavars[2]+"";
	newcontract.hashlock	= "0x"+hashlock.slice(2).toUpperCase();
	 
	newcontract.timelock 	= parseInt(datavars[3]._hex,16);
	
	return newcontract;
}

function getHTLCContractWithdrawLogs(fomBlockHEX, toBlockHEX, callback){
	
	//Get your address - padded to fit the topics.
	var addr = ethers.utils.hexZeroPad(MAIN_WALLET.address, 32);
	
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
		
		//Complete list of contracts
		var newcontracts = [];
		
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
		
		callback(newcontracts);
	});
}