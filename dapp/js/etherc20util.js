/**
 * ERC20 ABI interface
 */
var ERC20InterfaceABI = new ethers.utils.Interface(ERC20_ABI);

/**
 * Get ERC20 Balance
 */
function getERC20Balance(erc20contract, callback){
	
	//Get the function data
	var functiondata = ERC20InterfaceABI.functions.balanceOf.encode([ MAIN_WALLET.address ]);
	
	//Run this
	ethCallCommand(erc20contract,functiondata,function(ethresp){
		var bal = ethers.utils.formatEther(ethresp.result);
		callback(bal);	
	});
}

/**
 * Send ERC20
 */
function sendERC20(erc20contract, decimals, toaddress, amount, callback){
	
	//Get ETH valid address
	var addr = toaddress.toLowerCase();
	if(addr.startsWith("0x")){
		addr = addr.slice(2)
	}
	
	//The actual amount - wMinima has 18 decimla places..
	var sendamount = ethers.utils.parseUnits(""+amount,decimals);
	
	//Get the function data
	var functiondata = ERC20InterfaceABI.functions.transfer.encode([addr ,sendamount]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(erc20contract, functiondata);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		callback(ethresp);
	}); 
}

/**
 * Get the current nonce and send 
 */
function sendERC20GetNonce(erc20contract, decimals, toaddress, amount, callback){
	
	//Get the current nonce..
	getRequiredNonce(function(nonce){
		
		//Get ETH valid address
		var addr = toaddress.toLowerCase();
		if(addr.startsWith("0x")){
			addr = addr.slice(2)
		}
		
		//The actual amount - wMinima has 18 decimla places..
		var sendamount = ethers.utils.parseUnits(""+amount,decimals);
		
		//Get the function data
		var functiondata = ERC20InterfaceABI.functions.transfer.encode([addr ,sendamount]);
		
		//Now create the RAW txn..
		var transaction = createRAWContractCallTxn(erc20contract, functiondata, nonce);
		
		//NOW SIGN..
		postTransaction(transaction, function(ethresp){
			callback(ethresp);
		});
	}); 
}

/**
 * Approve a Contract to touch your wMinima
 */
function erc20Approve(erc20contract, decimals,  contractaddress, amount, callback){
	
	//Get ETH valid address
	var addr = contractaddress.toLowerCase();
	if(addr.startsWith("0x")){
		addr = addr.slice(2)
	}
	
	//The actual amount - wMinima has 18 decimla places..
	var sendamount = "0";
	if(amount == "max"){
		//2^256 -1
		sendamount = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
	}else{
		sendamount = ethers.utils.parseUnits(""+amount,decimals);
	}
	
	//Get the function data
	var functiondata = ERC20InterfaceABI.functions.approve.encode([addr, sendamount]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(erc20contract, functiondata);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		if(ethresp.status){
			logApprove(ethresp.result,function(){
				callback(ethresp);	
			});
		}else{
			callback(ethresp);	
		}
	}); 
}

/**
 * What is the allowance for this Owner on Contract
 */
function erc20Allowance(erc20contract, contractaddress, callback){
	
	var addr = contractaddress.toLowerCase();
	if(addr.startsWith("0x")){
		addr = addr.slice(2)
	}
	
	//Get the function data
	var functiondata = ERC20InterfaceABI.functions.allowance.encode([MAIN_WALLET.address, addr]);
	
	//Run this as a READ command
	ethCallCommand(erc20contract,functiondata,function(ethresp){
		var bal = ethers.utils.formatEther(ethresp.result);
		callback(bal);	
	}); 
}