
/**
 * The ETH RPC HOST
 */

//HARDHAT
//var USE_API_KEYS			= false;
//var ETH_INFURA_HOST 		= "http://127.0.0.1:8545/";
//var ETH_INFURA_GASAPI_HOST 	= "";
//var ETHERSCAN_LINK			= "";

//SEPOLIA
var USE_API_KEYS			= true;
var ETH_INFURA_HOST 		= "https://sepolia.infura.io/v3/";
var ETH_INFURA_GASAPI_HOST 	= "https://gas.api.infura.io/networks/11155111/suggestedGasFees";
var ETHERSCAN_LINK			= "https://sepolia.etherscan.io/tx/";

/**
 * the Main ETH Wallet address
 */
//var MAIN_WALLET	 	 = null;
var MAIN_ETH_ADDRESS = "unknown";
/**
 * Private Key
 */
var PRIVATE_KEY = "";

/**
 * Keep track of the nonce..
 */
var NONCE_TRACK = -1;

/**
 * The current GAS - taken from INFURA
 */
var GAS_API = {};

/**
 * Initialise the ETH Address - this is DONE ONCE ONLY
 */
function initialiseETHAddress(private, callback){
	
	//Create a wallet..
	var wallet = new ethers.Wallet(private);
	
	//Clean up the address
	var cleanwallet = "0x"+wallet.address.slice(2).toUpperCase();
	
	MDS.log("ETH Wallet setup : "+cleanwallet);
	MAIN_ETH_ADDRESS 	= cleanwallet;
	PRIVATE_KEY			= private;
	
	if(callback){
		callback(cleanwallet);
	}
}

/**
 * Set get ETH Address
 */
function getETHERUMAddress(){
	return MAIN_ETH_ADDRESS;
}

function setETHEREUMAddress(address){
	MAIN_ETH_ADDRESS = address;
}

/**
 * Set Get Private keys
 */
function setETHPrivateKey(privatekey){
	PRIVATE_KEY = privatekey;
}

function getETHPrivateKey(){
	return PRIVATE_KEY;
}

/**
 * Get / Set the INFURA API KEYS
 */
function setInfuraApiKeys(apikey, apikeysecret, base64auth, callback){
	
	var fullkeys 			= {};
	fullkeys.enabled 		= true;
	fullkeys.apikey 		= apikey;
	fullkeys.apikeysecret 	= apikeysecret;
	fullkeys.basicauth 		= base64auth;
	
	MDS.keypair.set("_apikeys",JSON.stringify(fullkeys),function(init){
		callback(init);
	});
}

function clearInfuraApiKeys(callback){
	
	var fullkeys 	 = {};
	fullkeys.enabled = false;
	MDS.keypair.set("_apikeys",JSON.stringify(fullkeys),function(init){
		callback(init);
	});
}

