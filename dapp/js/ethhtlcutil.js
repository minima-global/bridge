/**
 * The HTLC ABI interfaces
 */
var HTLCInterfaceABI = new ethers.utils.Interface(HTLC_ABI.abi);

/**
 * wMinima Contract Address
 */
var HTLCContractAddress = "0x9a9f2ccfde556a7e9ff0848998aa4a0cfd8863ae";

/**
 * Start an HTLC
 */
function startHTLCSwap(swappubkey, secret, timelock, erc20address, amount, callback){
	
	//Function params..
	//	address _receiver,
    //  bytes32 _hashlock,
    //  uint256 _timelock,
    //  address _tokenContract,
    //  uint256 _amount
	
	//Get ETH valid address
	var rec = swappubkey.toLowerCase();
	if(rec.startsWith("0x")){
		rec = rec.slice(2)
	}
	
	var ercaddr = erc20address.toLowerCase();
	if(ercaddr.startsWith("0x")){
		ercaddr = ercaddr.slice(2)
	}
	
	var sec = secret.toLowerCase();
	/*if(sec.startsWith("0x")){
		sec = sec.slice(2)
	}*/
	
	//The actual amount - wMinima has 18 decimla places..
	var sendamount = ethers.utils.parseUnits(""+amount,18);
	
	//Get the function data
	var functiondata = HTLCInterfaceABI.functions.newContract.encode([rec , sec, timelock, ercaddr, sendamount]);
	
	//Now create the RAW txn..
	var transaction = createRAWContractCallTxn(HTLCContractAddress, functiondata);
	
	//NOW SIGN..
	postTransaction(transaction, function(ethresp){
		callback(ethresp);
	}); 
}