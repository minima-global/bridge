/**
 * wMinima Contract Address
 */
var wMinimaContractAddress = "0x"+("e7f1725E7734CE288F8367e1Bb143E90bb3F0512".toUpperCase());

/**
 * Get wMinima Balance
 */
function getWMinimaBalance(callback){
	getERC20Balance(wMinimaContractAddress,function(balance){
		callback(balance);
	});
}

/**
 * Send wMinima ERC20
 */
function sendWMinimaERC20(toaddress, amount, callback){
	sendERC20(wMinimaContractAddress,18,toaddress,amount,function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Get the current nonce and send
 */
function sendWMinimaERC20GetNonce(toaddress, amount, callback){
	sendERC20GetNonce(wMinimaContractAddress,18,toaddress,amount,function(ethresp){
		callback(ethresp);
	});
}

/**
 * Approve a Contract to touch your wMinima
 */
function wMinimaApprove(contractaddress, amount, callback){
	 erc20Approve(wMinimaContractAddress,18,contractaddress,amount,function(ethresp){
		callback(ethresp);
	});
}

/**
 * What is the allowance for this Owner on Contract
 */
function wMinimaAllowance(owner, contractaddress, callback){
	erc20Allowance(wMinimaContractAddress, owner, contractaddress, function(ethresp){
		callback(ethresp);
	}); 
}