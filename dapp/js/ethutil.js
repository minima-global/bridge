
/**
 * Run an ETH command  
 */
function runEthCommand(payload, callback){
	MDS.net.POST("http://127.0.0.1:8545/",JSON.stringify(payload),function (resp) {
	 	//MDS.log(resp.response);
	 	callback(JSON.parse(resp.response));
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

/**
 * Create a RAW unsigned Transaction
 */
function createRAWTxn(toaddress, nonce, ethamount){
	
	var transaction = {
    	nonce: nonce,
    	gasLimit: 21000,
    	gasPrice: ethers.utils.bigNumberify("20000000000"),
    	to: toaddress,
    	value: ethers.utils.parseEther(ethamount),
    	data: "0x"
		//chainId: ethers.utils.getNetwork('homestead').chainId
	};
	
	return transaction;	
}	

/**
 * Create a RAW unsigned Transaction
 */
function balanceCall(toaddress, callback){
	
	var address = toaddress.slice(2).toLowerCase();
	const contractAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
    const payload = {
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: "0x70a08231000000000000000000000000"+address
          },
          "latest",
        ],
        id: 1,
      };
	
	//Run it..
	runEthCommand(payload,function(ethresp){
		callback(ethresp.result);
	});	
}	

function getWrappedBalance(ofAddress) {

	var address = ofAddress.slice(2).toLowerCase();
	const contractAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
      const payload = {
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: "0x70a08231000000000000000000000000"+address
          },
          "latest",
        ],
        id: 1,
      };
    
      return new Promise((resolve) => {
        MDS.net.POST(
          "http://127.0.0.1:8545",
          JSON.stringify(payload),
          function (resp) {
            const balance = JSON.parse(resp.response).result;
    
            // Using normal Maths loses precision, may need to use
            // BigNumber.js for this.
            const number = parseInt(balance) / Math.pow(10, 18);
    
            resolve(number);
          }
        );
      });
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

