
/**
 * The RPC HOST
 */
var ETH_RPC_HOST = "http://127.0.0.1:8545/";

/**
 * The wMinima ABI interfaces
 */
var wMinimaInterfaceABI = new ethers.utils.Interface(WMINIMA_ABI.abi);

/**
 * wMinima Contract Address
 */
var wMinimaContractAddress = "0x95401dc811bb5740090279ba06cfa8fcf6113778";

/**
 * the Main ETH Wallet used 
 */
var MAIN_WALLET = null;

/**
 * Keep track of the nonce..
 */
var NONCE_TRACK = 0;

/**
 * Initialise the ETH subsystem
 */
function initialiseETH(privatekey, callback){
	
	//Create a wallet..
	MAIN_WALLET = new ethers.Wallet(privateKey);
	
	//And now set up the nonce..
	setNonceAuto(MAIN_WALLET.address,function(){
		MDS.log("ETH Wallet setup : "+MAIN_WALLET.address+" nonce:"+NONCE_TRACK);
		
		if(callback){
			callback();
		}
	});
}

/**
 * Auto-set the NONCE
 */
function setNonceAuto(address,callback){
	
	//Get the nonce..
	getTransactionCount(address,function(txncount){
				
		//This is the nonce..
		NONCE_TRACK = parseInt(txncount,16);
		
		//And send back..
		if(callback){
			callback(NONCE_TRACK);	
		}
	});
}

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
function getETHWeiBalance(address, callback) {
	
	//Set the function
	var payload = {"jsonrpc":"2.0", "method":"eth_getBalance",
			"params": [address,"latest"], "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp.result);
	});
}

function getETHBalance(address, callback) {
	getETHWeiBalance(address,function(ethresp){
		//Convert to ETH
		var ethvalue = ethers.utils.formatEther(ethresp);
		callback(ethvalue);
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
function createRAWSendTxn(toaddress, ethamount){
	
	var transaction = {
    	nonce: NONCE_TRACK,
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
function createRAWContractCallTxn(contractAddress, functionData){
	
	var transaction = {
    	nonce: NONCE_TRACK,
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
	
	//The NONCE MUST be incremnented..
	NONCE_TRACK++;
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp);
	});
}

/**
 * Sign and Send a RAW transaction
 */
function postTransaction(unsignedtransaction, callback){
	
	var signPromise = MAIN_WALLET.sign(unsignedtransaction);
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
function sendETH(toaddress, amount, callback){
	
	//Create a RAW txn
	var txn = createRAWSendTxn(toaddress.toLowerCase(), amount+"");
	
	//And now sign and Post It..
	postTransaction(txn, function(ethresp){
		callback(ethresp);
	});
}

/**
 * Get ERC20 Balance
 */
function getWMinimaBalance(address, callback){
	
	//Get ETH valid address
	var addr = address.toLowerCase();
	if(addr.startsWith("0x")){
		addr = addr.slice(2)
	}
	
	//Get the function data
	var functiondata = wMinimaInterfaceABI.functions.balanceOf.encode([ address ]);
	
	//Run this
	ethCallCommand(wMinimaContractAddress,functiondata,function(ethresp){
		var bal = ethers.utils.formatEther(ethresp.result);
		callback(bal);	
	});
}

/**
 * Send wMinima ERC20
 */
function sendWMinima(toaddress, amount, callback){
	
	//Get ETH valid address
	var addr = toaddress.toLowerCase();
	if(addr.startsWith("0x")){
		addr = addr.slice(2)
	}
	
	//The actual amount - wMinima has 18 decimla places..
	var sendamount = ethers.utils.parseUnits(""+amount,18);
	
	//Get the function data
	var functiondata = wMinimaInterfaceABI.functions.transfer.encode([addr ,sendamount]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(wMinimaContractAddress, functiondata);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		callback(ethresp);
	}); 
}