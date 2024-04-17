/**
 * ERC20 ABI interface
 */
var ERC20InterfaceABI = new ethers.utils.Interface(ERC20_ABI);

/**
 * Get ERC20 Balance
 */
function getERC20Balance(erc20contract, decimals, callback){
	
	//Get the function data
	var functiondata = ERC20InterfaceABI.functions.balanceOf.encode([ getETHERUMAddress() ]);
	
	//Run this
	ethCallCommand(erc20contract,functiondata,function(ethresp){
		//var bal = ethers.utils.formatEther(ethresp.result);
		var bal = ethers.utils.formatUnits(""+ethresp.result, decimals);
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
	var transaction = createRAWContractCallTxn(erc20contract, functiondata, 100000);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		
		//Put in the SQL DB
		if(ethresp.networkstatus && ethresp.status){
			insertSendETH(erc20contract,ethresp.result, amount, function(){
				callback(ethresp);
			});		
		}else{
			callback(ethresp);	
		}
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
	var transaction = createRAWContractCallTxn(erc20contract, functiondata, 60000);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		if(ethresp.status){
			logApprove(erc20contract,ethresp.result,function(){
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
	var functiondata = ERC20InterfaceABI.functions.allowance.encode([getETHERUMAddress(), addr]);
	
	//Run this as a READ command
	ethCallCommand(erc20contract,functiondata,function(ethresp){
		var bal = ethers.utils.formatEther(ethresp.result);
		callback(bal);	
	}); 
}