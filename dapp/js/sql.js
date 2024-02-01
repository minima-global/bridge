
function wipeDB(callback){
	//Run this..
	MDS.sql("DROP TABLE `secrets`",function(msg){
		if(callback){
			callback();
		}
	});
}


function createDB(callback){
	
	//Create the DB if not exists
	var initsql = "CREATE TABLE IF NOT EXISTS `secrets` ( "
				+"  `id` bigint auto_increment, "
				+"  `secret` varchar(128) NOT NULL, "
				+"  `hash` varchar(128) NOT NULL "
				+" )";
				
	//Run this..
	MDS.sql(initsql,function(msg){
		if(callback){
			callback(msg);
		}
	});
}

function createSecretHash(callback){
	
	//First create a random 32 byte
	MDS.cmd("random type:sha2",function(random){
		
		var secret 	= random.response.random;
		var hash 	= random.response.hashed;
		
		//Insert into DB
		var sql = "INSERT INTO secrets(secret,hash) VALUES ('"+secret+"','"+hash+"')";
		MDS.sql(sql,function(msg){
			callback(hash);
		});
	});
}

function getSecretFromHash(hash, callback){
	//Find a record
	var sql = "SELECT * FROM secrets WHERE hash='"+hash+"' LIMIT 1";
				
	//Run this..
	MDS.sql(sql,function(msg){
		if(msg.count>0){
			callback(msg.rows[0].SECRET);	
		}else{
			callback(null);
		}
	});
}

function checkSecret(secret, hash, callback){
	var cmd = "runscript script:\"LET hash=SHA2("+secret+")\"";
	MDS.cmd(cmd,function(resp){
		//Get the value
		var hashed = resp.response.variables.hash;
		
		//Are they the same
		callback(hash == hashed);
	});
}