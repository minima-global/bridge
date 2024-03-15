/**
 * USDT Contract Address
 */

//SEPOLIA
//var USDTContractAddress = "0x"+("b3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C".toUpperCase());

//HARDHAT
var USDTContractAddress = "0x"+("5FbDB2315678afecb367f032d93F642f64180aa3".toUpperCase());

//How many decimals does the USDT contract have
var USDT_DECIMALS = 18;

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
	sendERC20(USDTContractAddress,USDT_DECIMALS,toaddress,amount,function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Get the current nonce and send
 */
function sendUSDTGetNonce(toaddress, amount, callback){
	sendERC20GetNonce(USDTContractAddress,USDT_DECIMALS,toaddress,amount,function(ethresp){
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