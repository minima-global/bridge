
function wipeDB(callback){
	//Run this..
	MDS.sql("DROP ALL OBJECTS",function(msg){
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
				+"  `hash` varchar(128) NOT NULL, "
				+"  `addeddate` bigint NOT NULL "
				+" )";
				
	//Run this..
	MDS.sql(initsql,function(msg){
		
		var counterpartytxn = "CREATE TABLE IF NOT EXISTS `counterparty` ( "
				+"  `id` bigint auto_increment, "
				+"  `hash` varchar(128) NOT NULL, "
				+"  `event` varchar(128) NOT NULL, "
				+"  `token` varchar(128) NOT NULL, "
				+"  `amount` varchar(128) NOT NULL, "
				+"  `txnhash` varchar(128) NOT NULL, "
				+"  `eventdate` bigint NOT NULL "
				+" )";
		
		MDS.sql(counterpartytxn,function(countermsg){
			
			var myhtlccontracts = "CREATE TABLE IF NOT EXISTS `myhtlc` ( "
					+"  `id` bigint auto_increment, "
					+"  `hash` varchar(128) NOT NULL, "
					+"  `reqamount` varchar(128) NOT NULL, "
					+"  `token` varchar(128) NOT NULL, "
					+"  `eventdate` bigint NOT NULL "
					+" )";
			
			MDS.sql(myhtlccontracts,function(htlcmsg){
				if(callback){
					callback(msg);
				}	
			});
			
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
		insertSecret(secret,hash,function(){
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
	getSecretFromHash(hash,function(getsecret){
		if(getsecret == null){
			//Check is Valid..
			checkSecret(secret,hash,function(valid){
				if(!valid){
					MDS.log("ERROR : Attempt to add invalid secret! secret:"+secret+" hash:"+hash);
					if(callback){
						callback(false);	
					}
				}else{
					//MDS.log("Insert new secret : "+secret+" / "+hash);
					
					//the date
					var recdate = new Date();
	
					//Insert into the DB
					var sql = "INSERT INTO secrets(secret,hash,addeddate) "
									+"VALUES ('"+secret+"','"+hash+"',"+recdate.getTime()+")";
					MDS.sql(sql,function(msg){
						if(callback){
							callback(true);	
						}
					});
				}
			});	
		}else{
			if(callback){
				callback(false);	
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
 * When you create an HTLC how much are you expecting in return
 */
function getReqamountFromHash(hash, callback){
	//Find a record
	var sql = "SELECT * FROM myhtlc WHERE hash='"+hash+"' LIMIT 1";
				
	//Run this..
	MDS.sql(sql,function(msg){
		if(msg.count>0){
			callback(msg.rows[0]);	
		}else{
			callback(null);
		}
	});
}

function insertNewHTLCContract(hashlock, reqamount, token, callback){
	
	//the date
	var recdate = new Date();

	//Insert into the DB
	var sql = "INSERT INTO myhtlc(hash,reqamount,token,eventdate) "
					+"VALUES ('"+hashlock+"','"+reqamount+"','"+token+"',"+recdate.getTime()+")";
	MDS.sql(sql,function(msg){
		if(callback){
			callback(msg);	
		}
	});
}

/**
 * Counterparty events..
 */
function startedCounterPartySwap(hash,token,amount,txnhash,callback){
	_insertCounterPartyEvent(hash,token,amount,"HTLC_STARTED",txnhash,function(resp){
		if(callback){
			callback(resp);
		}
	});
}

function sentCounterPartyTxn(hash,token,amount,txnhash,callback){
	_insertCounterPartyEvent(hash,token,amount,"CPTXN_SENT",txnhash,function(resp){
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

function collectHTLC(hash, token, amount, txnhash, callback){
	_insertCounterPartyEvent(hash,token,amount,"CPTXN_COLLECT",txnhash,function(resp){
		if(callback){
			callback(resp);
		}
	});
}

function haveCollectHTLC(hash, callback){
	_checkCounterPartyEvent(hash,"CPTXN_COLLECT",function(resp){
		callback(resp);
	});
}

function collectExpiredHTLC(hash, token, amount, txnhash,callback){
	_insertCounterPartyEvent(hash,token,amount,"CPTXN_EXPIRED",txnhash,function(resp){
		if(callback){
			callback(resp);
		}
	});
}

function haveCollectExpiredHTLC(hash, callback){
	_checkCounterPartyEvent(hash,"CPTXN_EXPIRED",function(resp){
		callback(resp);
	});
}

function logDeposit(token,amount, txnhash,callback){
	_insertCounterPartyEvent("0x00",token,amount,"CPTXN_DEPOSIT",txnhash,function(resp){
		if(callback){
			callback(resp);	
		}
	});
}

function logWithdraw(token, amount, txnhash,callback){
	_insertCounterPartyEvent("0x00",token,amount,"CPTXN_WITHDRAW",txnhash,function(resp){
		if(callback){
			callback(resp);	
		}
	});
}

function logApprove(txnhash,callback){
	_insertCounterPartyEvent("0x00","wminima",0,"CPTXN_APPROVE",txnhash,function(resp){
		if(callback){
			callback(resp);	
		}
	});
}

function getAllEvents(callback){
	MDS.sql("SELECT * FROM counterparty ORDER BY id", function(sqlmsg){
		callback(sqlmsg.rows);
	});
}

function getSingleEvent(hash,callback){
	MDS.sql("SELECT * FROM counterparty WHERE hash='"+hash+"' ORDER BY id", function(sqlmsg){
		callback(sqlmsg.rows);
	});
}

function wipeAllEvents(callback){
	MDS.sql("DELETE FROM counterparty WHERE eventdate>0", function(sqlmsg){
		if(callback){
			callback(sqlmsg);	
		}
	});
}

function _insertCounterPartyEvent(hash,token,amount,event,txnhash,callback){
	
	//the date
	var recdate = new Date();
	
	//Insert into DB
	var sql = "INSERT INTO counterparty(hash,event,token,amount,txnhash,eventdate) "
	+"VALUES ('"+hash+"','"+event+"','"+token+"','"+amount+"','"+txnhash+"',"+recdate.getTime()+")";
	MDS.sql(sql,function(msg){
		callback(msg);
	});
}

function _checkCounterPartyEvent(hash,event,callback){
	MDS.sql("SELECT * FROM counterparty WHERE hash='"+hash+"' AND event='"+event+"'", function(sqlmsg){
		callback(sqlmsg.rows.length>0);
	});
}
