
var ETH_RPC_HOST = "http://127.0.0.1:8545/";

/**
 * Run an ETH command  
 */
function runEthCommand(payload, callback){
	MDS.net.POST(ETH_RPC_HOST,JSON.stringify(payload),function (resp) {
	 	//MDS.log(resp.response);
	 	callback(JSON.parse(resp.response));
	});
}

/**
 * run an eth_call READ ONLY command
 */
function ethCallCommand(contractAddress, functionData, callback){
		
	const payload = {jsonrpc: "2.0",method: "eth_call",
			params: [{to: contractAddress,data:functionData},"latest"],
			id: 1};
		
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp);
	});
}
	
/**
 * Get the current block
 */
function getCurrentBlock(callback) {
	
	//Set the function
	var payload = {"jsonrpc":"2.0", "method":"eth_blockNumber","params": [], "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback( parseInt(ethresp.result,16) );
	});
}

/**
 * Get the current balance of an address
 */
function getWeiBalance(address, callback) {
	
	//Set the function
	var payload = {"jsonrpc":"2.0", "method":"eth_getBalance",
			"params": [address,"latest"], "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp.result);
	});
}

/**
 * Get the Nonce for an address
 */
function getTransactionCount(address, callback) {
	
	//Set the function
	var payload = {"jsonrpc":"2.0", "method":"eth_getTransactionCount",
			"params": [address,"latest"], "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp.result);
	});
}

function getRequiredNonce(address, callback) {
	getTransactionCount(address, function(txncount){
		var nonce = parseInt(txncount,16);	
		callback(nonce);
	});
}

/**
 * Create a RAW unsigned Simple ETH Send Transaction
 */
function createRAWSendTxn(toaddress, nonce, ethamount){
	
	var transaction = {
    	nonce: nonce,
    	gasLimit: 21000,
    	gasPrice: ethers.utils.bigNumberify("20000000000"),
    	to: toaddress,
    	value: ethers.utils.parseEther(ethamount),
	};
	
	return transaction;	
}

/**
 * Create a RAW unsigned Contract Call Transaction
 */
function createRAWContractCallTxn(contractAddress, functionData, nonce){
	
	var transaction = {
    	nonce: nonce,
    	gasLimit: 100000,
    	gasPrice: ethers.utils.bigNumberify("20000000000"),
    	to: contractAddress,
    	data:functionData
	};
	
	return transaction;	
}	

/**
 * Send a RAW Signed transaction
 */
function sendRAWSignedTxn(signedtxn,callback){
	
	//Set the function
	var payload = {"jsonrpc":"2.0", "method":"eth_sendRawTransaction",
			"params": [signedtxn], 
			"id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp);
	});
}

/**
 * Sign and Send a RAW transaction
 */
function postTransaction(wallet, unsignedtransaction, callback){
	
	var signPromise = wallet.sign(unsignedtransaction);
	signPromise.then((signedTransaction) => {
	    
	    //Now send!
	    sendRAWSignedTxn(signedTransaction,function(ethresp){
	    	callback(ethresp);
	    });
	});
}

/**
 * Send ETH function
 */
function sendETH(wallet, toaddress, amount,  nonce, callback){
	
	//Create a RAW txn
	var txn = createRAWSendTxn(toaddress.toLowerCase(), nonce, amount+"");
	
	//And now sign and Post It..
	postTransaction(wallet, txn, function(ethresp){
		callback(ethresp);
	});
}