function getInfuraApiKeys(callback){
	MDS.keypair.get("_apikeys",function(getresult){
		if(getresult.status){
			callback(JSON.parse(getresult.value));
		}else{
			var fullkeys 			= {};
			fullkeys.enabled 		= false;
			callback(fullkeys);	
		}
	});
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

function setGasAuto(callback){
	
	//Are we running on HARDHAT
	if(ETH_INFURA_GASAPI_HOST == ""){
		GAS_API 								= {};
		GAS_API.low  							= {};
		GAS_API.low.suggestedMaxFeePerGas 		= "40.0";	
		GAS_API.medium  						= {};
		GAS_API.medium.suggestedMaxFeePerGas 	= "80.0";	
		GAS_API.high  							= {};
		GAS_API.high.suggestedMaxFeePerGas 		= "120.0";	
		GAS_API.valid 							= true;
		
		//And send back..
		if(callback){
			callback(GAS_API);	
		}
		
		return;
	}
	
	//Now get the current fees..
	getInfuraGASAPI(function(gasapi){
		
		//Check valid..
		if(gasapi.status && gasapi.response != ""){
			GAS_API 		= JSON.parse(gasapi.response);	
			GAS_API.valid 	= true;
		}else{
			GAS_API 		= {};
			GAS_API.valid 	= false;
			MDS.log("ERROR Getting GAS API "+JSON.stringify(gasapi));
		}
		
		//And send back..
		if(callback){
			callback(GAS_API);	
		}
	});
}

/**
 * Run an ETH command  
 */
function runEthCommand(payload, callback){
	
	//Get the current INFURA HOST
	getInfuraApiKeys(function(apikeys){
		
		var rpchost = "";
		
		if(USE_API_KEYS){
			if(apikeys.enabled){
				rpchost = ETH_INFURA_HOST+apikeys.apikey;
			}else{
				var ethresp 			= {};
				ethresp.networkstatus 	= false;
				ethresp.status 			= false;
				ethresp.error			= "INFURA API keys not specified..!";
				 	
				callback(ethresp);
				return;
			}	
		}else{
			//HARDHAT
			rpchost = ETH_INFURA_HOST;
		}
		
		//Now make the call
		MDS.net.POST(rpchost,JSON.stringify(payload),function (resp) {
		 	//MDS.log(resp.response);
		
			var ethresp 			= {};
			ethresp.networkstatus 	= resp.status;
			
			//Did it work..?
			if(!resp.status){
				MDS.log("NETWORK ERROR running ETH network command : "+JSON.stringify(resp));
				ethresp.status 			= false;
				ethresp.error 		  	= {};
				ethresp.error.message 	= resp.error;
				
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
 * get the Current GAS API values..
 */
function getInfuraGASAPI(callback){
	
	//Get the current INFURA HOST
	getInfuraApiKeys(function(apikeys){
		
		//Call the Infura GAS API
		MDS.net.GETAUTH(ETH_INFURA_GASAPI_HOST,apikeys.basicauth,function(resp){
			callback(resp);
		});
	});
}

function estimateGas(transaction,callback){
	var payload = {	"jsonrpc":"2.0", 
					"method":"eth_estimateGas",
					"params": [transaction], 
					"id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp);
	});
}

function getTransactionReceipt(txnhash,callback){
	var payload = {	"jsonrpc":"2.0", 
					"method":"eth_getTransactionReceipt",
					"params": [txnhash], 
					"id": 1};
	  
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp);
	});
}

//Check if this transaction has been mined..
function checkETHTransactionStatus(transactionid, callback){
	
	//Get it from the DB
	getETHTransaction(transactionid,function(sqlgetresp){
		
		//Get details
		var res 		= sqlgetresp.rows[0];
		var status 		= res.STATUS;
		var transaction = JSON.parse(decodeStringFromDB(res.TRANSACTION));
		var eventdate	= res.EVENTDATE;
		
		if(status == "WAITING"){
			
			//Check Transaction Receipt
			getTransactionReceipt(transactionid,function(ethresp){
				if(ethresp.result && ethresp.result.blockNumber){
					//Has been mined..
					changeStatusETHTransaction(transactionid,"MINED",function(sqlupdateresp){
						callback("MINED",transaction,eventdate)		
					});
				}else{
					//Has not been mined yet
					callback("WAITING",transaction,eventdate);
				}
			});		
			
		}else if(status == "MINED"){
			callback("MINED",transaction,eventdate);
		}else{
			//Has been boosted..
			callback(status,transaction,eventdate);
		}
	});
}

/**
 * Create a RAW unsigned Simple ETH Send Transaction
 */
function createRAWSendTxn(toaddress, ethamount){
	
	//WE USE the MEDIUM GAS
	var usegas 			= GAS_API.medium;
	var maxfee 			= ethers.utils.parseUnits(usegas.suggestedMaxFeePerGas,"gwei");
	if(maxfee._hex){
		maxfee = maxfee._hex;
	}
	
	//We are NOT eip1559 compatible
	var transaction = {
    	nonce: NONCE_TRACK,
    	gasLimit: 21000,
    	gasPrice: maxfee,
    	to: toaddress,
    	value: ""+ethers.utils.parseEther(ethamount+"")
	};
	
	return transaction;	
}

/**
 * Create a RAW unsigned Contract Call Transaction
 */
function createRAWContractCallTxn(contractAddress, functionData, gaslimit){
	
	//WE USE the MEDIUM GAS
	var usegas 			= GAS_API.medium;
	var maxfee 			= ethers.utils.parseUnits(usegas.suggestedMaxFeePerGas,"gwei");
	if(maxfee._hex){
		maxfee = maxfee._hex;
	}
	
	//Our Signing LIB is NOT eip1559 compatible..
	var transaction = {
    	nonce: NONCE_TRACK,
		
		gasLimit: gaslimit,
    	
		gasPrice: maxfee,
		//gasPrice: ethers.utils.bigNumberify("130000000000"),
		
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
		
		//Was it a success - as in we spoke to the ETH node and got a sucess..
		if(ethresp.networkstatus && ethresp.status){
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
		
		//Put in the SQL DB
		if(ethresp.networkstatus && ethresp.status){
			insertEthTransaction(ethresp.result,unsignedtransaction,function(){
				callback(ethresp);
			});	
		}else{
			callback(ethresp);	
		}
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
	var txn = createRAWSendTxn(toaddress.toLowerCase(), amount+"");
	
	//And now sign and Post It..
	postTransaction(txn, function(ethresp){
		
		//Put in the SQL DB
		if(ethresp.networkstatus && ethresp.status){
			insertSendETH("ETH",ethresp.result, amount, function(){
				callback(ethresp);
			});		
		}else{
			callback(ethresp);	
		}
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

function boostTransaction(transactionid,callback){
		
	//Get it from the DB
	getETHTransaction(transactionid,function(sqlgetresp){
		
		//Does it exist..
		if(sqlgetresp.rows.length==0){
			//No transaction found..
			var resp = {};
			resp.networkstatus 	= false;
			resp.status 		= false;
			resp.error  		= "Transaction with ID:"+transactionid+" not found..";
			callback(resp);
			return;
		}
		
		//Get details
		var res 		= sqlgetresp.rows[0];
		var transaction = JSON.parse(decodeStringFromDB(res.TRANSACTION));
		
		//WE USE the HIGH GAS for boost
		var usegas 				= GAS_API.high;
		var maxfee 				= ethers.utils.parseUnits(usegas.suggestedMaxFeePerGas,"gwei");
		if(maxfee._hex){
			maxfee = maxfee._hex;
		}	
		
		//Update the GAS
		transaction.gasPrice	= maxfee;
		
		//Boost it..
		postTransaction(transaction,function(ethresp){
			callback(ethresp);
		});
	});
}