
/**
 * Get USDT Balance
 */
function getUSDTBalance(callback){
	getERC20Balance(USDTContractAddress,USDT_DECIMALS,function(balance){
		callback(balance);
	});
}

/**
 * Send USDT ERC20
 */
function sendUSDT(toaddress, amount, callback){
	sendERC20(USDTContractAddress,USDT_DECIMALS,toaddress,amount,function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Approve a Contract to touch your USDT
 */
function USDTApprove(contractaddress, amount, callback){
	 erc20Approve(USDTContractAddress,USDT_DECIMALS,contractaddress,amount,function(ethresp){
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