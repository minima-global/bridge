
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
		
		/*var logsql = "CREATE TABLE IF NOT EXISTS `logs` ( "
				+"  `id` bigint auto_increment, "
				+"  `event` varchar(128) NOT NULL, "
				+"  `secret` varchar(128) NOT NULL, "
				+"  `amount` varchar(128) NOT NULL, "
				+"  `details` varchar(1024) NOT NULL, "
				+"  `logdate` bigint NOT NULL "
				+" )";*/
				
		var counterpartytxn = "CREATE TABLE IF NOT EXISTS `counterparty` ( "
				+"  `id` bigint auto_increment, "
				+"  `hash` varchar(128) NOT NULL, "
				+"  `event` varchar(128) NOT NULL, "
				+"  `eventdate` bigint NOT NULL "
				+" )";
		
		MDS.sql(counterpartytxn,function(countermsg){
			if(callback){
				callback(msg);
			}	
		});
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

function insertSecret(secret,hash,callback){
	
	//do we already have it..
	getSecretFromHash(hash,function(secret){
		if(secret == null){
			//Check is Valid..
			checkSecret(secret,hash,function(valid){
				if(!valid){
					MDS.log("Attempt to add invalid secret.. ");
					if(callback){
						callback(false);	
					}
				}else{
					
					//Insert into the DB
					var sql = "INSERT INTO secrets(secret,hash) VALUES ('"+secret+"','"+hash+"')";
					MDS.sql(sql,function(msg){
						if(callback){
							callback(true);	
						}
					});
				}
			});	
		}else{
			if(callback){
				callback(true);	
			}
		}
	});
}

function checkSecret(secret, hash, callback){
	var cmd = "runscript script:\"LET hash=SHA2("+secret+")\"";
	MDS.cmd(cmd,function(resp){
		//Are they the same
		callback(hash == resp.response.variables.hash);
	});
}

/**
 * Counterparty events..
 */
function startedCounterPartySwap(hash,callback){
	_insertCounterPartyEvent(hash,"HTLC_STARTED",function(resp){
		if(callback){
			callback(resp);
		}
	});
}

function haveStartedCounterPartySwap(hash,callback){
	_checkCounterPartyEvent(hash,"HTLC_STARTED",function(resp){
		callback(resp);
	});
}

function sentCounterPartyTxn(hash,callback){
	_insertCounterPartyEvent(hash,"CPTXN_SENT",function(resp){
		if(callback){
			callback(resp);
		}
	});
}

function haveSentCounterPartyTxn(hash, callback){
	_checkCounterPartyEvent(hash,"CPTXN_SENT",function(resp){
		callback(resp);
	});
}

function _insertCounterPartyEvent(hash,event,callback){
	
	//the date
	var recdate = new Date();
	
	//Insert into DB
	var sql = "INSERT INTO counterparty(hash,event,eventdate) VALUES ('"+hash+"','"+event+"',"+recdate.getTime()+")";
	MDS.sql(sql,function(msg){
		callback(msg);
	});
}

function _checkCounterPartyEvent(hash,event,callback){
	MDS.sql("SELECT * FROM counterparty WHERE hash='"+hash+"' AND event='"+event+"'", function(sqlmsg){
		callback(sqlmsg.rows.length>0);
	});
}
