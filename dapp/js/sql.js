
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

function createSecret(callback){
	
	//First create a random 32 byte
	MDS.cmd("random",function(random){
		
		var secret 	= random.response.random;
		var hash 	= random.response.hashed;
		
		//Insert into DB
		var sql = "INSERT INTO secret(secret,hash) VALUES ('"+secret+"','"+hash+"')";
		MDS.sql(sql,function(msg){
			callback(secret);
		});
	});
}

function getSecret(hash){
	
}
function getSecret(hash){
	
}