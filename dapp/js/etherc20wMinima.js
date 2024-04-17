
/**
 * Get wMinima Balance
 */
function getWMinimaBalance(callback){
	getERC20Balance(wMinimaContractAddress,WMINIMA_DECIMALS,function(balance){
		callback(balance);
	});
}

/**
 * Send wMinima ERC20
 */
function sendWMinimaERC20(toaddress, amount, callback){
	sendERC20(wMinimaContractAddress,WMINIMA_DECIMALS,toaddress,amount,function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Approve a Contract to touch your wMinima
 */
function wMinimaApprove(contractaddress, amount, callback){
	 erc20Approve(wMinimaContractAddress,WMINIMA_DECIMALS,contractaddress,amount,function(ethresp){
		callback(ethresp);
	});
}

/**
 * What is the allowance for this Owner on Contract
 */
function wMinimaAllowance(contractaddress, callback){
	erc20Allowance(wMinimaContractAddress, contractaddress, function(ethresp){
		callback(ethresp);
	}); 
}