/**
 * wMinima Contract Address
 */
//var wMinimaContractAddress = "0x"+("e7f1725E7734CE288F8367e1Bb143E90bb3F0512".toUpperCase());
var wMinimaContractAddress = "0x"+("2Bf712b19a52772bF54A545E4f108e9683fA4E2F".toUpperCase());

//How many decimals does the USDT contract have
var WMINIMA_DECIMALS = 18;

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
	sendERC20(wMinimaContractAddress,WMINIMA_DECIMALS,toaddress,amount,function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Get the current nonce and send
 */
function sendWMinimaERC20GetNonce(toaddress, amount, callback){
	sendERC20GetNonce(wMinimaContractAddress,WMINIMA_DECIMALS,toaddress,amount,function(ethresp){
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