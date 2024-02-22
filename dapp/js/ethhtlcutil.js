/**
 * The HTLC ABI interfaces
 */
var HTLCInterfaceABI = new ethers.utils.Interface(HTLC_ABI.abi);

/**
 * wMinima Contract Address
 */
var HTLCContractAddress = "0x67d269191c92caf3cd7723f116c85e6e9bf55933";

/**
 * Start an HTLC
 */
function startHTLCSwap(swappubkey, hashlock, timelock, erc20address, amount, callback){
	
	//Function params..
	//	address _receiver,
    //  bytes32 _hashlock,
    //  uint256 _timelock,
    //  address _tokenContract,
    //  uint256 _amount
	
	//Get ETH valid address
	var rec 	= swappubkey.toLowerCase();
	var ercaddr = erc20address.toLowerCase();
	var sec 	= hashlock.toLowerCase();
	
	//The actual amount - wMinima has 18 decimla places..
	var sendamount = ethers.utils.parseUnits(""+amount,18);
	
	//Get the function data
	var functiondata = HTLCInterfaceABI.functions.newContract.encode([rec , sec, timelock, ercaddr, sendamount]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(HTLCContractAddress, functiondata);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Start an HTLC
 */
function withdrawHTLCSwap(contractId, secret, callback){
	
	//Function params..
	//bytes32 _contractId, 
	//bytes32 _preimage
	
	//Get ETH valid address
	var contr = contractId.toLowerCase();
	var sec = secret.toLowerCase();
	
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
 * Get the logs of any HTLC which matters to you..
 */
function getHTLCContractYouOwn(callback){
	
	//Get your address - padded to fit the topics.
	var addr = ethers.utils.hexZeroPad(MAIN_WALLET.address, 32);
	
	//Get all the New Contracts that you OWN 
	var params = [
					{
						fromBlock:"0x10",
					 	toBlock:"latest",
					 	
						topics:[
								//Use the function SHA address, and your pub key in the index filter	
								"0x31a346f672cf5073bda81a99e0a28aff2bfe8c2db87d462bb2f4c114476a46ee",
								// This is the contractID - we don't care
								null, 
								// This is your address and the SENDER
								addr],
								 
					 	address:HTLCContractAddress
					}
				];
	//var params = [{"address":contractAddress}];
	var payload = {"jsonrpc":"2.0", "method":"eth_getLogs",
			"params": params, "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		
		//Now decode the response..
		var len = ethresp.result.length;
		for(var i=0;i<len;i++){
			
			var logdata = ethresp.result[i];
			
			//Get the contractid
			var contractid = logdata.topics[1]; 
			
			//Get th data
			var data = logdata.data;

			//address tokenContract,
        	//uint256 amount,
        	//bytes32 hashlock,
        	//uint256 timelock

			//Decode the data
			var datavars  = ethers.utils.defaultAbiCoder.decode(["address","uint256","bytes32","uint256"],data);
			
			MDS.log(JSON.stringify(datavars));
		}
		
		callback(ethresp);
	});
	
}