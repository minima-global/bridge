
//Minimum ETH block to check for events
var MIN_HTLC_BLOCK = 0;

//The Minima block time - different for TEST net
var MINIMA_BLOCK_TIME = 50;

//How far back in the order book to check..
var ORDERBOOK_UPDATE_TIME_MINUTES = 30;
var ORDERBOOK_DEPTH = Math.floor((60 * (ORDERBOOK_UPDATE_TIME_MINUTES*2)) / MINIMA_BLOCK_TIME); 

//The ETH block time
var ETH_BLOCK_TIME = 15;

//The MAIN timelock to add to the current time when starting an HTLC - 2 hours
var HTLC_TIMELOCK_SECS = 60 * 60 * 2;

//The MAIN timelock in MINIMA BLOCKS that gets added to the current block
var HTLC_TIMELOCK_BLOCKS = Math.floor(HTLC_TIMELOCK_SECS / MINIMA_BLOCK_TIME);

//The minimum time difference to send counter party txn
var HTLC_TIMELOCK_COUNTERPARTY_SECS_CHECK = Math.floor(HTLC_TIMELOCK_SECS / 2); 

//The minimum time difference to send counter party txn
var HTLC_TIMELOCK_COUNTERPARTY_BLOCKS_CHECK = Math.floor(HTLC_TIMELOCK_BLOCKS / 2); 

//The timelock of counterparty txns
var HTLC_TIMELOCK_COUNTERPARTY_SECS = Math.floor(HTLC_TIMELOCK_COUNTERPARTY_SECS_CHECK / 2); 

//The minimum time difference to send counter party txn
var HTLC_TIMELOCK_COUNTERPARTY_BLOCKS = Math.floor(HTLC_TIMELOCK_COUNTERPARTY_BLOCKS_CHECK / 2); 

//How far back to check for secrets on startup
var HTLC_SECRETS_BACKLOG_CHECK = 50 + Math.floor(HTLC_TIMELOCK_SECS / ETH_BLOCK_TIME);

//The Minimum and maximum trade amounts
var MINIMUM_MINIMA_TRADE = 10;
var MAXIMUM_MINIMA_TRADE = 1000;

//MAIN NET RPC (Default)
var USE_API_KEYS			= true;
var ETH_INFURA_HOST 		= "https://mainnet.infura.io/v3/";
var ETH_INFURA_GASAPI_HOST 	= "https://gas.api.infura.io/networks/1/suggestedGasFees";
var ETHERSCAN_LINK			= "https://etherscan.io/tx/";

var USDTContractAddress 	= "0x"+("dAC17F958D2ee523a2206206994597C13D831ec7".toUpperCase());
var USDT_DECIMALS = 6;

var wMinimaContractAddress 	= "0x"+("669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF".toUpperCase());
var WMINIMA_DECIMALS = 18;

var HTLCContractAddress 	= "0x"+("67376c3bf3b5a336b14398920cfbc292013718ea".toUpperCase());

/**
 * Switch to the Sepolia ETH settings
 */
function setCurrentNetwork(callback){
	getNetwork(function(network){
		setNetwork(network, function(){
			if(callback){
				callback(network);
			}
		});
	});
}

function getNetwork(callback){
	MDS.keypair.get("_ethnetwork",function(getresult){
		if(getresult.status){
			callback(getresult.value);
		}else{
			callback("mainnet");	
		}
	});
}

function setNetwork(network,callback){
	
	//Check valid network
	if(network != "mainnet" && network != "sepolia"){
		MDS.log("ERROR - Attempt to switch to incorrect ETH Network! "+network);
		
		//Error - incorrect network
		if(callback){
			callback("");	
		}
		return;
	}
	
	MDS.keypair.set("_ethnetwork",network,function(setresult){
		
		switchNetwork(network);
		
		if(callback){
			callback(network);	
		}
	});	
}

function switchNetwork(network){

	MDS.log("Set ETH network to "+network);

	if(network == "mainnet"){
		
		//MAIN NET RPC
		USE_API_KEYS			= true;
		ETH_INFURA_HOST 		= "https://mainnet.infura.io/v3/";
		ETH_INFURA_GASAPI_HOST 	= "https://gas.api.infura.io/networks/1/suggestedGasFees";
		ETHERSCAN_LINK			= "https://etherscan.io/tx/";
		
		USDTContractAddress 	= "0x"+("dAC17F958D2ee523a2206206994597C13D831ec7".toUpperCase());
		USDT_DECIMALS = 6;
		
		wMinimaContractAddress 	= "0x"+("669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF".toUpperCase());
		WMINIMA_DECIMALS = 18;
		
		HTLCContractAddress 	= "0x"+("67376c3bf3b5a336b14398920cfbc292013718ea".toUpperCase());
	
	}else{
		
		//SEPOLIA RPC and Contract settings
		USE_API_KEYS			= true;
		ETH_INFURA_HOST 		= "https://sepolia.infura.io/v3/";
		ETH_INFURA_GASAPI_HOST 	= "https://gas.api.infura.io/networks/11155111/suggestedGasFees";
		ETHERSCAN_LINK			= "https://sepolia.etherscan.io/tx/";
		
		USDTContractAddress 	= "0x"+("b3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C".toUpperCase());
		USDT_DECIMALS = 18;
		
		wMinimaContractAddress 	= "0x"+("2Bf712b19a52772bF54A545E4f108e9683fA4E2F".toUpperCase());
		WMINIMA_DECIMALS = 18;
		
		HTLCContractAddress 	= "0x"+("D359f1A2C1026646a2FBaF1B4339F4b3449716aB".toUpperCase());	
	}
}

export { ETH_INFURA_GASAPI_HOST, MINIMUM_MINIMA_TRADE, MAXIMUM_MINIMA_TRADE };