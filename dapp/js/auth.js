
/**
 * Get the user Public key and Wallet address
 */
function _getUserMaximaPublicKey(callback){
	MDS.cmd("maxima",function(max){
		callback(max.response.publickey);
	});	
}

function _getUserMinimaPublicKey(callback){	
	//Get a Public key for this user
	MDS.cmd("keys modifier:0x00", function (getkey){
		callback(getkey.response.keys[0].publickey);
	});
}

function _getUserAddress(publickey,callback){
	var script = MAIN_ADDRESS.replace("*",publickey);
	MDS.cmd("runscript script:\""+script+"\"",function(resp){
		callback(resp.response.clean);
	});
}

function getUserDetails(callback){
	
	var userdetails = {};
	
	_getUserMinimaPublicKey(function(minpub){
		userdetails.minimapublickey = minpub;
		
		_getUserAddress(minpub,function(addr){
			userdetails.minimaaddress=addr;
		
			_getUserMaximaPublicKey(function(max){
				userdetails.maximapublickey=max;
				
				//Get the ETH Wallet address
				userdetails.ethaddress = getETHERUMAddress();
				
				//And your OTC UID
				userdetails.otcuid = minpub;
					
				//Send the details
				callback(userdetails);
			});	
		});
	});
}

function initETHSubSystem(callback){
	
	//First get the Private key.. WRITE function
	MDS.cmd("seedrandom modifier:ethbridge",function(resp){
		
		//The private key is based off the seed - so the same when you resync 
		var privateKey = resp.response.seedrandom;
		
		//Init the ETH subsystem..
		initialiseETH(privateKey,function(){
			callback(getETHERUMAddress());
		});
	});
}
