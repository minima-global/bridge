
function startNativeSwap(userdets,amount, callback){
	
	//Get the current block
	getCurrentBlock(function(block){
		
		var timelock = +block+10;
		
		//Create a secret
		createSecretHash(function(hash){
			
			var state = {};
			state[0]  = userdets.minimapublickey;
			state[1]  = timelock;
			state[2]  = hash;
			 
			var cmd = "send fromaddress:"
			
		});	
	});
}