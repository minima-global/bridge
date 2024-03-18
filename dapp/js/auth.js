
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

function _getUserDetails(callback){
	
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

function createPrivateKey(callback){
	//First get the Private key.. WRITE function
	MDS.cmd("seedrandom modifier:ethbridge",function(resp){
		
		//The private key is based off the seed - so the same when you resync 
		callback(resp.response.seedrandom);
	});
}

function setBridgeUserDetails(userdets, callback){
	MDS.keypair.set("_bridgesystem_userdetails",JSON.stringify(userdets),function(init){
		if(callback){
			callback(init.status);	
		}
	});
}

function getBridgeUserDetails(callback){
	MDS.keypair.get("_bridgesystem_userdetails",function(getresult){
		if(getresult.status){
			callback(JSON.parse(getresult.value));
		}else{
			callback({});	
		}
	});
}

function isBridgeInited(callback){
	//Have we generated the Userdetails yet
	MDS.keypair.get("_initbridgesystems",function(init){
		callback(init.status);
	});
}

function initBridgeSystemsStartup(callback){
	
	MDS.log("Initialising base bridge systems..");
	
	//Create a private key
	createPrivateKey(function(privatekey){
	
		//Init ETH
		initialiseETHAddress(privatekey, function(ethaddress){
			
			//Now get the user details.. need ETH to havce started up
			_getUserDetails(function(userdets){
				
				//Set the private key
				userdets.ethprivatekey = privatekey;
				
				//Do some basic startup work..
				setUpHTLCScript(userdets, function(resp){
					
					//We want to be notified of Coin Events
					setupCoinSecretEvents(function(notify){
						
						//Set up the DB
						createDB(function(res){
						
							//Hard set USER_DETAILS as they don't ever change
							setBridgeUserDetails(userdets,function(){
								
								//And NOW - set init to TRUE
								MDS.keypair.set("_initbridgesystems","true",function(dets){
									callback(userdets);	
								});	
							});
						});	
					});
				});		
			});
		});
	});
}

function initBridgeSystems(callback){
	
	//Just do the normal
	getBridgeUserDetails(function(userdets){
		
		//Set the ETH details..
		setETHEREUMAddress(userdets.ethaddress);
		setETHPrivateKey(userdets.ethprivatekey);
		
		if(callback){
			callback(userdets);
		}
	});
}
