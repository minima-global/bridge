/**
 * USDT Contract Address
 */
var USDTContractAddress = "0x"+("a513E6E4b8f2a923D98304ec87F64353C4D5C853".toUpperCase());

/**
 * Get USDT Balance
 */
function getUSDTBalance(callback){
	getERC20Balance(USDTContractAddress,function(balance){
		callback(balance);
	});
}

/**
 * Send USDT ERC20
 */
function sendUSDT(toaddress, amount, callback){
	sendERC20(USDTContractAddress,18,toaddress,amount,function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Get the current nonce and send
 */
function sendUSDTGetNonce(toaddress, amount, callback){
	sendERC20GetNonce(USDTContractAddress,18,toaddress,amount,function(ethresp){
		callback(ethresp);
	});
}

/**
 * Approve a Contract to touch your USDT
 */
function USDTApprove(contractaddress, amount, callback){
	 erc20Approve(USDTContractAddress,18,contractaddress,amount,function(ethresp){
		callback(ethresp);
	});
}

/**
 * What is the allowance for this Owner on Contract
 */
function USDTAllowance(owner, contractaddress, callback){
	erc20Allowance(USDTContractAddress, owner, contractaddress, function(ethresp){
		callback(ethresp);
	}); 
}