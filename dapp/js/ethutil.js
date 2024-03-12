
/**
 * The RPC HOST
 */
//var ETH_RPC_HOST = "http://127.0.0.1:8545/";
var ETH_RPC_HOST = "https://sepolia.infura.io/v3/9831285ff3f3404aa6250d9b473650f5";

/**
 * the Main ETH Wallet used 
 */
var MAIN_WALLET = null;

/**
 * Private Key
 */
var PRIVATE_KEY = "";
/**
 * Keep track of the nonce..
 */
var NONCE_TRACK = 0;

/**
 * Initialise the ETH subsystem
 */
function initialiseETH(private, callback){
	
	//Create a wallet..
	PRIVATE_KEY = private;
	MAIN_WALLET = new ethers.Wallet(PRIVATE_KEY);
	
	//And now set up the nonce..
	setNonceAuto(function(){
		MDS.log("ETH Wallet setup : "+MAIN_WALLET.address+" nonce:"+NONCE_TRACK);
		
		if(callback){
			callback();
		}
	});
}

function createAddressFromPrivateKey(private, callback){
	
	//Crteate a new wallet
	MAIN_WALLET = new ethers.Wallet(PRIVATE_KEY);
	
	//Clean up the address
	var cleanaddress = "0x"+MAIN_WALLET.address.slice(2).toUpperCase();
	
	//And send it back
	callback(cleanaddress);
}


/**
 * Return your main public key
 */
function getETHERUMAddress(){
	return "0x"+MAIN_WALLET.address.slice(2).toUpperCase();
}

/**
 * Auto-set the NONCE
 */
function setNonceAuto(callback){
	
	//Get the nonce..
	getRequiredNonce(function(nonce){
				
		//This is the nonce..
		NONCE_TRACK = nonce;
		
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
	
		var ethresp 			= {};
		ethresp.networkstatus 	= resp.status;
		ethresp.status 			= resp.status; 	
	
		//Did it work..?
		if(!resp.status){
			MDS.log("ERROR running ETH network command : "+JSON.stringify(resp));
			ethresp.error 		  = {};
			ethresp.error.message = resp.error;
			
		}else{
			
			//Parse the returned result
			var ethreturned = JSON.parse(resp.response);
			if(ethreturned.error){
				MDS.log("ERROR running ETH network command : "+JSON.stringify(resp));
				ethresp.status 	= false;
				ethresp.error 	= ethreturned.error;
			}else{
				ethresp.status 	= true;
				ethresp.result 	= ethreturned.result;
			}
		}
		
		//Send this back..
		callback(ethresp);
	});
}

/**
 * run an eth_call READ ONLY command
 */
function ethCallCommand(contractAddress, functionData, callback){
		
	var payload = {jsonrpc: "2.0",method: "eth_call",
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
function getCurrentETHBlock(callback) {
	
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
function getETHEREUMWeiBalance(address, callback) {
	
	//Set the function
	var payload = {"jsonrpc":"2.0", "method":"eth_getBalance",
			"params": [address,"latest"], "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp.result);
	});
}

function getETHEREUMBalance(callback) {
	getETHEREUMWeiBalance(getETHERUMAddress(),function(ethresp){
		//Convert to ETH
		var ethvalue = ethers.utils.formatEther(ethresp);
		callback(ethvalue);
	});
}

/**
 * Get the Nonce for an address
 */
function getRequiredNonce(callback) {
	
	//Set the function
	var payload = {"jsonrpc":"2.0", "method":"eth_getTransactionCount",
			"params": [getETHERUMAddress(),"latest"], "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		
		if(ethresp.status){
			var nonce = parseInt(ethresp.result,16);	
			callback(nonce);	
		}else{
			callback(-1);
		}
	});
}	

/**
 * Create a RAW unsigned Simple ETH Send Transaction
 */
function createRAWSendTxn(toaddress, ethamount, nonce){
	
	//Did we specify a nonce..
	var usenonce = NONCE_TRACK;
	if(nonce){
		usenonce = nonce;
	}
	
	var transaction = {
    	nonce: usenonce,
    	gasLimit: 21000,
    	gasPrice: ethers.utils.bigNumberify("80000000000"),
    	to: toaddress,
    	value: ethers.utils.parseEther(ethamount+""),
	};
	
	return transaction;	
}

/**
 * Create a RAW unsigned Contract Call Transaction
 */
function createRAWContractCallTxn(contractAddress, functionData, nonce){
	
	//Did we specify a nonce..
	var usenonce = NONCE_TRACK;
	if(nonce){
		usenonce = nonce;
	}
	
	var transaction = {
    	nonce: usenonce,
    	gasLimit: 1000000,
    	gasPrice: ethers.utils.bigNumberify("80000000000"),
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
		
		//Was it a success - as in we spoke to the ETH node..
		if(ethresp.networkstatus){
			//The NONCE MUST be incremented..
			NONCE_TRACK++;		
		}
		
		callback(ethresp);
	});
}

/**
 * Sign and Send a RAW transaction
 */
function postTransaction(unsignedtransaction, callback){
	
	//Create the signature
	var signedTransaction  = ethSigner.sign(unsignedtransaction,PRIVATE_KEY);
	
	//Now send!
    sendRAWSignedTxn(signedTransaction,function(ethresp){
		callback(ethresp);
    });
	
	/*var signPromise = MAIN_WALLET.sign(unsignedtransaction);
	signPromise.then((signedTransaction) => {
	    MDS.log("Transaction Signed : "+signedTransaction);
	    //Now send!
	    sendRAWSignedTxn(signedTransaction,function(ethresp){
			MDS.log("Transaction SENT : "+JSON.stringify(ethresp));
			callback(ethresp);
	    });
	});*/
}

/**
 * Send ETH function
 */
function sendETHEREUM(toaddress, amount, callback){
	
	//Create a RAW txn
	var txn = createRAWSendTxn(toaddress.toLowerCase(), amount+"", NONCE_TRACK);
	
	//And now sign and Post It..
	postTransaction(txn, function(ethresp){
		callback(ethresp);
	});
}

function sendETHEREUMGetNonce(toaddress, amount, callback){
	
	//Get the current nonce..
	getRequiredNonce(function(nonce){
		
		//Create a RAW txn
		var txn = createRAWSendTxn(toaddress.toLowerCase(), amount+"", nonce);
		
		//And now sign and Post It..
		postTransaction(txn, function(ethresp){
			
			//Store the nonce..
			if(ethresp.status){
				NONCE_TRACK = nonce+1;
			}
			
			callback(ethresp);
		});	
	});
}

/**
 * Check transaction confirmation 
 */
function checkETHTransaction(txnhash, callback){
	
	//Set the function
	var payload = {"jsonrpc":"2.0", "method":"eth_getTransactionByHash",
			"params": [txnhash], "id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp);
	});
}