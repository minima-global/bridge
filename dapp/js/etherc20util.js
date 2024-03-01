/**
 * The wMinima ABI interfaces
 */
var wMinimaInterfaceABI = new ethers.utils.Interface(WMINIMA_ABI.abi);

/**
 * wMinima Contract Address
 */
var wMinimaContractAddress = "0x"+("e7f1725E7734CE288F8367e1Bb143E90bb3F0512".toUpperCase());

/**
 * Get ERC20 Balance
 */
function getWMinimaBalance(callback){
	
	//Get the function data
	var functiondata = wMinimaInterfaceABI.functions.balanceOf.encode([ MAIN_WALLET.address ]);
	
	//Run this
	ethCallCommand(wMinimaContractAddress,functiondata,function(ethresp){
		var bal = ethers.utils.formatEther(ethresp.result);
		callback(bal);	
	});
}

/**
 * Send wMinima ERC20
 */
function sendWMinimaERC20(toaddress, amount, callback){
	
	//Get ETH valid address
	var addr = toaddress.toLowerCase();
	if(addr.startsWith("0x")){
		addr = addr.slice(2)
	}
	
	//The actual amount - wMinima has 18 decimla places..
	var sendamount = ethers.utils.parseUnits(""+amount,18);
	
	//Get the function data
	var functiondata = wMinimaInterfaceABI.functions.transfer.encode([addr ,sendamount]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(wMinimaContractAddress, functiondata);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		callback(ethresp);
	}); 
}

function sendWMinimaERC20GetNonce(toaddress, amount, callback){
	
	//Get the current nonce..
	getRequiredNonce(MAIN_WALLET.address,function(nonce){
		
		//Get ETH valid address
		var addr = toaddress.toLowerCase();
		if(addr.startsWith("0x")){
			addr = addr.slice(2)
		}
		
		//The actual amount - wMinima has 18 decimla places..
		var sendamount = ethers.utils.parseUnits(""+amount,18);
		
		//Get the function data
		var functiondata = wMinimaInterfaceABI.functions.transfer.encode([addr ,sendamount]);
		
		//Now create the RAW txn..
		var transaction = createRAWContractCallTxn(wMinimaContractAddress, functiondata, nonce);
		
		//NOW SIGN..
		postTransaction(transaction, function(ethresp){
			callback(ethresp);
		});
	}); 
}

/**
 * Approve a Contract to touch your wMinima
 */
function erc20Approve(contractaddress, amount, callback){
	
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
		sendamount = ethers.utils.parseUnits(""+amount,18);
	}
	
	//Get the function data
	var functiondata = wMinimaInterfaceABI.functions.approve.encode([addr, sendamount]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(wMinimaContractAddress, functiondata);
	
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
function erc20Allowance(owner, contractaddress, callback){
	
	//Get ETH valid address
	var own = owner.toLowerCase();
	if(own.startsWith("0x")){
		own = own.slice(2)
	}
	
	var addr = contractaddress.toLowerCase();
	if(addr.startsWith("0x")){
		addr = addr.slice(2)
	}
	
	//Get the function data
	var functiondata = wMinimaInterfaceABI.functions.allowance.encode([own, addr]);
	
	//Run this as a READ command
	ethCallCommand(wMinimaContractAddress,functiondata,function(ethresp){
		var bal = ethers.utils.formatEther(ethresp.result);
		callback(bal);	
	}); 
}