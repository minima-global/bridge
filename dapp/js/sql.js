
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
					+"  `htlc_info` varchar(256) NOT NULL, "
					+"  `eventdate` bigint NOT NULL "
					+" )";
			
			MDS.sql(myhtlccontracts,function(htlcmsg){
				
				var ethcontracts = "CREATE TABLE IF NOT EXISTS `ethtxns` ( "
						+"  `id` bigint auto_increment, "
						+"  `txnhash` varchar(128) NOT NULL, "
						+"  `transaction` varchar(1024) NOT NULL, "
						+"  `status` varchar(256) NOT NULL, "
						+"  `eventdate` bigint NOT NULL "
						+" )";


				var createIndexOnHTLCHash = "CREATE INDEX IF NOT EXISTS idx_myhtlc_hash ON myhtlc(hash);";
				var createIndexOnCPHash = "CREATE INDEX IF NOT EXISTS idx_counterparty_hash ON counterparty(hash)";

				MDS.sql(createIndexOnHTLCHash+createIndexOnCPHash, function(ethmsg) {
					MDS.sql(ethcontracts,function(ethmsg){
						
						var favourites = "CREATE TABLE IF NOT EXISTS `favs` ( "
							+"  `id` bigint auto_increment, "
							+"  `name` varchar(128) NOT NULL, "
							+"  `bridgeuid` varchar(1024) NOT NULL "
							+" )";
					
						MDS.sql(favourites,function(ethmsg){					
							
							if(callback){
								callback(ethmsg);
							}	
						});
					});
				})
				
			});	
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
function getRequestFromHash(hash, callback){
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

function insertNewHTLCContract(hashlock, reqamount, token, htlc_info, callback){
	
	//the date
	var recdate = new Date();

	//Insert into the DB	
	var sql = "INSERT INTO myhtlc(hash,reqamount,token,htlc_info,eventdate) "
					+"VALUES ('"+hashlock+"','"+reqamount+"','"+token+"','"+htlc_info+"',"+recdate.getTime()+")";
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

function logDeposit(token, amount, txnhash, callback){
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

function logApprove(token, txnhash,callback){
	_insertCounterPartyEvent("0x00",token,0,"CPTXN_APPROVE",txnhash,function(resp){
		if(callback){
			callback(resp);	
		}
	});
}

function insertSendETH(token,txnhash,amount,callback){
	_insertCounterPartyEvent("0x00",token,amount+"","CPTXN_SENDETH",txnhash,function(resp){
		if(callback){
			callback(resp);	
		}
	});
}

function getAllEvents(limit, offset, callback){
	MDS.sql(`SELECT *, CASE WHEN POSITION('-' IN TXNHASH) > 0 THEN SUBSTRING(TXNHASH, 1, POSITION('-' IN TXNHASH) - 1) ELSE TXNHASH END AS TXNHASH FROM counterparty WHERE TXNHASH != 'SECRET REVEALED' ORDER BY id DESC LIMIT ${limit} OFFSET ${offset};`, function(sqlmsg){
		callback(sqlmsg.rows);
	});
}

// SELECT * FROM counterparty WHERE TXNHASH != 'SECRET REVEALED' AND hash IN (SELECT DISTINCT hash FROM counterparty WHERE TXNHASH != 'SECRET REVEALED' ORDER BY hash DESC LIMIT ${max} OFFSET ${offset}) ORDER BY hash, eventdate DESC;
function getAllEventsForOrders(max = 10, offset = 0, callback){
	MDS.sql(`SELECT * FROM counterparty WHERE TXNHASH != 'SECRET REVEALED' AND hash IN (SELECT hash FROM (SELECT DISTINCT HASH FROM counterparty WHERE TXNHASH != 'SECRET REVEALED' ORDER BY hash DESC LIMIT ${max} OFFSET ${offset}) AS temp_hashes) ORDER BY hash DESC, eventdate DESC;`, function(sqlmsg){
		callback(sqlmsg.rows);
	});
}

function getAllOrders(callback){
	const query = `SELECT * FROM myhtlc ORDER BY id DESC limit 20`;
	MDS.sql(query, function(sqlmsg){
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

function insertEthTransaction(txnhash,transaction,callback){
	
	//the date
	var recdate = new Date();
	
	//Create a string version
	var dbtrans = encodeStringForDB(JSON.stringify(transaction));
	
	//Insert into DB
	var sql = "INSERT INTO ethtxns(txnhash,transaction,status,eventdate) "
	+"VALUES ('"+txnhash+"','"+dbtrans+"','WAITING',"+recdate.getTime()+")";
	MDS.sql(sql,function(msg){
		callback(msg);
	});
}

function getETHTransaction(txnhash, callback){
	MDS.sql("SELECT * FROM ethtxns WHERE txnhash='"+txnhash+"'", function(sqlmsg){
		callback(sqlmsg);
	});
}

function getAllETHTransaction(callback){
    MDS.sql("SELECT * FROM ethtxns WHERE status='WAITING'", function(sqlmsg){
        callback(sqlmsg);
    });
}

function changeStatusETHTransaction(txnhash, status, callback){
	MDS.sql("UPDATE ethtxns SET status='"+status+"' WHERE txnhash='"+txnhash+"'", function(sqlmsg){
		callback(sqlmsg);
	});
}

//FAVOURITES
function addFavourites(name, uid, callback){
	var sql = "INSERT INTO favs(name,bridgeuid) VALUES ('"+name+"','"+uid+"')";
	MDS.sql(sql,function(msg){
		callback(msg);
	});
}

function removeFavourite(id, callback){
	var sql = "DELETE FROM favs WHERE id="+id+"";
	MDS.sql(sql,function(msg){
		callback(msg);
	});
}

function removeAllFavourites(callback){
	var sql = "DELETE FROM favs WHERE name!=''";
	MDS.sql(sql,function(msg){
		callback(msg);
	});
}

function getFavourites(callback){
	MDS.sql("SELECT * FROM favs", function(sqlmsg){
		callback(sqlmsg);
	});
}



export { createDB, logWithdraw, haveSentCounterPartyTxn, getSingleEvent, getAllEvents, getAllEventsForOrders, getAllOrders, getFavourites, addFavourites, removeFavourite, removeAllFavourites };