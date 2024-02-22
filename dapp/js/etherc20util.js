/**
 * The wMinima ABI interfaces
 */
var wMinimaInterfaceABI = new ethers.utils.Interface(WMINIMA_ABI.abi);

/**
 * wMinima Contract Address
 */
var wMinimaContractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

/**
 * Get ERC20 Balance
 */
function getWMinimaBalance(address, callback){
	
	//Get ETH valid address
	var addr = address.toLowerCase();
	if(addr.startsWith("0x")){
		addr = addr.slice(2)
	}
	
	//Get the function data
	var functiondata = wMinimaInterfaceABI.functions.balanceOf.encode([ address ]);
	
	//Run this
	ethCallCommand(wMinimaContractAddress,functiondata,function(ethresp){
		var bal = ethers.utils.formatEther(ethresp.result);
		callback(bal);	
	});
}

/**
 * Send wMinima ERC20
 */
function sendWMinima(toaddress, amount, callback){
	
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